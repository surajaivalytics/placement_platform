import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST: Add a new question to the round
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roundId } = await params;
        const body = await request.json();

        const { text, type, marks, options, codingMetadata, metadata } = body;

        if (!text || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const question = await prisma.mockQuestion.create({
            data: {
                roundId,
                text,
                type,
                points: marks || 1,
                options: options || [],
                codingMetadata: codingMetadata || (metadata ? JSON.parse(metadata) : undefined)
            }
        });

        return NextResponse.json({ question });
    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update an existing question
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id: questionId, text, type, marks, options, codingMetadata, metadata } = body;

        if (!questionId) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        const question = await prisma.mockQuestion.update({
            where: { id: questionId },
            data: {
                text,
                type,
                points: marks,
                options: options || [],
                codingMetadata: codingMetadata || (metadata ? JSON.parse(metadata) : undefined)
            }
        });

        return NextResponse.json({ question });

    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove a question
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; roundId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const questionId = searchParams.get('questionId');

        if (!questionId) {
            return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
        }

        await prisma.mockQuestion.delete({
            where: { id: questionId }
        });

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
