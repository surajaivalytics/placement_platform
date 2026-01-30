import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Log monitoring event
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { resultId, eventType, metadata } = body;

        if (!resultId || !eventType) {
            return NextResponse.json(
                { error: 'Result ID and event type are required' },
                { status: 400 }
            );
        }

        // Verify the result belongs to the user
        const result = await prisma.result.findUnique({
            where: { id: resultId },
            select: { userId: true }
        });

        if (!result || result.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const event = await prisma.monitoringEvent.create({
            data: {
                userId: session.user.id,
                resultId,
                eventType,
                details: metadata ? JSON.stringify(metadata) : undefined,
            }
        });

        return NextResponse.json({ event });
    } catch (error) {
        console.error('Error logging monitoring event:', error);
        return NextResponse.json(
            { error: 'Failed to log event' },
            { status: 500 }
        );
    }
}

// GET - Get monitoring events for a result
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resultId = searchParams.get('resultId');

        if (!resultId) {
            return NextResponse.json(
                { error: 'Result ID is required' },
                { status: 400 }
            );
        }

        // Verify access (user owns the result or is admin)
        const result = await prisma.result.findUnique({
            where: { id: resultId },
            select: { userId: true }
        });

        if (!result) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }

        if (session.user.role !== 'admin' && result.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const events = await prisma.monitoringEvent.findMany({
            where: { resultId },
            orderBy: { timestamp: 'asc' }
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Error fetching monitoring events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}
