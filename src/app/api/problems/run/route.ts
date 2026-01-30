import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { problemId, userCode, language } = await req.json();

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const testCases = typeof problem.testCases === 'string' ? JSON.parse(problem.testCases) : problem.testCases;
    const drivers = typeof problem.driverCode === 'string' ? JSON.parse(problem.driverCode as string) : (problem.driverCode as any);

    // Prepare Batch Submissions
    const submissions = testCases.map((tc: any) => {


      let fullcode = drivers[language];
      // Inject code and specific test case input
      fullcode = fullcode.replace("{{USER_CODE}}", userCode);

      Object.keys(tc.input).forEach((key)=>{
        const value= tc.input[key];


        const formattedValue= Array.isArray(value) ? value.join(","):value;

        const placeholder  = new RegExp(`{{${key}}}`,"g");

        fullcode=fullcode.replace(placeholder,formattedValue);

        console.log(fullcode);

      });

     

      return {
        language_id: language === "cpp" ? 54 : 71,
        source_code: Buffer.from(fullcode).toString('base64'),
        stdin: Buffer.from(JSON.stringify(tc.input)).toString('base64'),
        expected_output: Buffer.from(tc.output).toString('base64'),
      };
    });

    // Send to Judge0
    const response = await fetch("http://135.235.192.49:2358/submissions/batch?base64_encoded=true&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissions }),
    });

    let result = await response.json();

    // If wait=true didn't return stdout, poll using tokens
    if (Array.isArray(result) && result.length > 0 && !result[0].stdout) {
      const tokens = result.map((s: any) => s.token).join(",");
      await new Promise(resolve => setTimeout(resolve, 1500));
      const poll = await fetch(`http://135.235.192.49:2358/submissions/batch?tokens=${tokens}&base64_encoded=true`);
      const polledData = await poll.json();
      result = polledData.submissions;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}