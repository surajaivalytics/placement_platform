
import React from 'react';
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResultClient from "./result-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MockTestResultPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string }> }) {
    const params = await props.params;
    const { id } = params;

    // We can also use searchParams to get 'status' or just fetch the latest result.
    // Fetching from DB is more reliable for detailed view.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return notFound();

    // Fetch the specific result for this test
    // We want the LATEST result for this user and test
    const result = await prisma.result.findFirst({
        where: {
            userId: session.user.id,
            testId: id
        },
        orderBy: { createdAt: 'desc' },
        include: {
            test: true
        }
    });

    if (!result) {
        // Fallback if no result found (e.g. direct nav without submission, or error)
        // But if query params exist, we might render a partial view?
        // Let's just return notFound or a generic state for now.
        return <div className="p-8 text-center">Result not processing or found. Please check your dashboard.</div>;
    }

    return <ResultClient result={result} />;
}
