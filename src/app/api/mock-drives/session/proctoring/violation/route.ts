import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { enrollmentId, roundId, type, message } = await req.json();

        if (!enrollmentId || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Log violation
        // Since we don't have a dedicated Violation model yet, we can store it in MockRoundProgress.aiFeedback 
        // or just log to console for now if we don't want to change schema.
        // Actually, let's assume we want to track warnings.

        const progress = await prisma.mockRoundProgress.findUnique({
            where: { enrollmentId_roundId: { enrollmentId, roundId } }
        });

        if (progress) {
            // Append to feedback or just increment a count if we had one.
            // For now, let's just log it. In a real system, we'd have a ProctoringViolation model.
            console.log(`[PROCTORING VIOLATION] User ${userId}, Type: ${type}, Msg: ${message}`);

            // We could potentially update the progress with a warning count if the schema allowed.
            // As of now, schema has: status, score, totalQuestions, answeredQuestions, aiFeedback.

            await prisma.mockRoundProgress.update({
                where: { id: progress.id },
                data: {
                    proctoringLogs: `${progress.proctoringLogs || ''}\n[${new Date().toISOString()}] ${type}: ${message}`.trim()
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Violation Log Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
