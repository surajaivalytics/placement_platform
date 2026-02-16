import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: driveId, roundId } = await params;

        // 1. Verify Enrollment (Optional but good practice)
        // const enrollment = await prisma.mockDriveEnrollment.findFirst(...)

        // 2. Fetch Questions
        const questions = await prisma.mockQuestion.findMany({
            where: {
                roundId: roundId
            },
            select: {
                id: true,
                text: true,
                type: true,
                points: true,
                options: true, // Should be JSON array of { id, text }. isCorrect should be filtered out if it exists here!
                codingMetadata: true
            }
        });

        // 3. Sanitize Options (remove isCorrect if present in JSON)
        const sanitizedQuestions = questions.map(q => {
            let options = q.options as any[];
            if (Array.isArray(options)) {
                options = options.map(opt => ({
                    id: opt.id,
                    text: opt.text
                    // Omit isCorrect
                }));
            }
            return {
                ...q,
                options
            };
        });

        return NextResponse.json({ questions: sanitizedQuestions }, { status: 200 });

    } catch (error) {
        console.error('Error fetching round questions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
