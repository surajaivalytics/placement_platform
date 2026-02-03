import React from "react";
import { prisma } from "@/lib/prisma";
import ProblemsList from "./ProblemsList";

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

export default async function ProgrammingPage() {
  let CodingProblems: any[] = [];

  try {
    CodingProblems = await prisma.problem.findMany({
      orderBy: {
        id: 'asc'
      }
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    // Continue with empty array if table doesn't exist
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] p-6 md:p-12 transition-colors">
      <div className="max-w-6xl mx-auto">
        <ProblemsList problems={CodingProblems} />
      </div>
    </div>
  );
}