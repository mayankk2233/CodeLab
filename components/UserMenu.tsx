"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = session?.user;
  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "M";

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          signIn("google", { callbackUrl: "/" });
        }}
        className="btn border-neutral-300 dark:border-neutral-700 text-sm cursor-pointer"
      >
        Login
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:ring-2 hover:ring-blue-500 transition"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          userInitial
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-1 z-50">
          <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user.name || "User"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {user.email}
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Profile
          </Link>

          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
              setOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}