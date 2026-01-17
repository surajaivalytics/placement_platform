"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Assuming global prisma client
import { revalidatePath } from "next/cache";

export async function getOrCreatePlacementApplication(company: "TCS" | "Wipro") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Check if application exists
        let application = await prisma.placementApplication.findFirst({
            where: {
                userId,
                company,
            },
            include: {
                eligibilityCheck: true,
                assessmentStages: true,
            }
        });

        if (!application) {
            // Generate Candidate ID (Format: DT + Year + Random 6 digits)
            const year = new Date().getFullYear();
            const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random
            const candidateId = `DT${year}${random}`;

            // Create new application
            application = await prisma.placementApplication.create({
                data: {
                    userId,
                    company,
                    candidateId,
                    status: "eligibility_check",
                },
                include: {
                    eligibilityCheck: true,
                    assessmentStages: true,
                }
            });
        }

        // Self-healing: If existing application has no candidateId
        if (!application.candidateId) {
            const year = new Date().getFullYear();
            const random = Math.floor(100000 + Math.random() * 900000);
            const newId = `DT${year}${random}`;

            application = await prisma.placementApplication.update({
                where: { id: application.id },
                data: { candidateId: newId },
                include: {
                    eligibilityCheck: true,
                    assessmentStages: true,
                }
            });
        }

        // Fetch user details for profile display
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        return { application, user };

    } catch (error) {
        console.error("Error fetching/creating application:", error);
        return { error: "Failed to initialize application" };
    }
}

export async function checkEligibility(company: "TCS" | "Wipro") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { eligible: false, reason: "Not logged in" };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) return { eligible: false, reason: "User not found" };

    const criteria = {
        TCS: { tenth: 60, twelfth: 60, cgpa: 6.0, backlogs: 1 },
        Wipro: { tenth: 60, twelfth: 60, cgpa: 6.0, backlogs: 0 },
    };

    const rules = criteria[company];
    const reasons: string[] = [];

    if ((user.tenthPercentage || 0) < rules.tenth) reasons.push(`10th score < ${rules.tenth}%`);
    if ((user.twelfthPercentage || 0) < rules.twelfth) reasons.push(`12th score < ${rules.twelfth}%`);
    if ((user.graduationCGPA || 0) < rules.cgpa) reasons.push(`CGPA < ${rules.cgpa}`);
    if ((user.backlogs || 0) > rules.backlogs) reasons.push(`Backlogs > ${rules.backlogs}`);

    if (reasons.length > 0) {
        return { eligible: false, reasons };
    }

    return { eligible: true };
}

export async function updateAcademicDetails(company: "TCS" | "Wipro", data: {
    tenthPercentage: number;
    twelfthPercentage: number;
    graduationCGPA: number;
    backlogs: number;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                tenthPercentage: data.tenthPercentage,
                twelfthPercentage: data.twelfthPercentage,
                graduationCGPA: data.graduationCGPA,
                backlogs: data.backlogs
            }
        });

        revalidatePath(`/${company.toLowerCase()}-portal`);

        // Re-run eligibility check
        const eligibility = await checkEligibility(company);

        return { success: true, eligible: eligibility.eligible };
    } catch (error) {
        console.error("Update Academic Details Error:", error);
        return { success: false, error: "Failed to update details" };
    }
}
