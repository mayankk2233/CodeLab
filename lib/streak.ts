export function datesToSet(dates: Date[]) {
  const s = new Set<string>();
  dates.forEach(d => {
    const ds = new Date(d);
    ds.setHours(0,0,0,0);
    s.add(ds.toISOString());
  });
  return s;
}

export function computeStreak(dates: Date[]) {
  if (!dates.length) return { current: 0, longest: 0 };
  const days = Array.from(datesToSet(dates)).sort();
  let current = 1;
  let longest = 1;

  function toDay(d: string) { return new Date(d).getTime(); }

  for (let i = 1; i < days.length; i++) {
    const diff = (toDay(days[i]) - toDay(days[i - 1])) / (1000 * 60 * 60 * 24);
    current = diff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return { current, longest };
}