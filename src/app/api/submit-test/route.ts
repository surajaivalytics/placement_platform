
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { testId, answers, language = 'python' } = await req.json();

        // Fetch Test & Questions
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                questions: {
                    include: { options: true }
                }
            }
        });

        if (!test) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        const details: any[] = [];
        const codeAnswers: Record<string, string> = answers;

        let score = 0;
        let totalPossibleScore = 0;
        let codingPassed = true;

        // Iterate Questions
        for (const question of test.questions) {
            let questionScore = 0;
            let questionTotal = 0;
            let isCorrect = false;
            let userAnswer = null;
            let status = 'skipped'; // correct, incorrect, skipped, partial?

            if (question.type === 'coding') {
                questionTotal = 15;
                const userCode = codeAnswers[question.id];
                userAnswer = userCode;

                if (!userCode || userCode.trim() === '') {
                    codingPassed = false;
                    status = 'skipped';
                } else {
                    try {
                        // Parse Metadata for Test Cases
                        const metadata = question.metadata ? JSON.parse(question.metadata) : {};
                        const testCases = metadata.testCases || [];

                        let allCasesPassed = true;
                        let passedCount = 0;

                        // Execute ALL Test Cases against Piston
                        for (const testCase of testCases) {
                            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    language: language,
                                    version: '3.10.0', // Basic version assumption
                                    files: [{ content: userCode }],
                                    stdin: testCase.input
                                })
                            });

                            const data = await response.json();
                            const output = data.run?.output?.trim();
                            const expected = testCase.output?.trim();

                            if (output === expected) {
                                passedCount++;
                            } else {
                                allCasesPassed = false;
                            }
                        }

                        if (allCasesPassed && testCases.length > 0) {
                            questionScore = 15;
                            isCorrect = true;
                            status = 'correct';
                        } else {
                            // Partial or Fail
                            codingPassed = false;
                            status = 'incorrect';
                        }
                    } catch (e) {
                        console.error("Error executing code:", e);
                        codingPassed = false;
                        status = 'error';
                    }
                }
            } else {
                // MCQ / TrueFalse
                questionTotal = 1;
                const userAnswerId = answers[question.id];
                userAnswer = userAnswerId;

                const correctOption = question.options.find(o => o.isCorrect);

                if (userAnswerId) {
                    if (correctOption && userAnswerId === correctOption.id) {
                        questionScore = 1;
                        isCorrect = true;
                        status = 'correct';
                    } else {
                        status = 'incorrect';
                    }
                } else {
                    status = 'skipped';
                }
            }

            score += questionScore;
            totalPossibleScore += questionTotal;

            // Add to detailed breakdown
            details.push({
                questionId: question.id,
                text: question.text,
                type: question.type,
                userAnswer,
                correctMetadata: question.type === 'coding' ? 'Test Cases hidden' : question.options.find(o => o.isCorrect)?.text, // Store correct answer text
                score: questionScore,
                total: questionTotal,
                status
            });
        }

        // Determine Verdict
        // Pass if > 60% OR (if logic changes)
        const percentage = totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;
        const passed = percentage >= 60;

        // Update MockDriveSession
        // Find existing session or create one
        let driveSession = await prisma.mockDriveSession.findFirst({
            where: {
                userId: session.user.id,
                company: 'TCS',
                status: 'IN_PROGRESS'
            }
        });

        if (!driveSession) {
            driveSession = await prisma.mockDriveSession.create({
                data: {
                    userId: session.user.id,
                    company: 'TCS',
                    currentRound: 1,
                    status: 'IN_PROGRESS'
                }
            });
        }

        // Update Scores
        await prisma.mockDriveSession.update({
            where: { id: driveSession.id },
            data: {
                round1Score: score,
                currentRound: passed ? 2 : 1, // Advance to 2 (Tech) if passed
                status: passed ? 'IN_PROGRESS' : 'FAILED',
            }
        });

        // Also create a Result record for history
        await prisma.result.create({
            data: {
                userId: session.user.id,
                testId: testId,
                score: score,
                total: totalPossibleScore,
                details: details as any // Store JSON
            }
        });

        return NextResponse.json({
            score,
            total: totalPossibleScore,
            verdict: passed ? 'Passed' : 'Failed',
            nextRound: passed ? 2 : 1
        });

    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
