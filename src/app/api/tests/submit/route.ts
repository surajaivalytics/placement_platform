import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { testId, answers, score, total } = await req.json();

        if (!testId || !answers || score === undefined || total === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get test details for AI feedback
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

        // Generate AI feedback
        let aiFeedback = '';

        try {
            if (process.env.GEMINI_API_KEY) {
                const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

                const percentage = (score / total) * 100;
                const correctAnswers = score;
                const incorrectAnswers = total - score;

                const prompt = `You are an AI tutor providing personalized feedback for an aptitude test.

Test Details:
- Title: ${test.title}
- Difficulty: ${test.difficulty}
- Total Questions: ${total}
- Correct Answers: ${correctAnswers}
- Incorrect Answers: ${incorrectAnswers}
- Score: ${percentage.toFixed(1)}%

Please provide:
1. A brief performance summary (2-3 sentences)
2. Strengths identified (if score > 50%)
3. Areas for improvement
4. 3-4 specific actionable tips to improve performance
5. Motivational closing statement

Keep the feedback constructive, encouraging, and specific. Format it in a clear, readable way.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiFeedback = response.text();
            } else {
                // Fallback feedback if no API key
                const percentage = (score / total) * 100;
                aiFeedback = `Performance Summary:\nYou scored ${score} out of ${total} (${percentage.toFixed(1)}%).\n\n${percentage >= 80
                        ? 'Excellent work! You demonstrated strong understanding of the concepts.'
                        : percentage >= 60
                            ? 'Good effort! You have a solid foundation but there is room for improvement.'
                            : percentage >= 40
                                ? 'You are making progress. Focus on understanding the core concepts better.'
                                : 'Keep practicing! Review the fundamentals and try again.'
                    }\n\nKeep up the good work and continue practicing!`;
            }
        } catch (error) {
            console.error('AI feedback generation error:', error);
            // Use fallback feedback
            const percentage = (score / total) * 100;
            aiFeedback = `You scored ${score} out of ${total} (${percentage.toFixed(1)}%). Keep practicing to improve your skills!`;
        }

        // Save result to database
        const result = await prisma.result.create({
            data: {
                userId: session.user.id,
                testId,
                score,
                total,
                aiFeedback,
            },
            include: {
                test: true,
            },
        });

        return NextResponse.json({
            message: 'Test submitted successfully',
            result: {
                id: result.id,
                score: result.score,
                total: result.total,
                aiFeedback: result.aiFeedback,
                createdAt: result.createdAt,
                test: result.test,
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
