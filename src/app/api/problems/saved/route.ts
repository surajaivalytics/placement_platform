
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId");
    const language = searchParams.get("language");

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedSubmission = await prisma.submissions.findFirst({
      where: {
        userId: session.user.id,
        problemId: Number(problemId),
        language: language as string,
      },
     
      orderBy: { createdAt: "desc" }, 
    });

    if (!savedSubmission) {
      
      return NextResponse.json({ code: null }, { status: 200 });
    }

    return NextResponse.json(savedSubmission, { status: 200 });

  } catch (error: any) {
    console.error("FETCH_SAVED_CODE_ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}