import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeCode, mapPistonToStatus } from '@/lib/piston';
import { generateCodingEvaluation } from '@/lib/assessment-ai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { enrollmentId, roundId, questionId, code, language } = body;

        // 1. Fetch Question & Test Cases
        const question = await prisma.mockQuestion.findUnique({
            where: { id: questionId }
        });

        if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

        const metadata = question.codingMetadata as any || {};
        const testCases = metadata.testCases || [];

        // 2. Prepare Code for Execution
        const drivers = metadata.driverCode || {};
        let fullcode = drivers[language] || code;

        if (drivers[language]) {
            fullcode = fullcode.replace("{{USER_CODE}}", code);
        }

        // 3. Execute with Piston
        let runResults: any[] = [];
        if (testCases.length === 0) {
            const result = await executeCode(fullcode, language, "");
            runResults.push(result);
        } else {
            // Execute all test cases in parallel
            runResults = await Promise.all(
                testCases.map((tc: any) =>
                    executeCode(fullcode, language, tc.input?.toString().trim() || "")
                )
            );
        }

        const passedCases = runResults.filter((res: any, index: number) => {
            const status = mapPistonToStatus(res);
            const stdout = res.run.stdout.trim();
            const expected = testCases[index]?.output?.toString().trim() || "";
            return status.id === 3 && (testCases.length === 0 || stdout === expected);
        }).length;

        const totalCases = Math.max(testCases.length, 1);
        const score = (passedCases / totalCases) * 100;
        const isPassed = score >= 50; // Pass if score is 50% or more (Adjust as needed)

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
            const status = mapPistonToStatus(res);
            const stdout = res.run.stdout.trim();
            const expected = testCases[index]?.output?.toString().trim() || "";
            const passed = status.id === 3 && (testCases.length === 0 || stdout === expected);

            return {
                status: passed ? { id: 3, description: "Accepted" } : (status.id === 3 ? { id: 4, description: "Wrong Answer" } : status),
                stdout,
                stderr: res.run.stderr,
                compile_output: res.compile?.stderr || ""
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

    } catch (error: any) {
        console.error('Coding Submit Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
