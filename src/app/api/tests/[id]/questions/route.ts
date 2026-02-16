import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch test and its questions
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;

        // Fetch test with questions and options
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Test not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            test: {
                id: test.id,
                title: test.title,
                company: test.company,
                description: test.description,
            },
            questions: test.questions || [],
        });
    } catch (error) {
        console.error('Error fetching test questions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Add a question to a test
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;
        const body = await req.json();
        const { text, type = 'multiple-choice', marks = 1, options, metadata } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'Question text is required' },
                { status: 400 }
            );
        }

        // Verify test exists
        const test = await prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Test not found' },
                { status: 404 }
            );
        }

        // Prepare data for creation
        const questionData: any = {
            testId,
            text,
            type,
            marks: Number(marks),
            metadata, // For coding questions
        };

        // Add options if it's MCQ
        if (type === 'mcq' || type === 'multiple-choice') {
            if (Array.isArray(options) && options.length > 0) {
                questionData.options = {
                    create: options.map((opt: { text: string; isCorrect: boolean }) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect || false,
                    })),
                };
            }
        }

        // Create question
        const question = await prisma.question.create({
            data: questionData,
            include: {
                options: true,
            },
        });

        return NextResponse.json(
            { message: 'Question added successfully', question },
            { status: 201 }
        );
    } catch (error) {
        console.error('Question creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a question from a test
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;
        const { searchParams } = new URL(req.url);
        const questionId = searchParams.get('questionId');

        if (!questionId) {
            return NextResponse.json(
                { error: 'Question ID required' },
                { status: 400 }
            );
        }

        // Verify question belongs to this test
        const question = await prisma.question.findFirst({
            where: {
                id: questionId,
                testId: testId,
            },
        });

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found in this test' },
                { status: 404 }
            );
        }

        // Delete question (options will be deleted automatically due to cascade)
        await prisma.question.delete({
            where: { id: questionId },
        });

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Question deletion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
// PUT - Update a question
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;
        const body = await req.json();
        const { id, text, type, marks, options, metadata } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Question ID is required' },
                { status: 400 }
            );
        }

        // Verify question exists
        const existingQuestion = await prisma.question.findUnique({
            where: { id },
        });

        if (!existingQuestion) {
            return NextResponse.json(
                { error: 'Question not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {
            text,
            type,
            marks: Number(marks),
            metadata,
        };

        // Transaction to update question and options
        await prisma.$transaction(async (tx) => {
            // Update question basic details
            await tx.question.update({
                where: { id },
                data: updateData,
            });

            // If MCQ, handle options
            if (type === 'mcq' || type === 'multiple-choice') {
                if (Array.isArray(options) && options.length > 0) {
                    // Delete existing options
                    await tx.option.deleteMany({
                        where: { questionId: id },
                    });

                    // Create new options
                    await tx.option.createMany({
                        data: options.map((opt: { text: string; isCorrect: boolean }) => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect || false,
                            questionId: id,
                        })),
                    });
                }
            }
        });

        // Fetch updated question with options to return
        const updatedQuestion = await prisma.question.findUnique({
            where: { id },
            include: { options: true },
        });

        return NextResponse.json(
            { message: 'Question updated successfully', question: updatedQuestion },
            { status: 200 }
        );

    } catch (error) {
        console.error('Question update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
