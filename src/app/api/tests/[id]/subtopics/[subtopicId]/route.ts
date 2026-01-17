import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Delete a subtopic (Admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; subtopicId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId, subtopicId } = await params;

        // Verify subtopic belongs to the test
        const subtopic = await prisma.subtopic.findFirst({
            where: {
                id: subtopicId,
                testId: testId,
            },
        });

        if (!subtopic) {
            return NextResponse.json(
                { error: 'Subtopic not found or does not belong to this test' },
                { status: 404 }
            );
        }

        // Delete the subtopic (cascade will delete associated questions)
        await prisma.subtopic.delete({
            where: { id: subtopicId },
        });

        return NextResponse.json(
            { message: 'Subtopic deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Subtopic deletion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update a subtopic (Admin only)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; subtopicId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId, subtopicId } = await params;
        const { name, description, order } = await req.json();

        // Verify subtopic belongs to the test
        const subtopic = await prisma.subtopic.findFirst({
            where: {
                id: subtopicId,
                testId: testId,
            },
        });

        if (!subtopic) {
            return NextResponse.json(
                { error: 'Subtopic not found or does not belong to this test' },
                { status: 404 }
            );
        }

        // Update the subtopic
        const updatedSubtopic = await prisma.subtopic.update({
            where: { id: subtopicId },
            data: {
                name: name || subtopic.name,
                description: description !== undefined ? description : subtopic.description,
                order: order !== undefined ? order : subtopic.order,
            },
        });

        return NextResponse.json(
            { message: 'Subtopic updated successfully', subtopic: updatedSubtopic },
            { status: 200 }
        );
    } catch (error) {
        console.error('Subtopic update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
