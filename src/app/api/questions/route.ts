import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Create a new question
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { testId, text, type, category, difficulty, metadata, options } = body;

        if (!testId || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const question = await prisma.question.create({
            data: {
                testId,
                text,
                type: type || 'multiple-choice',
                category,
                difficulty,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
                options: {
                    create: options?.map((opt: any) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect || false
                    }))
                }
            },
            include: {
                options: true
            }
        });

        // Update subtopic count if needed (optional logic, but good for consistency)

        return NextResponse.json({ message: 'Question created', question }, { status: 201 });
    } catch (error) {
        console.error('Create Question Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Delete a question
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
        }

        await prisma.question.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete Question Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update an existing question
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, text, type, category, difficulty, metadata, options } = body;

        if (!id || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to ensure options are updated atomically
        const question = await prisma.$transaction(async (tx: any) => {
            // 1. Update basic question details
            const updatedQuestion = await tx.question.update({
                where: { id },
                data: {
                    text,
                    type,
                    category,
                    difficulty,
                    metadata: metadata ? JSON.stringify(metadata) : undefined, // Handle empty string/null
                },
            });

            // 2. Handle options if provided
            if (options && Array.isArray(options)) {
                // Delete existing options
                await tx.option.deleteMany({
                    where: { questionId: id }
                });

                // Create new options
                await tx.option.createMany({
                    data: options.map((opt: any) => ({
                        questionId: id,
                        text: opt.text,
                        isCorrect: opt.isCorrect || false
                    }))
                });
            }

            return updatedQuestion;
        });

        // Fetch fresh data to return
        const freshQuestion = await prisma.question.findUnique({
            where: { id },
            include: { options: true }
        });

        return NextResponse.json({ message: 'Question updated', question: freshQuestion });
    } catch (error) {
        console.error('Update Question Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
