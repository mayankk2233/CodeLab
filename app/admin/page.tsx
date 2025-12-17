import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const problems = await prisma.problem.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm">
        Demo mode: Access is open for presentation. In production, restrict to ADMIN users.
      </div>
      <Link href="/admin/new" className="btn border-neutral-300 w-fit">New Problem</Link>
      <div className="card p-4">
        <ul className="grid gap-2">
          {problems.map(p => (
            <li key={p.id} className="flex items-center justify-between border-b py-2">
              <span>{p.title}</span>
              <Link href={`/admin/edit/${p.slug}`} className="btn border-neutral-300">Edit</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
