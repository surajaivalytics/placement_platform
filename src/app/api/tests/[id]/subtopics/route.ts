import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/prisma-errors';

// GET subtopics for a test
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: testId } = await params;

        if (!testId) {
            return NextResponse.json(
                { error: 'Test ID is required' },
                { status: 400 }
            );
        }

        const subtopics = await prisma.subtopic.findMany({
            where: { testId },
            include: {
                _count: {
                    select: {
                        questions: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        // Get user progress if authenticated
        const session = await getServerSession(authOptions);
        let userProgress: Record<string, any> = {};

        if (session?.user?.id) {
            const progress = await prisma.userSubtopicProgress.findMany({
                where: {
                    userId: session.user.id,
                    subtopicId: {
                        in: subtopics.map(s => s.id),
                    },
                },
            });

            userProgress = progress.reduce((acc, p) => {
                acc[p.subtopicId] = p;
                return acc;
            }, {} as Record<string, any>);
        }

        const subtopicsWithProgress = subtopics.map(subtopic => ({
            ...subtopic,
            totalQuestions: subtopic._count.questions,
            progress: userProgress[subtopic.id] || null,
        }));

        return NextResponse.json({ subtopics: subtopicsWithProgress });
    } catch (error) {
        return handlePrismaError(error, 'Subtopics fetch');
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

        const { name, description, order } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Subtopic name is required' },
                { status: 400 }
            );
        }

        const subtopic = await prisma.subtopic.create({
            data: {
                testId,
                name,
                description,
                order,
            },
        });

        return NextResponse.json(
            { message: 'Subtopic created successfully', subtopic },
            { status: 201 }
        );
    } catch (error) {
        return handlePrismaError(error, 'Subtopic creation');
    }
}
