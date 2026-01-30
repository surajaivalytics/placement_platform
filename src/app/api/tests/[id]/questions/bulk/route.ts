import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Option {
    text: string;
    isCorrect: boolean;
}

interface RequestQuestion {
    text: string;
    type?: string;
    metadata?: string;
    options: Option[];
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { questions } = body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: 'Questions array is required' },
                { status: 400 }
            );
        }

        // Validate question format
        for (const q of questions) {
            const isCoding = q.type === 'coding';

            if (!q.text) {
                return NextResponse.json(
                    { error: 'Each question must have text' },
                    { status: 400 }
                );
            }

            if (!isCoding) {
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    return NextResponse.json(
                        { error: 'MCQ questions must have at least 2 options' },
                        { status: 400 }
                    );
                }

                const correctOptions = q.options.filter((o: Option) => o.isCorrect);
                if (correctOptions.length !== 1) {
                    return NextResponse.json(
                        { error: 'MCQ questions must have exactly one correct option' },
                        { status: 400 }
                    );
                }
            }
        }

        // Create questions in bulk
        const createdQuestions = await Promise.all(
            questions.map(async (q: RequestQuestion) => {
                const question = await prisma.question.create({
                    data: {
                        testId: id,
                        text: q.text,
                        type: q.type || 'multiple-choice',
                        metadata: q.metadata || null, // Ensure metadata is saved
                        options: {
                            create: q.options?.map((opt: Option) => ({
                                text: opt.text,
                                isCorrect: opt.isCorrect || false,
                            })) || [],
                        },
                    },
                    include: {
                        options: true,
                    },
                });
                return question;
            })
        );

        return NextResponse.json({
            success: true,
            count: createdQuestions.length,
            questions: createdQuestions,
        });
    } catch (error) {
        console.error('Error creating bulk questions:', error);
        return NextResponse.json(
            { error: 'Failed to create questions' },
            { status: 500 }
        );
    }
}
