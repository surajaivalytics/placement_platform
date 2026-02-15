import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; subtopicId: string }> }
) {
    try {
        const { id: testId, subtopicId } = await params;
        const body = await req.json();
        const { questions } = body;

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Validate subtopic ownership (optional but good practice)
        // For now, trust the ID.

        // Batch process to avoid transaction timeouts
        const BATCH_SIZE = 10;
        let successCount = 0;

        for (let i = 0; i < questions.length; i += BATCH_SIZE) {
            const batch = questions.slice(i, i + BATCH_SIZE);

            await prisma.$transaction(
                batch.map((q: any) =>
                    prisma.question.create({
                        data: {
                            testId: testId,
                            subtopicId: subtopicId,
                            text: q.text,
                            type: q.type || 'multiple-choice',
                            marks: Number(q.marks) || 1, // Default marks
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

            successCount += batch.length;
        }

        return NextResponse.json({ success: true, count: successCount });

    } catch (error) {
        console.error("Subtopic Bulk Import Error:", error);
        return NextResponse.json({ error: "Failed to import questions to subtopic" }, { status: 500 });
    }
}
