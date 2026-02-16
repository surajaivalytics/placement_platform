import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, roundId } = await params;

        const round = await prisma.mockRound.findUnique({
            where: {
                id: roundId,
                driveId: id
            },
            include: {
                questions: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!round) {
            return NextResponse.json({ error: 'Round not found' }, { status: 404 });
        }

        return NextResponse.json({ round });
    } catch (error) {
        console.error('Error fetching round:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, roundId } = await params;

        // Verify existence
        const round = await prisma.mockRound.findUnique({
            where: {
                id: roundId,
                driveId: id
            }
        });

        if (!round) {
            return NextResponse.json({ error: 'Round not found' }, { status: 404 });
        }

        await prisma.mockRound.delete({
            where: { id: roundId }
        });

        return NextResponse.json({ message: 'Round deleted successfully' });
    } catch (error) {
        console.error('Error deleting round:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, roundId } = await params;
        const body = await request.json();
        const { title, description, durationMinutes, metadata } = body;

        const round = await prisma.mockRound.update({
            where: {
                id: roundId,
                driveId: id
            },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(durationMinutes && { durationMinutes: parseInt(durationMinutes) }),
                ...(metadata && { metadata })
            }
        });

        return NextResponse.json({ round });
    } catch (error) {
        console.error('Error updating round:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
