import { prisma } from "@/lib/prisma";
import SolveClient from "./SolveClient";

export default async function SolvePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  // Await params (Next.js 15+)
  const { slug } = await params;

  const problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!problem) {
    return <div className="p-6 text-red-600 dark:text-red-400">Problem not found.</div>;
  }

  // Safely normalize examples to array
  const examples = Array.isArray(problem.examples)
    ? problem.examples
    : problem.examples
      ? [problem.examples]
      : [];

  return <SolveClient problem={{ ...problem, examples }} />;
}