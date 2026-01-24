
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EligibilityClient from "./eligibility-client";

export default async function EligibilityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect(`/login?callbackUrl=/exam/${id}/eligibility`);
    }

    const test = await prisma.test.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            eligibilityCriteria: true,
        }
    });

    if (!test) {
        notFound();
    }

    return (
        <EligibilityClient
            testId={test.id}
            testTitle={test.title}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            criteria={test.eligibilityCriteria as any}
        />
    );
}
