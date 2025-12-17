import { prisma } from "@/lib/prisma";
import ProblemsClient from "./ProblemsClient";

export const dynamic = "force-static";
export const revalidate = 0;

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const safe = problems.map((p) => ({
    ...p,
    tags: p.tags || [],
  }));

  return <ProblemsClient initialProblems={safe} />;
}