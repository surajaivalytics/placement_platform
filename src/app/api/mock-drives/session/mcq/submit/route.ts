import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateMCQEvaluation } from '@/lib/assessment-ai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { enrollmentId, roundId, answers } = body;
        // answers: { [questionId]: optionId }

        if (!enrollmentId || !roundId || !answers) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Fetch Questions for the round to score
        const round = await prisma.mockRound.findUnique({
            where: { id: roundId },
            select: { title: true }
        });

        const questions = await prisma.mockQuestion.findMany({
            where: { roundId },
            // include: { options: true } // Assuming options stored in JSON or relation
        });

        const responsesData: any[] = [];
        let score = 0;
        let totalScore = 0;

        questions.forEach(q => {
            const selectedOptionId = answers[q.id];
            const options: any[] = q.options as any[] || [];
            let isCorrect = false;

            // Find selected option (match by ID or synthetic index ID)
            const selectedOption = options.find((opt: any, idx: number) => {
                const optId = opt.id || `opt-${idx}`;
                return selectedOptionId === optId || selectedOptionId === opt.text;
            });

            if (selectedOption?.isCorrect) {
                isCorrect = true;
                score += q.points;
            }
            totalScore += q.points;

            responsesData.push({
                questionId: q.id,
                answer: selectedOptionId || "",
                isCorrect,
                score: isCorrect ? q.points : 0
            });
        });

        // 4. Save Responses & Update Progress in Transaction
        const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
        const normalizedScore = percentage;
        const isPassed = percentage >= 70;

        const categoryResults: Record<string, { correct: number; total: number }> = {};
        // Simplified category results for evaluation
        categoryResults['General'] = { correct: score, total: totalScore };

        // Generate AI Evaluation
        const aiEvaluation = await generateMCQEvaluation(
            percentage,
            questions.length,
            categoryResults,
            round?.title || 'MCQ Round'
        );

        await prisma.$transaction(async (tx) => {
            // Upsert Round Progress
            const progress = await tx.mockRoundProgress.upsert({
                where: { enrollmentId_roundId: { enrollmentId, roundId } },
                update: {
                    status: isPassed ? 'COMPLETED' : 'FAILED',
                    score: normalizedScore,
                    totalQuestions: questions.length,
                    answeredQuestions: Object.keys(answers).length,
                    completedAt: new Date(),
                    aiFeedback: JSON.stringify(aiEvaluation)
                },
                create: {
                    enrollmentId,
                    roundId,
                    status: isPassed ? 'COMPLETED' : 'FAILED',
                    score: normalizedScore,
                    totalQuestions: questions.length,
                    answeredQuestions: Object.keys(answers).length,
                    startedAt: new Date(),
                    completedAt: new Date(),
                    aiFeedback: JSON.stringify(aiEvaluation)
                }
            });

            // Clear old responses if any
            await tx.mockResponse.deleteMany({
                where: { roundProgressId: progress.id }
            });

            // Bulk Insert Responses
            await tx.mockResponse.createMany({
                data: responsesData.map(r => ({ ...r, roundProgressId: progress.id }))
            });

            // Update Enrollment Status/Score
            const enrollment = await tx.mockDriveEnrollment.findUnique({
                where: { id: enrollmentId },
                include: { drive: { include: { rounds: true } } }
            });

            if (enrollment) {
                const totalRounds = enrollment.drive.rounds.length;
                const currentRound = enrollment.currentRoundNumber;
                const isLastRound = currentRound >= totalRounds;

                if (isPassed) {
                    // Calculate new overall score as a running average percentage (0-100)
                    const updatedOverallScore = ((enrollment.overallScore * (currentRound - 1)) + normalizedScore) / currentRound;

                    await tx.mockDriveEnrollment.update({
                        where: { id: enrollmentId },
                        data: {
                            currentRoundNumber: isLastRound ? currentRound : currentRound + 1,
                            overallScore: updatedOverallScore,
                            status: isLastRound ? 'PASSED' : 'IN_PROGRESS'
                        }
                    });
                } else {
                    await tx.mockDriveEnrollment.update({
                        where: { id: enrollmentId },
                        data: { status: 'FAILED' }
                    });
                }
            }
        }, {
            maxWait: 10000,
            timeout: 30000
        });

        return NextResponse.json({ success: true, score, isPassed });

    } catch (error) {
        console.error('MCQ Submit Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
