'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { InterviewContext, getAIInterviewResponse } from '@/lib/interview-ai';

export async function generateQuestion(context: InterviewContext): Promise<{ question: string }> {
    try {
        const response = await getAIInterviewResponse(context);
        return { question: response.question };
    } catch (error) {
        console.error('Error generating question:', error);
        return {
            question: "I apologize, I'm having trouble connecting. Could you please check your internet connection?"
        };
    }
}
export async function saveInterviewResult(
    roundId: string,
    enrollmentId: string,
    evaluation: any,
    transcript: string
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) throw new Error('Unauthorized');

        const rawScore = evaluation.scores.overallHireability || 0;
        const scaledScore = rawScore * 10; // Scale to 100
        const isPassed = scaledScore >= 70;

        // Update / Create Round Progress
        await prisma.mockRoundProgress.upsert({
            where: {
                enrollmentId_roundId: {
                    enrollmentId,
                    roundId
                }
            },
            update: {
                status: 'COMPLETED',
                score: scaledScore,
                aiFeedback: JSON.stringify(evaluation),
                completedAt: new Date(),
            },
            create: {
                enrollmentId,
                roundId,
                status: 'COMPLETED',
                score: scaledScore,
                aiFeedback: JSON.stringify(evaluation),
                completedAt: new Date(),
            }
        });

        // Update enrollment progress
        const enrollment = await prisma.mockDriveEnrollment.findUnique({
            where: { id: enrollmentId },
            include: { drive: { include: { rounds: true } } }
        });

        if (enrollment) {
            const totalRounds = enrollment.drive.rounds.length;
            const currentRoundNumber = enrollment.currentRoundNumber;
            const isLastRound = currentRoundNumber >= totalRounds;

            if (isPassed) {
                // Calculate overall score as a running average percentage
                const newOverallScore = ((enrollment.overallScore * (currentRoundNumber - 1)) + scaledScore) / currentRoundNumber;

                await prisma.mockDriveEnrollment.update({
                    where: { id: enrollmentId },
                    data: {
                        currentRoundNumber: isLastRound ? currentRoundNumber : currentRoundNumber + 1,
                        overallScore: newOverallScore,
                        status: isLastRound ? 'PASSED' : 'IN_PROGRESS'
                    }
                });
            } else {
                await prisma.mockDriveEnrollment.update({
                    where: { id: enrollmentId },
                    data: {
                        status: 'FAILED'
                    }
                });
            }
        }

        // If this was an HR interview (usually the last round), we might want to mark enrollment as finished 
        // But for now, let's just revalidate the dashboard
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error saving interview result:', error);
        return { success: false, error: 'Failed to save results' };
    }
}
