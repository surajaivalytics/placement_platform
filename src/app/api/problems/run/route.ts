import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { executeCode, mapPistonToStatus } from "@/lib/piston";

export async function POST(req: Request) {
  try {
    const { problemId, userCode, language, languageId } = await req.json();

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const testCases = typeof problem.testCases === "string"
      ? JSON.parse(problem.testCases)
      : problem.testCases;

    const drivers = typeof problem.driverCode === "string"
      ? JSON.parse(problem.driverCode)
      : problem.driverCode;

    let fullcode = drivers[language];
    fullcode = fullcode.replace("{{USER_CODE}}", userCode);

    const formattedStdin = testCases.map((tc: any) => tc.input?.toString().trim() || "").join("\n");

    // Execute with Piston
    const pistonResult = await executeCode(fullcode, languageId || language, formattedStdin);
    const status = mapPistonToStatus(pistonResult);

    if (pistonResult.run.stdout || pistonResult.run.code === 0) {
      const decodedOutput = pistonResult.run.stdout.trim().replace(/\r/g, "");
      const actualOutputs = decodedOutput.split("\n");

      const results = testCases.map((tc: any, index: number) => {
        const actual = actualOutputs[index]?.trim();
        const expected = tc.output.toString().trim();
        return {
          id: tc.id,
          passed: actual === expected,
          actual: actual,
          expected: expected
        };
      });

      return NextResponse.json({
        success: results.every((r: any) => r.passed),
        results: results,
        time: "0.1",
        memory: "1024",
        status: status
      });
    }

    return NextResponse.json({
      success: false,
      status: status,
      compile_output: pistonResult.compile?.stderr || null,
      stderr: pistonResult.run.stderr || null,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}