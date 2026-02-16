import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all tests or a specific test
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const testId = searchParams.get('id');

        if (testId) {
            // Get specific test with questions
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

            return NextResponse.json({ test });
        } else {
            // Get all tests (optionally filtered by type)
            const type = searchParams.get('type');
            const excludeType = searchParams.get('exclude_type');

            const whereClause: any = {};
            if (type) {
                whereClause.type = type;
            } else if (excludeType) {
                whereClause.type = {
                    not: excludeType
                };
            }

            const tests = await prisma.test.findMany({
                where: whereClause,
                include: {
                    _count: {
                        select: {
                            questions: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return NextResponse.json({ tests });
        }
    } catch (error) {
        console.error('Tests fetch error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST - Create a new test (Admin only)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        console.log("Create Test Request Body:", JSON.stringify(body, null, 2));
        const { title, description, duration, difficulty, questions, type, company, topic } = body;

        if (!title || !duration || !difficulty) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create test payload
        const testData: any = {
            title,
            description,
            duration: parseInt(duration),
            difficulty,
            type: type || 'topic',
            company,
            topic,
        };

        // Only add questions if they exist and are not empty
        if (questions && Array.isArray(questions) && questions.length > 0) {
            testData.questions = {
                create: questions.map((q: { text: string; type?: string; category?: string; difficulty?: string; metadata?: any; options: Array<{ text: string; isCorrect: boolean }> }) => ({
                    text: q.text,
                    type: q.type || 'multiple-choice',
                    category: q.category,
                    difficulty: q.difficulty,
                    metadata: q.metadata ? JSON.stringify(q.metadata) : undefined,
                    options: {
                        create: q.options?.map((opt: { text: string; isCorrect: boolean }) => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect || false,
                        })),
                    },
                })),
            };
        }

        // Create test with questions
        const test = await prisma.test.create({
            data: testData,
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });
        console.log("Test Created in DB:", test.id);

        return NextResponse.json(
            { message: 'Test created successfully', test },
            { status: 201 }
        );
    } catch (error) {
        console.error('Test creation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = process.env.NODE_ENV === 'development' ? {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        } : undefined;

        return NextResponse.json(
            {
                error: 'Failed to create test',
                details: errorMessage,
                debug: errorDetails
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete a test (Admin only)
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const testId = searchParams.get('id');

        if (!testId) {
            return NextResponse.json(
                { error: 'Test ID required' },
                { status: 400 }
            );
        }

        await prisma.test.delete({
            where: { id: testId },
        });

        return NextResponse.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Test deletion error:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete test',
                details: error instanceof Error ? error.message : 'Unknown error',
                prismaCode: (error as any).code
            },
            { status: 500 }
        );
    }
}
