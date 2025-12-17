"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import ProblemFilters from "@/components/ProblemFilters";

const PAGE_SIZE = 25;

export default function ProblemsClient({ initialProblems }: { initialProblems: any[] }) {
  const [problems, setProblems] = useState(initialProblems);
  const [filtered, setFiltered] = useState(initialProblems);
  const [page, setPage] = useState(1);

  // Sync with server data
  useEffect(() => {
    setProblems(initialProblems);
    setFiltered(initialProblems);
    setPage(1);
  }, [initialProblems]);

  // Debug
  useEffect(() => console.log("PAGE CHANGED ->", page), [page]);
  useEffect(() => console.log("FILTERED LENGTH ->", filtered.length), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const current = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function handleFilter(updater: any) {
    const newList = typeof updater === "function" ? updater(problems) : updater;
    setFiltered(newList);
    setPage(1);
  }

  function handleRowClick(e: any, slug: string) {
    if (e.target.closest(".no-row-click")) return;
    window.location.href = `/problems/${slug}`;
  }

  function getPageNumbers() {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (i === 2 && page > 3) {
        pages.push("...");
      } else if (i === totalPages - 1 && page < totalPages - 2) {
        pages.push("...");
      }
    }
    return Array.from(new Set(pages));
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Problems</h1>

      <ProblemFilters problems={problems} onFilter={handleFilter} />

      <div className="card p-4 border rounded-lg bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2 px-2 w-12">#</th>
              <th className="py-2 px-2">Title</th>
              <th className="px-2">Difficulty</th>
              <th className="px-2">Tags</th>
              <th className="text-right px-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {current.map((p, index) => {
              if (!p.slug) return null;

              // NUMBERING LOGIC
              const number = (page - 1) * PAGE_SIZE + index + 1;

              return (
                <tr
                  key={p.id}
                  onClick={(e) => handleRowClick(e, p.slug)}
                  className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer last:border-0"
                >
                  <td className="py-3 px-2 text-neutral-500 dark:text-neutral-400 w-12">
                    {number}.
                  </td>

                  <td className="py-3 px-2">
                    <span className="hover:text-blue-600 dark:hover:text-blue-400 transition font-medium underline-offset-2 hover:underline text-neutral-900 dark:text-neutral-100">
                      {p.title}
                    </span>
                  </td>

                  <td className="px-2">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        p.difficulty === "EASY"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : p.difficulty === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>

                  <td className="text-neutral-600 dark:text-neutral-300 px-2">
                    {(p.tags || []).join(", ")}
                  </td>

                  <td className="text-right px-2 no-row-click">
                    <Link
                      href={`/problems/${p.slug}`}
                      className="inline-block px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      Solve
                    </Link>
                  </td>
                </tr>
              );
            })}

            {current.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-neutral-400 dark:text-neutral-500 text-center">
                  No problems match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 no-row-click select-none">
          
          {/* Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md border text-sm font-medium 
            border-neutral-300 dark:border-neutral-700 
            disabled:opacity-50 disabled:cursor-not-allowed 
            hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pg, i) =>
              pg === "..." ? (
                <span key={i} className="px-2 text-neutral-500 dark:text-neutral-400">...</span>
              ) : (
                <button
                  key={pg}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage(Number(pg));
                  }}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition 
                  ${
                    page === pg
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {pg}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md border text-sm font-medium 
            border-neutral-300 dark:border-neutral-700 
            disabled:opacity-50 disabled:cursor-not-allowed 
            hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}