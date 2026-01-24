
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type } = await req.json(); // type: 'technical' or 'hr'

        // Determine current round number based on type
        // Technical = Round 2, HR = Round 3
        const currentRoundInt = type === 'technical' ? 2 : 3;

        // Find existing session
        let driveSession = await prisma.mockDriveSession.findFirst({
            where: {
                userId: session.user.id,
                company: 'TCS',
                status: 'IN_PROGRESS'
            }
        });

        if (!driveSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Mark as passed (Assuming strict flow where finishing = passing for now, or user passed scores)
        // In a real app we'd validate scores. Here we trust the client flow calling this on "End Interview".

        let updateData: any = {};
        if (type === 'technical') {
            updateData = {
                currentRound: 3, // Advance to HR
                round2Score: 85, // Mock score or pass expected score
            };
        } else if (type === 'hr') {
            updateData = {
                currentRound: 4, // Completed
                round3Score: 90,
                status: 'COMPLETED'
            };
        }

        await prisma.mockDriveSession.update({
            where: { id: driveSession.id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            nextStage: type === 'technical' ? 'hr' : 'dashboard'
        });

    } catch (error) {
        console.error("Interview submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
