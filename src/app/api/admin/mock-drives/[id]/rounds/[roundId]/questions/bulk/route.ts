import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
        const { questions } = body;

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Transform and prepare data
        const questionsToCreate = questions.map((q: any) => {
            let codingMetadata = q.codingMetadata;
            if (q.type === 'coding' && !codingMetadata && q.metadata) {
                try {
                    codingMetadata = typeof q.metadata === 'string' ? JSON.parse(q.metadata) : q.metadata;
                } catch (e) {
                    console.error('Error parsing metadata for question:', q.text);
                }
            }

            const points = parseInt(q.marks || q.points || '1');
            return {
                roundId,
                text: q.text,
                type: q.type,
                points: isNaN(points) ? 1 : points,
                options: q.options || [],
                codingMetadata: codingMetadata || undefined
            };
        });

        // Use transaction to ensure all or nothing? Or createMany?
        // SQLite doesn't support createMany with relations, but we are on Postgres usually.
        // However, standard prisma createMany is fine here as we don't have nested relations to create,
        // just JSON fields.

        // Actually, createMany is supported for Postgres.
        await prisma.mockQuestion.createMany({
            data: questionsToCreate
        });

        return NextResponse.json({ message: `Successfully added ${questionsToCreate.length} questions` });
    } catch (error) {
        console.error('Error bulk uploading questions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
