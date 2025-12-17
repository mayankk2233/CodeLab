import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProblemDetail({ params }:{ params:{ slug:string } }) {
  const problem = await prisma.problem.findUnique({ where: { slug: params.slug } });
  if (!problem) return <div>Not found</div>;
  const examples = (problem.examples as any[]) || [];
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{problem.title}</h1>
      <div className="text-sm text-neutral-600 dark:text-neutral-300">{problem.description}</div>
      <div className="grid gap-2">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Examples</h2>
        <div className="grid gap-2">
          {examples.map((ex, i) => (
            <div key={i} className="card p-3">
              <div className="text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">Input:</span> {ex.input}
              </div>
              <div className="text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">Output:</span> {ex.output}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Link href={`/solve/${problem.slug}`} className="btn border-neutral-300 dark:border-neutral-700">
          Open Code Editor
        </Link>
      </div>
    </div>
  );
}
