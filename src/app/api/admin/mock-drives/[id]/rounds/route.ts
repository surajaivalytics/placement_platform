import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MockRoundType } from '@prisma/client';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id: driveId } = await params;
        const body = await req.json();
        const { title, type, description, durationMinutes } = body;

        if (!title || !type || !durationMinutes) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate type against enum
        if (!Object.values(MockRoundType).includes(type)) {
            return NextResponse.json({ error: 'Invalid round type' }, { status: 400 });
        }

        // Get current round count to set roundNumber
        const roundsCount = await prisma.mockRound.count({
            where: { driveId }
        });

        const round = await prisma.mockRound.create({
            data: {
                driveId,
                title,
                type: type as MockRoundType,
                description: description || '',
                durationMinutes: parseInt(durationMinutes),
                roundNumber: roundsCount + 1,
                metadata: {}
            }
        });

        return NextResponse.json({ round }, { status: 201 });
    } catch (error) {
        console.error('Create round error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
