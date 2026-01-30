"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveMockDrive(company: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const activeSession = await prisma.mockDriveSession.findFirst({
        where: {
            userId: session.user.id,
            company: company,
            status: "IN_PROGRESS"
        },
        orderBy: { updatedAt: 'desc' }
    });

    return activeSession;
}

export async function getLatestMockDrive(company: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const latestSession = await prisma.mockDriveSession.findFirst({
        where: {
            userId: session.user.id,
            company: company
        },
        orderBy: { updatedAt: 'desc' }
    });

    return latestSession;
}

export async function getMockDriveStatus(company: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { isAuthenticated: false };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            tenthPercentage: true,
            twelfthPercentage: true,
            graduationCGPA: true,
            backlogs: true,
            gapYears: true
        }
    });

    if (!user) return { isAuthenticated: false };

    // Check Eligibility (Standard TCS Criteria)
    // 60% in 10th, 12th, Graduation. No active backlogs. Max 2 years gap.
    const missingFields: string[] = [];
    if (user.tenthPercentage === null) missingFields.push("10th Percentage");
    if (user.twelfthPercentage === null) missingFields.push("12th Percentage");
    if (user.graduationCGPA === null) missingFields.push("Graduation CGPA");

    let isEligible = false;
    let eligibilityStatus = "PENDING_DATA"; // PENDING_DATA, ELIGIBLE, NOT_ELIGIBLE

    if (missingFields.length === 0) {
        const isTenthOk = (user.tenthPercentage ?? 0) >= 60;
        const isTwelfthOk = (user.twelfthPercentage ?? 0) >= 60;
        const isGradOk = (user.graduationCGPA ?? 0) >= 6.0; // Assuming CGPA Scale of 10
        const isBacklogsOk = (user.backlogs ?? 0) === 0;
        const isGapOk = (user.gapYears ?? 0) <= 2;

        if (isTenthOk && isTwelfthOk && isGradOk && isBacklogsOk && isGapOk) {
            isEligible = true;
            eligibilityStatus = "ELIGIBLE";
        } else {
            eligibilityStatus = "NOT_ELIGIBLE";
        }
    }

    // Check for Active Session
    const activeSession = await getActiveMockDrive(company);
    const latestSession = await getLatestMockDrive(company);

    return {
        isAuthenticated: true,
        user,
        missingFields,
        eligibilityStatus,
        activeSession,
        latestSession
    };
}

export async function createMockDrive(company: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Check if one exists
    const existing = await getActiveMockDrive(company);
    if (existing) return { success: true, sessionId: existing.id };

    try {
        const newSession = await prisma.mockDriveSession.create({
            data: {
                userId: session.user.id,
                company: company,
                currentRound: 1,
                status: "IN_PROGRESS"
            }
        });

        revalidatePath(`/${company.toLowerCase()}-portal`);
        return { success: true, sessionId: newSession.id };
    } catch (e) {
        console.error("Create Mock Drive Error", e);
        return { success: false, error: "Failed to create session" };
    }
}

export async function updateMockDriveProgress(sessionId: string, round?: number, score?: number, nextUrl?: string, status?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    const data: any = { updatedAt: new Date() };
    if (round) data.currentRound = round;
    if (nextUrl) data.lastActiveUrl = nextUrl;
    if (status) data.status = status;

    // Update score logic typically implies round completion
    if (score !== undefined) {
        // Logic to determine which round score to update could be dynamic or strict
        // For now, simpler to generic update
    }

    await prisma.mockDriveSession.update({
        where: { id: sessionId },
        data: data
    });
}

export async function completeMockDriveRound(sessionId: string, roundNumber: number, score: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    let updateData: any = {};

    // Logic: If round 1 complete -> set score -> move to round 2
    if (roundNumber === 1) {
        updateData = {
            round1Score: score,
            currentRound: 2,
            lastActiveUrl: "round-2/intro"
        };
    } else if (roundNumber === 2) {
        updateData = {
            round2Score: score,
            currentRound: 3,
            lastActiveUrl: "round-3/intro"
        }
    } else if (roundNumber === 3) {
        updateData = {
            round3Score: score,
            currentRound: 4, // Completed
            status: "COMPLETED",
            lastActiveUrl: "results"
        }
    }

    await prisma.mockDriveSession.update({
        where: { id: sessionId },
        data: updateData
    });
}
