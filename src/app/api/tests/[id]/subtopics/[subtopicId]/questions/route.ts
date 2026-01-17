import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET questions for a subtopic
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; subtopicId: string }> }
) {
    try {
        const { id: testId, subtopicId } = await params;

        // Verify subtopic belongs to test
        const subtopic = await prisma.subtopic.findFirst({
            where: {
                id: subtopicId,
                testId,
            },
        });

        if (!subtopic) {
            return NextResponse.json(
                { error: 'Subtopic not found' },
                { status: 404 }
            );
        }

        // Get questions for this subtopic
        const questions = await prisma.question.findMany({
            where: {
                subtopicId,
            },
            include: {
                options: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        return NextResponse.json({
            questions,
            subtopic: {
                id: subtopic.id,
                name: subtopic.name,
                description: subtopic.description,
            }
        });
    } catch (error) {
        console.error('Subtopic questions fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
