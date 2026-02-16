import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { enrollmentId, roundId, answerText, difficulty } = body;

        if (!enrollmentId || !roundId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Get/Create Round Progress
        let progress = await prisma.mockRoundProgress.findUnique({
            where: { enrollmentId_roundId: { enrollmentId, roundId } },
            include: {
                interviewInteractions: { orderBy: { orderIndex: 'asc' } },
                round: true // Fetch round to get metadata
            }
        });

        if (!progress) {
            progress = await prisma.mockRoundProgress.create({
                data: {
                    enrollmentId,
                    roundId,
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                },
                include: {
                    interviewInteractions: true,
                    round: true
                }
            });
        }

        const roundMetadata = progress.round?.metadata as any || {};
        const topics = roundMetadata.topics;
        const companyContext = roundMetadata.companyContext;
        const isHR = progress.round?.type === 'HR_INTERVIEW';
        const maxQuestions = roundMetadata.maxQuestions || 20;

        // Define new context variables for prompts
        const interviewType = isHR ? 'HR' : 'Technical';
        const companyName = companyContext ? companyContext : 'a company';
        const interviewContext = `${companyContext ? `Company Background: ${companyContext}. ` : ''}${!isHR && topics ? `Preferred Technical Topics: ${topics}.` : ''}`;


        // 2. Determine State (Start vs Continue)
        const previousInteractions = progress.interviewInteractions || [];
        const isFirstQuestion = previousInteractions.length === 0;

        // Limits

        let currentInteraction = previousInteractions[previousInteractions.length - 1];

        // Logic:
        // If it's first start -> Generate Q1 -> Create Interaction -> Return Q1.
        // If user sends answer -> Update last interaction with answer -> Evaluate -> Generate Q2 -> Create Interaction -> Return Q2 + Feedback.

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // SCENARIO 1: START NEW INTERVIEW
        if (isFirstQuestion && !answerText) {
            const prompt = `You are a professional ${interviewType} interviewer at ${companyName}.
            The candidate is appearing for an interview with the following difficulty level: ${difficulty || 'Medium'}.
            
            Based on the initial interview context: "${interviewContext}",
            generate a first question that is appropriate for the ${difficulty || 'Medium'} difficulty level.
            If the difficulty is "Easy", start with basic introductory or fundamental questions.
            If the difficulty is "Expert", start with complex architectural or deep troubleshooting questions.
            
            Keep the tone professional and encouraging.
            Response MUST be only the question text.`;

            const result = await model.generateContent(prompt);
            const question = result.response.text();

            await prisma.mockInterviewInteraction.create({
                data: {
                    roundProgressId: progress.id,
                    questionText: question,
                    orderIndex: 1
                }
            });

            return NextResponse.json({ question, feedback: null, isComplete: false });
        }

        // SCENARIO 2: ANSWERING A QUESTION
        if (currentInteraction && !currentInteraction.answerText && answerText) {
            // 1. Update Answer
            const evaluationPrompt = `
            Question: ${currentInteraction.questionText}
            Candidate Answer: ${answerText}
            
            Evaluate this answer on a scale of 1-10. Provide brief feedback.
            Format: JSON { "score": number, "feedback": "string", "sentiment": "POSITIVE"|"NEUTRAL"|"NEGATIVE" }
        `;

            // Mock evaluation if key missing or error, otherwise call API
            let evaluation = { score: 5, feedback: "Good attempt.", sentiment: "NEUTRAL" };
            try {
                const result = await model.generateContent(evaluationPrompt);
                const text = result.response.text();
                // Clean code block if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                evaluation = JSON.parse(jsonStr);
            } catch (e) {
                console.error("AI Eval failed", e);
            }

            await prisma.mockInterviewInteraction.update({
                where: { id: currentInteraction.id },
                data: {
                    answerText,
                    aiFeedback: evaluation.feedback,
                    score: evaluation.score,
                    sentiment: evaluation.sentiment
                }
            });

            // Check if we should end
            if (previousInteractions.length >= maxQuestions) {
                // Finish Round
                const allInteractions = await prisma.mockInterviewInteraction.findMany({ where: { roundProgressId: progress.id } });
                const avgScore = allInteractions.reduce((acc, curr) => acc + (curr.score || 0), 0) / allInteractions.length;

                // Generate a final summary evaluation using Gemini
                let finalAiFeedback = JSON.stringify({
                    scores: {
                        programmingFundamentals: avgScore,
                        oopConcepts: avgScore,
                        dsaBasics: avgScore,
                        collaboration: Math.min(10, avgScore + 2) // Bonus score for communication in interview
                    },
                    feedback: "Interview completed successfully.",
                    strengths: ["Communication"],
                    weaknesses: [],
                    overallVerdict: avgScore >= 7 ? "Hire" : "Maybe"
                });

                try {
                    const finalEvalPrompt = `
                        Evaluate the candidate's performance based on this interview:
                        Interactions: ${JSON.stringify(allInteractions.map(i => ({ q: i.questionText, a: i.answerText, s: i.score })))}
                        
                        Provide a brief summary and scores in JSON:
                        {
                            "scores": {
                                "programmingFundamentals": number (1-10),
                                "oopConcepts": number (1-10),
                                "dsaBasics": number (1-10),
                                "collaboration": number (1-10)
                            },
                            "feedback": "string",
                            "strengths": ["string"],
                            "weaknesses": ["string"],
                            "overallVerdict": "Hire" | "Maybe" | "Reject"
                        }
                    `;
                    const evalResult = await model.generateContent(finalEvalPrompt);
                    const evalText = evalResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    JSON.parse(evalText); // Validate JSON
                    finalAiFeedback = evalText;
                } catch (evalError) {
                    console.error("Final interview eval failed", evalError);
                }

                await prisma.mockRoundProgress.update({
                    where: { id: progress.id },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        score: avgScore * 10, // Scale to 100 for consistency
                        aiFeedback: finalAiFeedback
                    }
                });

                return NextResponse.json({ question: null, feedback: evaluation.feedback, isComplete: true });
            }

            // Generate NEXT Question
            const nextQPrompt = `You are a professional ${interviewType} interviewer at ${companyName}.
            The interview difficulty level is set to ${difficulty || 'Medium'}.
            
            Current Interview State:
            - Context: ${interviewContext}
            - Previous Interactions: ${JSON.stringify(previousInteractions)}
            - Latest Answer: "${answerText}"
            
            Your Task:
            1. Briefly evaluate the candidate's latest answer.
            2. Generate the next follow-up question.
            3. The question must be consistent with the ${difficulty || 'Medium'} difficulty level.
            4. If the candidate is performing well, gradually increase the complexity within the bounds of the ${difficulty} level.
            5. If the candidate is struggling, slightly simplify the next question while maintaining the ${difficulty} standard.
            
            Response MUST be only the next question text.`;
            const result = await model.generateContent(nextQPrompt);
            const nextQ = result.response.text();

            await prisma.mockInterviewInteraction.create({
                data: {
                    roundProgressId: progress.id,
                    questionText: nextQ,
                    orderIndex: previousInteractions.length + 1
                }
            });

            return NextResponse.json({ question: nextQ, feedback: evaluation.feedback, isComplete: false });
        }

        // SCENARIO 3: Resume (Front-end just asking for state?)
        if (currentInteraction && !currentInteraction.answerText && !answerText) {
            // Just return current waiting question
            return NextResponse.json({ question: currentInteraction.questionText, feedback: null, isComplete: false });
        }

        return NextResponse.json({ error: 'Invalid State' }, { status: 400 });

    } catch (error) {
        console.error('Interview API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
