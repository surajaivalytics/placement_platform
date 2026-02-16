import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeCode, mapPistonToStatus } from "@/lib/piston";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { roundId, questionId, code, language, languageId } = await req.json();

        // 1. Fetch Question
        const question = await prisma.mockQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

        const metadata = question.codingMetadata as any || {};
        const testCases = metadata.testCases || [];

        // 2. Prepare Code for Execution
        const drivers = metadata.driverCode || {};
        let fullcode = drivers[language] || code;

        if (drivers[language]) {
            fullcode = fullcode.replace("{{USER_CODE}}", code);
        }

        // 3. Execute all test cases using Piston
        if (testCases.length === 0) {
            // Default if no test cases defined
            const result = await executeCode(fullcode, languageId || language, "");
            const status = mapPistonToStatus(result);

            return NextResponse.json({
                success: status.id === 3,
                results: [{
                    id: 0,
                    passed: status.id === 3,
                    status: status,
                    stdout: result.run.stdout,
                    stderr: result.run.stderr,
                    compile_output: result.compile?.stderr || "",
                    time: "0.1",
                    memory: "1024"
                }]
            });
        }

        // Execute test cases in parallel
        const pistonResults = await Promise.all(
            testCases.map((tc: any) =>
                executeCode(fullcode, languageId || language, tc.input?.toString().trim() || "")
            )
        );

        // 4. Format Results
        const formattedResults = pistonResults.map((res: any, index: number) => {
            const status = mapPistonToStatus(res);
            const stdout = res.run.stdout.trim();
            const stderr = res.run.stderr.trim();
            const compile_output = res.compile?.stderr.trim() || "";
            const expected = testCases[index]?.output?.toString().trim() || "";

            // For Piston, we manually check if stdout matches expected output if status is Accepted
            let passed = status.id === 3 && stdout === expected;

            return {
                id: testCases[index]?.id || index,
                passed,
                status: passed ? { id: 3, description: "Accepted" } : (status.id === 3 ? { id: 4, description: "Wrong Answer" } : status),
                stdout,
                stderr,
                compile_output,
                time: "0.1",
                memory: "1024"
            };
        });

        return NextResponse.json({
            success: formattedResults.every(r => r.passed),
            results: formattedResults
        });

    } catch (error: any) {
        console.error('Coding Run Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
