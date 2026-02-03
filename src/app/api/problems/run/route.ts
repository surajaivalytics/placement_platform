import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // 1. Raw Text Formatting for Stdin
    const formattedStdin = testCases.map((tc: any) => tc.input.trim()).join("\n");

    const submissions = [
      {
        language_id: languageId,
        source_code: Buffer.from(fullcode).toString("base64"),
        stdin: Buffer.from(formattedStdin).toString("base64"),
      },
    ];

    // 2. Send to Judge0
    const response = await fetch("http://135.235.192.49:2358/submissions/batch?base64_encoded=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissions }),
    });

    const initialResult = await response.json();
    const tokens = initialResult.map((s: any) => s.token).join(",");

    // 3. Polling Logic
    async function pollbatch(tokens: string) {
      let attempts = 0;
      const MAX_ATTEMPTS = 20;
      while (attempts < MAX_ATTEMPTS) {
        const poll = await fetch(`http://135.235.192.49:2358/submissions/batch?tokens=${tokens}&base64_encoded=true`);
        const data = await poll.json();
        if (data.submissions) {
          const allDone = data.submissions.every((s: any) => s.status && s.status.id > 2);
          if (allDone) return data.submissions[0]; // Single batch return
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 1200));
      }
      throw new Error("Judge0 timeout");
    }

    const finalSubmission = await pollbatch(tokens);

    // 4. Comparison & Processing Logic
    if (finalSubmission.stdout) {
      const decodedOutput = Buffer.from(finalSubmission.stdout, "base64").toString().trim().replace(/\r/g, "");
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
        success: results.every(r => r.passed),
        results: results,
        time: finalSubmission.time,
        memory: finalSubmission.memory,
        status: finalSubmission.status
      });
    }

    // Return Error if no stdout (Compile Error / Runtime Error)
    return NextResponse.json({
      success: false,
      status: finalSubmission.status,
      compile_output: finalSubmission.compile_output ? Buffer.from(finalSubmission.compile_output, "base64").toString() : null,
      stderr: finalSubmission.stderr ? Buffer.from(finalSubmission.stderr, "base64").toString() : null,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}