
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TestRunnerClient from "./test-client";
import { redirect } from "next/navigation";

export default async function MockTestRunnerPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    if (!id) return notFound();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect(`/exam/${id}/eligibility`); // Or login
    }

    // Fetch Test
    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            questions: true, // Fetch questions for the runner
            subtopics: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!test) return notFound();

    // Fetch Session
    const driveSession = await prisma.mockDriveSession.findFirst({
        where: {
            userId: session.user.id,
            company: 'TCS', // Should likely be dynamic based on test, but assuming TCS flow for now or infer
            status: 'IN_PROGRESS'
        }
    });

    // If no session, we might want to create one? 
    // Or assume Dashboard created it. 
    // For now, pass null if none. The Client will handle "Start".
    // But actually, if no session, we probably shouldn't be here unless it's a direct link.
    // Let's pass what we found.

    return <TestRunnerClient test={test} session={driveSession} />;
}
