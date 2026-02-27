import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeCode } from '@/lib/judge0';
import { LANGUAGES } from '@/config/languages';
import { generateCodingEvaluation } from '@/lib/assessment-ai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { enrollmentId, roundId, questionId, code, language } = body;

        const judge0Id = (LANGUAGES as any)[language]?.judge0_id;
        if (!judge0Id) return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });

        // 1. Fetch Question & Test Cases
        const question = await prisma.mockQuestion.findUnique({
            where: { id: questionId }
        });

        if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

        const metadata = (question.codingMetadata as { testCases?: { input: string; output: string }[]; driverCode?: Record<string, string> }) || {};
        const testCases = metadata.testCases || [];

        // 2. Prepare Code for Execution
        const drivers = metadata.driverCode || {};
        let fullcode = drivers[language] || code;

        if (drivers[language]) {
            fullcode = fullcode.replace("{{USER_CODE}}", code);
        }

        // 3. Execute with Judge0
        let runResults: any[] = [];
        if (testCases.length === 0) {
            const result = await executeCode(fullcode, judge0Id, "");
            runResults.push(result);
        } else {
            // Execute all test cases in parallel
            runResults = await Promise.all(
                testCases.map((tc: { input?: string | number }) =>
                    executeCode(fullcode, judge0Id, tc.input?.toString().trim() || "")
                )
            );
        }

        const passedCases = runResults.filter((res: any, index: number) => {
            const stdout = (res.stdout || "").trim();
            const expected = testCases[index]?.output?.toString().trim() || "";
            return res.status.id === 3 && (testCases.length === 0 || stdout === expected);
        }).length;

        const totalCases = Math.max(testCases.length, 1);
        const score = (passedCases / totalCases) * 100;
        const isPassed = score >= 60;

        // Generate AI Evaluation
        const aiEvaluation = await generateCodingEvaluation(
            score,
            code,
            language,
            passedCases,
            totalCases,
            question.text,
            question.text
        );

        // 4. Save Response
        const progress = await prisma.mockRoundProgress.upsert({
            where: { enrollmentId_roundId: { enrollmentId, roundId } },
            update: {
                status: 'COMPLETED',
                completedAt: new Date(),
                score: score,
                totalQuestions: 1,
                answeredQuestions: 1,
                aiFeedback: JSON.stringify(aiEvaluation)
            },
            create: {
                enrollmentId,
                roundId,
                status: 'COMPLETED',
                completedAt: new Date(),
                score: score,
                totalQuestions: 1,
                answeredQuestions: 1,
                startedAt: new Date(),
                aiFeedback: JSON.stringify(aiEvaluation)
            }
        });

        await prisma.mockResponse.upsert({
            where: { roundProgressId_questionId: { roundProgressId: progress.id, questionId } },
            create: {
                roundProgressId: progress.id,
                questionId,
                answer: code,
                language,
                isCorrect: passedCases === totalCases,
                score,
                passedCases,
                totalCases,
                lastSavedAt: new Date()
            },
            update: {
                answer: code,
                language,
                isCorrect: passedCases === totalCases,
                score,
                passedCases,
                totalCases,
                lastSavedAt: new Date()
            }
        });

        // 5. Update Enrollment Logic
        const enrollment = await prisma.mockDriveEnrollment.findUnique({
            where: { id: enrollmentId },
            include: { drive: { include: { rounds: true } } }
        });

        if (enrollment) {
            const totalRounds = enrollment.drive.rounds.length;
            const currentRound = enrollment.currentRoundNumber;
            const isLastRound = currentRound >= totalRounds;

            if (isPassed) {
                // Calculate new overall score as a running average percentage (0-100)
                const updatedOverallScore = ((enrollment.overallScore * (currentRound - 1)) + score) / currentRound;

                await prisma.mockDriveEnrollment.update({
                    where: { id: enrollmentId },
                    data: {
                        currentRoundNumber: isLastRound ? currentRound : currentRound + 1,
                        overallScore: updatedOverallScore,
                        status: isLastRound ? 'PASSED' : 'IN_PROGRESS'
                    }
                });
            } else {
                await prisma.mockDriveEnrollment.update({
                    where: { id: enrollmentId },
                    data: { status: 'FAILED' }
                });
            }
        }

        // Transform results for UI compatibility if needed
        const formattedRunResults = runResults.map((res: any, index: number) => {
            const stdout = (res.stdout || "").trim();
            const expected = testCases[index]?.output?.toString().trim() || "";
            const passed = res.status.id === 3 && (testCases.length === 0 || stdout === expected);

            return {
                status: passed ? { id: 3, description: "Accepted" } : (res.status.id === 3 ? { id: 4, description: "Wrong Answer" } : res.status),
                stdout,
                stderr: res.stderr,
                compile_output: res.compile_output || ""
            };
        });

        return NextResponse.json({
            success: true,
            score,
            passedCases,
            totalCases,
            isPassed,
            results: formattedRunResults
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Coding Submit Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
    }
}
