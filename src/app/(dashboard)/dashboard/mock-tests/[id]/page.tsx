
import React from 'react';
import { prisma } from "@/lib/prisma";
import { MockTestInstructions } from './instructions-client';
import { notFound } from 'next/navigation';

export default async function MockTestLandingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            questions: {
                select: { id: true } // Just to count or verify existence
            },
            _count: {
                select: { questions: true }
            }
        }
    });

    if (!test) {
        notFound();
    }

    return (
        <MockTestInstructions test={test} />
    );
}
