// src/app/api/problems/submit/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, userCode, language, status } = body; 

    if (!problemId || !userCode || !language) {
      return NextResponse.json(
        { error: "problemId, userCode and language are required" },
        { status: 400 }
      );
    }

    await prisma.submissions.upsert({
      where: {
        userId_problemId_language: {
          userId: session.user.id,
          problemId: Number(problemId),
          language,
        },
      },
      update: {
        code: userCode,
        status: status || "Pending", 
      },
      create: {
        userId: session.user.id,
        problemId: Number(problemId),
        language,
        code: userCode,
        status: status || "Pending", 
      },
    });

    return NextResponse.json(
      { message: "Code submitted successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("SUBMIT_CODE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}