import { prisma } from "@/lib/prisma";


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      difficulty,
      type,
      expectedTime,
      expectedSpace,
      examples,
      starterTemplate,
      driverCode,
      testCases,
      constraints,
    } = body;

    const slug =
      body.slug ??
      title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!title?.trim() || !slug?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title, slug and description are required" },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        slug,
        description,
        constraints,
        difficulty,
        type,
        expectedTime,
        expectedSpace,
        examples,
        starterTemplate,
        driverCode,
        testCases,
      },
    });

    return NextResponse.json({ success: true, problem });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}
