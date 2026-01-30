import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const test = await prisma.test.findUnique({
            where: { id },
            include: {
                subtopics: {
                    orderBy: { order: 'asc' }
                },
                questions: {
                    include: {
                        options: true,
                        subtopic: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        return NextResponse.json(test);
    } catch (error) {
        console.error("Error fetching test:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.test.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error("Error deleting test:", error);
        return NextResponse.json({
            error: 'Failed to delete test',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}


