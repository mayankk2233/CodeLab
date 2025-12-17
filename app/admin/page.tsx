import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // Check authentication
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/');
  }

  const problems = await prisma.problem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Admin Dashboard</h1>

      <div className="rounded-xl border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
        ⚠️ Admin access only. Unauthorized access is logged.
      </div>

      <Link
        href="/admin/new"
        className="btn border-neutral-300 dark:border-neutral-700 w-fit px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      >
        + New Problem
      </Link>

      <div className="card p-4 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
        <ul className="grid gap-2">
          {problems.map(p => (
            <li key={p.id} className="flex items-center justify-between border-b dark:border-neutral-800 py-2 last:border-0">
              <span className="text-neutral-900 dark:text-neutral-100">{p.title}</span>
              <Link
                href={`/admin/edit/${p.slug}`}
                className="btn border-neutral-300 dark:border-neutral-700 px-3 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
