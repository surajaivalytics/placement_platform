
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

        let score = 0;
        let totalPossibleScore = 0;
        let codingPassed = true;

        // Iterate Questions
        for (const question of test.questions) {
            if (question.type === 'coding') {
                totalPossibleScore += 15;
                const userCode = codeAnswers[question.id];

                if (!userCode || userCode.trim() === '') {
                    codingPassed = false;
                    continue; // 0 marks
                }

                try {
                    // Parse Metadata for Test Cases
                    const metadata = question.metadata ? JSON.parse(question.metadata) : {};
                    const testCases = metadata.testCases || [];

                    let allCasesPassed = true;

                    // Execute ALL Test Cases against Piston
                    for (const testCase of testCases) {
                        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                language: language,
                                version: '3.10.0', // Basic version assumption, can be improved
                                files: [{ content: userCode }],
                                stdin: testCase.input
                            })
                        });

                        const data = await response.json();
                        const output = data.run?.output?.trim();
                        const expected = testCase.output?.trim();

                        if (output !== expected) {
                            allCasesPassed = false;
                            break;
                        }
                    }

                    if (allCasesPassed) {
                        score += 15;
                    } else {
                        codingPassed = false;
                    }

                } catch (e) {
                    console.error("Error executing code:", e);
                    codingPassed = false;
                }

            } else {
                // MCQ / TrueFalse
                totalPossibleScore += 1;
                const userAnswerId = answers[question.id];

                // Find correct option
                const correctOption = question.options.find(o => o.isCorrect);
                if (correctOption && userAnswerId === correctOption.id) {
                    score += 1;
                }
            }
        }

        // Determine Verdict
        // Pass if > 60% OR (if logic changes)
        const percentage = (score / totalPossibleScore) * 100;
        const passed = percentage >= 60;

        // Update MockDriveSession
        // Find existing session or create one
        let driveSession = await prisma.mockDriveSession.findFirst({
            where: {
                userId: session.user.id,
                company: 'TCS', // Assuming TCS context for now, ideally dynamic
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
                status: passed ? 'IN_PROGRESS' : 'FAILED', // Or keep in progress but force retry? User asked for "Correct answer same as in coding" implies strictness.
            }
        });

        // Also create a Result record for history
        await prisma.result.create({
            data: {
                userId: session.user.id,
                testId: testId,
                score: score,
                total: totalPossibleScore,
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
