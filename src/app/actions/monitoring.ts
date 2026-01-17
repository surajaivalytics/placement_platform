"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function logMonitoringEvent(company: string, type: string, message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.monitoringEvent.create({
            data: {
                userId: session.user.id,
                testType: company,
                violationType: type,
                details: message,
                timestamp: new Date()
            }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to log monitoring event", e);
        return { success: false, error: "Database error" };
    }
}

export async function getMonitoringEvents() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    try {
        const events = await prisma.monitoringEvent.findMany({
            where: { userId: session.user.id },
            orderBy: { timestamp: 'desc' }
        });
        return events;
    } catch (e) {
        return [];
    }
}
