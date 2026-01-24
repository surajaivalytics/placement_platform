import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: { id: string; subtopicId: string } }
) {
    try {
        const { id: testId, subtopicId } = params;
        const body = await req.json();
        const { questions } = body;

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Validate subtopic ownership (optional but good practice)
        // For now, trust the ID.

        const results = await prisma.$transaction(
            questions.map((q: any) =>
                prisma.question.create({
                    data: {
                        testId: testId, // Still linked to the main test
                        subtopicId: subtopicId, // LINKED TO SUBTOPIC
                        text: q.text,
                        type: q.type || 'multiple-choice',
                        metadata: q.metadata,
                        options: {
                            create: q.options?.map((o: any) => ({
                                text: o.text,
                                isCorrect: o.isCorrect
                            })) || []
                        }
                    }
                })
            )
        );

        return NextResponse.json({ success: true, count: results.length });

    } catch (error) {
        console.error("Subtopic Bulk Import Error:", error);
        return NextResponse.json({ error: "Failed to import questions to subtopic" }, { status: 500 });
    }
}
