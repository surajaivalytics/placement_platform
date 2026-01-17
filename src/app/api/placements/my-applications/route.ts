import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-errors";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applications = await prisma.placementApplication.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                eligibilityCheck: true,
                assessmentStages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                voiceAssessment: true,
            },
        });

        return NextResponse.json(applications);
    } catch (error) {
        return handlePrismaError(error, 'Fetch applications');
    }
}
