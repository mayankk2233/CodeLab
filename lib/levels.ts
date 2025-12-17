export const LEVEL_STEP = 100; // XP needed per level

export function xpForLevel(level: number) {
  return (level - 1) * LEVEL_STEP;
}

export function nextLevelAt(level: number) {
  return level * LEVEL_STEP;
}

export function addXp(currentXp: number, currentLevel: number, gained: number) {
  let xp = currentXp + gained;
  let level = currentLevel;
  while (xp >= nextLevelAt(level)) {
    level += 1;
  }
  return { xp, level };
}

export function rewardForDifficulty(diff: string) {
  if (diff === "EASY") return 10;
  if (diff === "MEDIUM") return 20;
  return 40; // HARD
}