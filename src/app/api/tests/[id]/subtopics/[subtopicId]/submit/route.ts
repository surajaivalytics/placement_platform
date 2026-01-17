import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Submit subtopic test
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; subtopicId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId, subtopicId } = await params;
        const { answers, timeSpent } = await req.json();

        // Verify subtopic belongs to test
        const subtopic = await prisma.subtopic.findFirst({
            where: {
                id: subtopicId,
                testId,
            },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!subtopic) {
            return NextResponse.json(
                { error: 'Subtopic not found' },
                { status: 404 }
            );
        }

        // Calculate score
        let score = 0;
        const total = subtopic.questions.length;

        subtopic.questions.forEach(question => {
            const userAnswer = answers[question.id];
            const correctOption = question.options.find(opt => opt.isCorrect);

            if (userAnswer && correctOption && userAnswer === correctOption.text) {
                score++;
            }
        });

        const percentage = total > 0 ? (score / total) * 100 : 0;

        // Save or update user progress
        const progress = await prisma.userSubtopicProgress.upsert({
            where: {
                userId_subtopicId: {
                    userId: session.user.id,
                    subtopicId,
                },
            },
            create: {
                userId: session.user.id,
                subtopicId,
                score,
                total,
                percentage,
                attempted: true,
                completed: true,
                answers: JSON.stringify(answers),
                timeSpent,
            },
            update: {
                score,
                total,
                percentage,
                completed: true,
                answers: JSON.stringify(answers),
                timeSpent,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: 'Subtopic test submitted successfully',
            result: {
                score,
                total,
                percentage,
                progress,
            },
        });
    } catch (error) {
        console.error('Subtopic submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
