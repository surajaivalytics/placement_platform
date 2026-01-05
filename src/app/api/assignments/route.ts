import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET - Get test assignments
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const testId = searchParams.get('testId');

        // If admin, can view all assignments
        if (session.user.role === 'admin') {
            const where: Prisma.TestAssignmentWhereInput = {};
            if (userId) where.userId = userId;
            if (testId) where.testId = testId;

            const assignments = await prisma.testAssignment.findMany({
                where,
                include: {
                    test: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            type: true,
                            company: true,
                            topic: true,
                            difficulty: true,
                            duration: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ assignments });
        }

        // Regular users can only see their own assignments
        const assignments = await prisma.testAssignment.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { isPublic: true }
                ]
            },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        type: true,
                        company: true,
                        topic: true,
                        difficulty: true,
                        duration: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}

// POST - Create test assignment
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { testId, userIds, isPublic } = body;

        if (!testId) {
            return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
        }

        // If public, create a single public assignment
        if (isPublic) {
            const assignment = await prisma.testAssignment.create({
                data: {
                    testId,
                    userId: 'public', // Special marker for public tests
                    assignedBy: session.user.id,
                    isPublic: true,
                },
                include: {
                    test: true
                }
            });

            return NextResponse.json({ assignment });
        }

        // Otherwise, create assignments for specific users
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'User IDs are required for non-public assignments' }, { status: 400 });
        }

        const assignments = await Promise.all(
            userIds.map((userId: string) =>
                prisma.testAssignment.upsert({
                    where: {
                        testId_userId: {
                            testId,
                            userId,
                        }
                    },
                    update: {},
                    create: {
                        testId,
                        userId,
                        assignedBy: session.user.id,
                        isPublic: false,
                    },
                    include: {
                        test: true
                    }
                })
            )
        );

        return NextResponse.json({ assignments });
    } catch (error) {
        console.error('Error creating assignment:', error);
        return NextResponse.json(
            { error: 'Failed to create assignment' },
            { status: 500 }
        );
    }
}

// DELETE - Remove test assignment
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const assignmentId = searchParams.get('id');

        if (!assignmentId) {
            return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
        }

        await prisma.testAssignment.delete({
            where: { id: assignmentId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        return NextResponse.json(
            { error: 'Failed to delete assignment' },
            { status: 500 }
        );
    }
}
