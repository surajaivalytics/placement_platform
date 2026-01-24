import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/prisma-errors';

// PATCH - Batch Update Orders
export async function PATCH(
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
        const { subtopics } = await req.json(); // Expect array of { id, order }

        if (!Array.isArray(subtopics)) {
            return NextResponse.json(
                { error: 'Invalid payload: subtopics array required' },
                { status: 400 }
            );
        }

        // Transaction to update all orders
        await prisma.$transaction(
            subtopics.map((item: { id: string; order: number }) =>
                prisma.subtopic.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        );

        return NextResponse.json({ message: 'Order updated successfully' });
    } catch (error) {
        return handlePrismaError(error, 'Subtopic reordering');
    }
}
