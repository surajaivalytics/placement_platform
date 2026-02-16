import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: driveId } = await params;

        const rounds = await prisma.mockRound.findMany({
            where: {
                driveId: driveId,
            },
            orderBy: {
                roundNumber: 'asc',
            },
        });

        return NextResponse.json({ rounds }, { status: 200 });
    } catch (error) {
        console.error('Error fetching mock rounds:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
