import { computeStreak } from "@/lib/streak";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {

  // User + XP + Level + Submission dates
  const user = await prisma.user.findUnique({
    where: { id: "demo-user" },
    include: {
      submissions: {
        select: { createdAt: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  // ✅ Streak Calculate
  const dates = user?.submissions.map(s => s.createdAt) ?? [];
  const streak = computeStreak(dates);

  // ✅ Last solved / attempted problem
  const last = await prisma.submission.findFirst({
    where: { userId: "demo-user" },
    include: { problem: true },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const total = await prisma.problem.count();
  const solved = await prisma.submission.count({
    where: { userId: "demo-user", status: "PASSED" }
  });

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;

  // Recent submissions
  const recent = await prisma.submission.findMany({
    where: { userId: "demo-user" },
    include: { problem: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <div className="grid gap-8">

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold">Welcome back 👋</h1>
        <p className="text-neutral-500 text-sm">Keep going—you're getting better every day.</p>
      </div>

      {/* ✅ CONTINUE SOLVING */}
      {last && (
        <Link
          href={`/problems/${last.problem.slug}`}
          className="card p-5 hover:shadow-md transition block"
        >
          <div className="text-sm text-neutral-500">Continue Solving</div>
          <div className="text-xl font-medium mt-1">{last.problem.title}</div>
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card p-5">
          <div className="text-neutral-500 text-sm">Total Problems</div>
          <div className="text-3xl font-semibold">{total}</div>
        </div>

        <div className="card p-5">
          <div className="text-neutral-500 text-sm">Solved</div>
          <div className="text-3xl font-semibold">{solved}</div>
        </div>

        <div className="card p-5">
          <div className="text-neutral-500 text-sm">XP / Level</div>
          <div className="text-3xl font-semibold">{xp} XP</div>
          <div className="text-sm text-neutral-600 mt-1">Level {level}</div>
        </div>

        {/* ✅ NEW STREAK CARD */}
        <div className="card p-5">
          <div className="text-neutral-500 text-sm">{streak.current >= 3 ? "🔥 Streak" : "Streak"}</div>
          <div className="text-3xl font-semibold">{streak.current} days</div>
          <div className="text-sm text-neutral-600 mt-1">Best: {streak.longest} days</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-5 max-w-xl">
        <div className="text-sm text-neutral-600 mb-2">Your Progress</div>
        <div className="w-full h-3 rounded-full bg-neutral-100 border overflow-hidden">
          <div className="h-full bg-neutral-800" style={{ width: `${(solved / total) * 100}%` }} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Recent Activity</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2">Problem</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={2}>No recent activity yet.</td></tr>
            )}
            {recent.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">
                  <Link href={`/problems/${r.problem.slug}`} className="hover:underline">
                    {r.problem.title}
                  </Link>
                </td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}