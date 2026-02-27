import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { enrollmentId, roundId, answers } = body;

        if (!enrollmentId || !roundId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Upsert the RoundProgress and set status to IN_PROGRESS
        const progress = await prisma.mockRoundProgress.upsert({
            where: { enrollmentId_roundId: { enrollmentId, roundId } },
            create: {
                enrollmentId,
                roundId,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
            },
            update: {
                status: 'IN_PROGRESS'
            }
        });

        if (progress.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Round already completed' }, { status: 400 });
        }

        // We could also save partial answers here if we want to be very robust
        // For now, most important is startedAt and status.
        // If answers is provided, we can save them.
        if (answers && typeof answers === 'object') {
            for (const [qId, ans] of Object.entries(answers)) {
                await prisma.mockResponse.upsert({
                    where: { roundProgressId_questionId: { roundProgressId: progress.id, questionId: qId } },
                    create: {
                        roundProgressId: progress.id,
                        questionId: qId,
                        answer: ans as string,
                        lastSavedAt: new Date()
                    },
                    update: {
                        answer: ans as string,
                        lastSavedAt: new Date()
                    }
                });
            }
        }

        return NextResponse.json({ success: true, savedAt: new Date() });

    } catch (error) {
        console.error('MCQ Autosave Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
