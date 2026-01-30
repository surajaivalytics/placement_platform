import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    if (!id) {
        return notFound();
    }

    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            subtopics: {
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });

    if (!test) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    let driveSession = null;
    let isEligible = false;
    if (userId) {
        driveSession = await prisma.mockDriveSession.findFirst({
            where: {
                userId: userId,
                company: 'TCS',
                status: 'IN_PROGRESS'
            }
        });

        // Check eligibility
        const eligibilityRecord = await prisma.testEligibility.findUnique({
            where: {
                userId_testId: {
                    userId: userId,
                    testId: id
                }
            }
        });
        isEligible = !!eligibilityRecord?.isEligible;
    }

    return <DashboardClient test={test} session={driveSession} isEligible={isEligible} />;
}
