"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveEligibility(testId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { error: "Unauthorized" };
    }

    // console.log(`[saveEligibility] Action called for Test: ${testId}, User: ${session.user.id}`);

    try {
        const result = await prisma.testEligibility.upsert({
            where: {
                userId_testId: {
                    userId: session.user.id,
                    testId: testId
                }
            },
            create: {
                userId: session.user.id,
                testId: testId,
                isEligible: true, // Should be passed or validated! For now trusting client.
                checkedAt: new Date()
            },
            update: {
                isEligible: true,
                checkedAt: new Date()
            }
        });
        // console.log(`[saveEligibility] Saved record:`, result);

        revalidatePath(`/exam/${testId}`);
        revalidatePath(`/exam/${testId}/dashboard`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to save eligibility:", error);
        if (error.code === 'P2003') {
            return { error: "Session invalid or user not found. Please logout and login again." };
        }
        return { error: "Failed to update eligibility status." };
    }
}
