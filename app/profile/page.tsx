import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Utility function for XP progress calculation
function calculateXpProgress(xp: number, level: number): number {
  const xpForNextLevel = level * 1000;
  const xpInCurrentLevel = xp % 1000;
  return Math.min((xpInCurrentLevel / 1000) * 100, 100);
}

export default async function ProfilePage() {
  // Require authentication
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/api/auth/signin');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          User not found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Your account was not found. Please try logging in again.
        </p>
      </div>
    );
  }

  // Fetch user stats
  const submissions = await prisma.submission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const solved = await prisma.submission.groupBy({
    by: ["problemId"],
    where: { userId, status: "PASSED" },
  });

  // XP + Level
  const xp = dbUser.xp || 0;
  const level = dbUser.level || 1;
  const xpProgress = calculateXpProgress(xp, level);

  // Get user info for display
  const userName = dbUser.name || session.user?.name || "User";
  const userEmail = dbUser.email || session.user?.email || "user@example.com";
  const userImage = dbUser.image || session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

  return (
    <div className="max-w-3xl mx-auto p-6 grid gap-6">

      {/* Profile Header */}
      <div className="card p-6 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
        <div className="flex items-center gap-4">

          {/* Avatar */}
          <img
            src={userImage}
            className="w-20 h-20 rounded-full border dark:border-neutral-600"
            alt="avatar"
          />

          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {userName}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">{userEmail}</p>
          </div>
        </div>

        {/* XP + Level */}
        <div className="mt-4">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Level {level}
          </p>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-3 rounded mt-1">
            <div
              className="bg-green-500 h-3 rounded transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">
            {xp} XP ({Math.floor(xpProgress)}% to next level)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{solved.length}</p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Problems Solved</p>
        </div>

        <div className="card p-4 text-center bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{submissions.length}</p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Submissions</p>
        </div>

        <div className="card p-4 text-center bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {new Set(submissions.map(s => s.language)).size}
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Languages Used</p>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card p-4 bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Recent Submissions
        </h2>

        {submissions.length === 0 && (
          <p className="text-neutral-500 dark:text-neutral-400">No submissions yet.</p>
        )}

        <div className="grid gap-3">
          {submissions.slice(0, 5).map((s) => (
            <div
              key={s.id}
              className="p-3 border rounded bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
            >
              <div className="flex justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${s.status === "PASSED"
                      ? "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300"
                      : "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300"
                    }`}
                >
                  {s.status}
                </span>

                <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                <b>Language:</b> {s.language}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                <b>Result:</b> {s.stdout}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}