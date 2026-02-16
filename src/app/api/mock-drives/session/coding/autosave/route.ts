import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { enrollmentId, roundId, questionId, code, language } = body;

        if (!enrollmentId || !roundId || !questionId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Upsert the response with current code
        // We also need to ensure RoundProgress exists
        const progress = await prisma.mockRoundProgress.upsert({
            where: { enrollmentId_roundId: { enrollmentId, roundId } },
            create: {
                enrollmentId,
                roundId,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
            },
            update: {
                status: 'IN_PROGRESS' // ensure logic doesn't revert COMPLETED? Maybe check status first. 
                // Autosave shouldn't happen if COMPLETED.
            }
        });

        if (progress.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Round already completed' }, { status: 400 });
        }

        await prisma.mockResponse.upsert({
            where: { roundProgressId_questionId: { roundProgressId: progress.id, questionId } },
            create: {
                roundProgressId: progress.id,
                questionId,
                answer: code,
                language,
                lastSavedAt: new Date()
            },
            update: {
                answer: code,
                language,
                lastSavedAt: new Date()
            }
        });

        return NextResponse.json({ success: true, savedAt: new Date() });

    } catch (error) {
        console.error('Coding Autosave Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
