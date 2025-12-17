"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full border-b dark:border-neutral-700 bg-white dark:bg-neutral-900 px-6 py-3 flex justify-between items-center">
      <Link href="/" className="text-lg font-semibold">
        HackerRank Lite
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/problems" className="hover:underline">Problems</Link>
        <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
        <Link href="/profile" className="hover:underline">Profile</Link>

        {session ? (
          <div className="flex items-center gap-2">
            <img src={session.user?.image || ""} alt="avatar" className="w-7 h-7 rounded-full" />
            <button
              onClick={() => signOut()}
              className="px-3 py-1 border rounded border-neutral-400 dark:border-neutral-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-3 py-1 border rounded border-neutral-400 dark:border-neutral-700"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}