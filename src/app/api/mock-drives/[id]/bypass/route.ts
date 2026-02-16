import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: driveId } = await params;
        const body = await req.json();
        const { id, roundId, roundNumber } = body; // Expect either id (enrollmentId) or derive it

        // 1. Verify Enrollment
        const enrollment = await prisma.mockDriveEnrollment.findUnique({
            where: {
                userId_driveId: {
                    userId: session.user.id,
                    driveId: driveId,
                },
            },
        });

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        // 2. Mark Round as Completed (MockRoundProgress)
        // We'll give a full score for bypass
        // check if progress exists
        const existingProgress = await prisma.mockRoundProgress.findUnique({
            where: {
                enrollmentId_roundId: {
                    enrollmentId: enrollment.id,
                    roundId: roundId,
                },
            },
        });

        if (existingProgress) {
            await prisma.mockRoundProgress.update({
                where: { id: existingProgress.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    score: 100,
                    aiFeedback: JSON.stringify({
                        scores: { programmingFundamentals: 10, oopConcepts: 10, dsaBasics: 10 },
                        feedback: "Round bypassed by system administrator/developer.",
                        strengths: ["Administrative bypass"],
                        weaknesses: [],
                        overallVerdict: "Hire"
                    }),
                },
            });
        } else {
            await prisma.mockRoundProgress.create({
                data: {
                    enrollmentId: enrollment.id,
                    roundId: roundId,
                    status: 'COMPLETED',
                    startedAt: new Date(),
                    completedAt: new Date(),
                    score: 100, // Dummy Perfect Score
                    totalQuestions: 1,
                    answeredQuestions: 1,
                    aiFeedback: JSON.stringify({
                        scores: { programmingFundamentals: 10, oopConcepts: 10, dsaBasics: 10 },
                        feedback: "Round bypassed by system administrator/developer.",
                        strengths: ["Administrative bypass"],
                        weaknesses: [],
                        overallVerdict: "Hire"
                    }),
                },
            });
        }

        // 3. Update Enrollment (Move to next round)
        const updatedEnrollment = await prisma.mockDriveEnrollment.findUnique({
            where: { id: enrollment.id },
            include: { drive: { include: { rounds: true } } }
        });

        if (updatedEnrollment) {
            const totalRounds = updatedEnrollment.drive.rounds.length;
            const currentRound = updatedEnrollment.currentRoundNumber;
            const isLastRound = currentRound >= totalRounds;

            // Bypass gives 100% for the round
            const bypassScore = 100;
            const updatedOverallScore = ((updatedEnrollment.overallScore * (currentRound - 1)) + bypassScore) / currentRound;

            await prisma.mockDriveEnrollment.update({
                where: { id: updatedEnrollment.id },
                data: {
                    currentRoundNumber: isLastRound ? currentRound : currentRound + 1,
                    overallScore: updatedOverallScore,
                    status: isLastRound ? 'PASSED' : 'IN_PROGRESS'
                },
            });
        }

        return NextResponse.json({ success: true, message: 'Round bypassed successfully' });

    } catch (error) {
        console.error('Bypass Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
