import { prisma } from "@/lib/prisma";
import SolveClient from "./SolveClient";

export default async function SolvePage({ params }: { params: { slug: string } }) {
  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
  });

  if (!problem) {
    return <div className="p-6 text-red-600">Problem not found.</div>;
  }

  // Warning: examples may be Array or Object → normalize it:
  let examples: any[] = [];

  if (Array.isArray(problem.examples)) {
    examples = problem.examples;
  } else if (problem.examples && typeof problem.examples === "object") {
    examples = [problem.examples];
  }

  return <SolveClient problem={{ ...problem, examples }} />;
}