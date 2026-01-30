import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CodeWorkspace from "./CodeWorkspace";

export default async function ProblemPage(props: {
  params: Promise<{ problemId: string }>;
}) {
  // ✅ unwrap params (VERY IMPORTANT)
  const { problemId } = await props.params;

  const id = Number(problemId);
  if (Number.isNaN(id)) notFound();

  const problem = await prisma.problem.findUnique({
    where: { id },
  });

  if (!problem) notFound();

  return (
    <CodeWorkspace problem={JSON.parse(JSON.stringify(problem))} />
  );
}
