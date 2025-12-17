import { computeStreak } from "@/lib/streak";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  // Check authentication
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/api/auth/signin');
  }

  // User + XP + Level + Submission dates
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      submissions: {
        select: { createdAt: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  // Handle case where user not found in database
  if (!user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          User Profile Not Found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Your account needs to be set up. Please contact support.
        </p>
      </div>
    );
  }

  // ✅ Streak Calculate
  const dates = user.submissions?.map(s => s.createdAt) ?? [];
  const streak = computeStreak(dates);

  // ✅ Last solved / attempted problem
  const last = await prisma.submission.findFirst({
    where: { userId },
    include: { problem: true },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const total = await prisma.problem.count();
  const solved = await prisma.submission.count({
    where: { userId, status: "PASSED" }
  });

  const xp = user.xp ?? 0;
  const level = user.level ?? 1;

  // Recent submissions
  const recent = await prisma.submission.findMany({
    where: { userId },
    include: { problem: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <div className="grid gap-8">

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Welcome back 👋
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Keep going—you're getting better every day.
        </p>
      </div>

      {/* ✅ CONTINUE SOLVING */}
      {last && (
        <Link
          href={`/problems/${last.problem.slug}`}
          className="card p-5 hover:shadow-md transition block bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg"
        >
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Continue Solving
          </div>
          <div className="text-xl font-medium mt-1 text-neutral-900 dark:text-neutral-100">
            {last.problem.title}
          </div>
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card p-5 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">Total Problems</div>
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">{total}</div>
        </div>

        <div className="card p-5 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">Solved</div>
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">{solved}</div>
        </div>

        <div className="card p-5 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">XP / Level</div>
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">{xp} XP</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Level {level}</div>
        </div>

        {/* ✅ NEW STREAK CARD */}
        <div className="card p-5 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
          <div className="text-neutral-500 dark:text-neutral-400 text-sm">
            {streak.current >= 3 ? "🔥 Streak" : "Streak"}
          </div>
          <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            {streak.current} days
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Best: {streak.longest} days
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-5 max-w-xl bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
        <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Your Progress</div>
        <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-700 overflow-hidden">
          <div
            className="h-full bg-neutral-800 dark:bg-neutral-200"
            style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
        <h2 className="font-semibold mb-3 text-neutral-900 dark:text-neutral-100">Recent Activity</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 dark:text-neutral-400">
              <th className="py-2">Problem</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={2} className="text-neutral-500 dark:text-neutral-400 py-4">
                  No recent activity yet.
                </td>
              </tr>
            )}
            {recent.map((r) => (
              <tr key={r.id} className="border-t dark:border-neutral-800">
                <td className="py-2">
                  <Link
                    href={`/problems/${r.problem.slug}`}
                    className="hover:underline text-neutral-900 dark:text-neutral-100"
                  >
                    {r.problem.title}
                  </Link>
                </td>
                <td className="text-neutral-700 dark:text-neutral-300">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}