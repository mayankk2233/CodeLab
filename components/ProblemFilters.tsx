"use client";

import { useState, useMemo } from "react";

export default function ProblemFilters({ problems, onFilter }: { problems: any[], onFilter: (p: any[]) => void }) {
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("");
  const [tag, setTag] = useState("");

  const tags = useMemo(() => {
    const s = new Set<string>();
    problems.forEach((p) => p.tags?.forEach((t: string) => s.add(t)));
    return Array.from(s).sort();
  }, [problems]);

  function applyFilters() {
    const q = search.trim().toLowerCase();
    const filtered = problems.filter((p) => {
      const matchSearch = q ? p.title.toLowerCase().includes(q) : true;
      const matchDiff = diff ? p.difficulty === diff : true;
      const matchTag = tag ? p.tags?.includes(tag) : true;
      return matchSearch && matchDiff && matchTag;
    });

    onFilter(filtered);
  }

  return (
    <div className="card p-4 grid gap-3 md:grid-cols-4">
      <input
        placeholder="Search problems..."
        className="border rounded-xl px-3 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="border rounded-xl px-3 py-2"
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
      >
        <option value="">All difficulties</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </select>

      <select
        className="border rounded-xl px-3 py-2"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <button
        onClick={applyFilters}
        className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm"
      >
        Apply Filters
      </button>
    </div>
  );
}