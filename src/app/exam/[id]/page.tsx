
import React from 'react';
import { prisma } from "@/lib/prisma";

import { notFound, redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MockTestLandingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect(`/login?callbackUrl=/exam/${id}`);
    }

    // We want to show the Dashboard first, then they click to check eligibility
    // So we DON'T redirect here anymore.

    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            questions: { select: { id: true } },
            _count: { select: { questions: true } }
        }
    });

    if (!test) {
        notFound();
    }

    // Dynamic Import to avoid SSR issues with client component if needed, 
    // but standard import is fine for now as CompanyDashboard is "use client"
    const MockTestInstructions = (await import('./instructions-client')).MockTestInstructions;

    return (
        <MockTestInstructions test={test} />
    );
}
