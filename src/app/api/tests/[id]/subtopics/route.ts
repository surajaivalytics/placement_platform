import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all subtopics for a test with user progress
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;

        // Fetch all subtopics for this test
        const subtopics = await prisma.subtopic.findMany({
            where: {
                testId: testId,
            },
            orderBy: {
                order: 'asc',
            },
            include: {
                _count: {
                    select: {
                        questions: true,
                    },
                },
                progress: {
                    where: {
                        userId: session.user.id,
                    },
                },
            },
        });

        // Transform the data to match the frontend interface
        const transformedSubtopics = subtopics.map((subtopic: any) => {
            const userProgress = subtopic.progress?.[0] || null;

            return {
                id: subtopic.id,
                name: subtopic.name,
                description: subtopic.description,
                totalQuestions: subtopic._count.questions,
                progress: userProgress
                    ? {
                        score: userProgress.score || 0,
                        total: userProgress.total || 0,
                        percentage: userProgress.percentage || 0,
                        completed: userProgress.completed,
                        attempted: userProgress.attempted,
                    }
                    : null,
            };
        });

        return NextResponse.json(
            { subtopics: transformedSubtopics },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching subtopics:', error);
        return NextResponse.json(
            { error: 'Internal server error', subtopics: [] },
            { status: 500 }
        );
    }
}

// POST - Create a new subtopic (Admin only)
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

        if (!testId) {
            return NextResponse.json(
                { error: 'Test ID is required' },
                { status: 400 }
            );
        }

        const { name, description, order, roundTitle, type } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Subtopic name is required' },
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

        // Create the subtopic
        const subtopic = await prisma.subtopic.create({
            data: {
                testId,
                name,
                description,
                order,
                roundTitle,
                type,
                totalQuestions: 0,
            },
        });

        return NextResponse.json(
            { message: 'Subtopic created successfully', subtopic },
            { status: 201 }
        );
    } catch (error) {
        console.error('Subtopic creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
