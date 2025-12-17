import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProblemDetail({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  // Await params (Next.js 15+)
  const { slug } = await params;

  const problem = await prisma.problem.findUnique({ where: { slug } });

  if (!problem) {
    notFound();
  }

  // Safely handle examples
  const examples = Array.isArray(problem.examples) ? problem.examples : [];

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {problem.title}
      </h1>
      <div className="text-sm text-neutral-600 dark:text-neutral-300">
        {problem.description}
      </div>
      <div className="grid gap-2">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Examples</h2>
        <div className="grid gap-2">
          {examples.map((ex: any, i: number) => (
            <div key={i} className="card p-3 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
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
        <Link
          href={`/solve/${problem.slug}`}
          className="btn border-neutral-300 dark:border-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Open Code Editor
        </Link>
      </div>
    </div>
  );
}
