import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    include: {
      submissions: { where: { status: "PASSED" } }
    }
  });

  const rows = users
    .map(u => ({
      name: u.name || u.email || "User",
      solved: u.submissions.length,
      xp: (u as any).xp ?? 0,
      level: (u as any).level ?? 1
    }))
    // Rank by XP first, then solved count
    .sort((a, b) => (b.xp - a.xp) || (b.solved - a.solved));

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2">User</th>
              <th>Solved</th>
              <th>Level</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2">{r.name}</td>
                <td>{r.solved}</td>
                <td>{r.level}</td>
                <td>{r.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}