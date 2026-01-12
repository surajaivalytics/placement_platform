import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: testId } = await params;
        const { answers } = await req.json();

        // Fetch test with questions
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                questions: {
                    include: {
                        options: true,
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

        // Calculate score
        let score = 0;
        const total = test.questions.length;

        test.questions.forEach((question) => {
            const userAnswer = answers[question.id];
            const correctOption = question.options.find((opt) => opt.isCorrect);

            if (userAnswer && correctOption && userAnswer === correctOption.text) {
                score++;
            }
        });

        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        // Generate AI feedback
        let aiFeedback = null;
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

            const prompt = `You are an educational AI assistant. A student just completed a test titled "${test.title}" with the following results:
- Score: ${score}/${total} (${percentage}%)
- Test Type: ${test.type === 'company' ? `Company Test (${test.company})` : `Aptitude Test (${test.topic})`}
- Difficulty: ${test.difficulty}

Provide constructive feedback in 2-3 paragraphs that:
1. Acknowledges their performance
2. Provides specific study recommendations
3. Encourages continued practice

Keep the tone supportive and motivating.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            aiFeedback = response.text();
        } catch (error) {
            console.error('AI feedback generation error:', error);
            // Continue without AI feedback if it fails
        }

        // Create result record
        const result = await prisma.result.create({
            data: {
                userId: session.user.id,
                testId: testId,
                score: score,
                total: total,
                aiFeedback: aiFeedback,
            },
        });

        return NextResponse.json({
            message: 'Test submitted successfully',
            result: {
                id: result.id,
                score: score,
                total: total,
                percentage: percentage,
                aiFeedback: aiFeedback,
            },
        });
    } catch (error) {
        console.error('Test submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
