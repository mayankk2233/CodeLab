import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

import Providers from "@/components/Providers";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "CodeLab",
  description: "Practice. Improve. Become Better.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {/* NAVBAR */}
          <nav className="border-b bg-white/70 backdrop-blur-md dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

              {/* Brand */}
              <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
              >
                CodeLab
              </Link>

              {/* Nav + Actions */}
              <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">

                <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/problems" className="hover:text-neutral-900 dark:hover:text-white transition">
                  Problems
                </Link>
                <Link href="/leaderboard" className="hover:text-neutral-900 dark:hover:text-white transition">
                  Leaderboard
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Avatar / Login Button */}
                <UserMenu />
              </div>
            </div>
          </nav>

          {/* PAGE CONTENT */}
          <main className="page-fade max-w-6xl mx-auto px-6 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}