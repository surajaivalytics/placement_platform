import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/prisma-errors';

// GET a specific test
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

        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                _count: {
                    select: {
                        questions: true,
                        subtopics: true,
                    },
                },
            },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Test not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ test });
    } catch (error) {
        return handlePrismaError(error, 'Test fetch');
    }
}


