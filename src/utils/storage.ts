import { Achievement, UserStats } from '../types';

const STATS_KEY = 'mathrush_user_stats_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'First Step',
    description: 'Solve your very first math puzzle',
    icon: '🎯',
    target: 1,
    current: 0,
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'ach_speed_demon',
    title: 'Speed Demon',
    description: 'Solve any puzzle in under 5 seconds',
    icon: '⚡',
    target: 1,
    current: 0,
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'ach_streak_flame',
    title: 'On Fire',
    description: 'Reach a streak of 10 consecutive correct answers',
    icon: '🔥',
    target: 10,
    current: 0,
    xpReward: 200,
    unlocked: false,
  },
  {
    id: 'ach_battle_gladiator',
    title: 'Math Gladiator',
    description: 'Win 5 Math Battles against opponents',
    icon: '⚔️',
    target: 5,
    current: 0,
    xpReward: 300,
    unlocked: false,
  },
  {
    id: 'ach_xp_master',
    title: 'XP Champion',
    description: 'Accumulate 1,000 Total XP in MathRush',
    icon: '💎',
    target: 1000,
    current: 120,
    xpReward: 250,
    unlocked: false,
  },
  {
    id: 'ach_math_master',
    title: 'Level 25 Calculator',
    description: 'Reach Level 25 and earn the Calculator rank',
    icon: '🥈',
    target: 25,
    current: 1,
    xpReward: 500,
    unlocked: false,
  },
];

export function getInitialUserStats(): UserStats {
  return {
    xp: 120,
    level: 2,
    title: 'Beginner',
    streak: 1,
    maxStreak: 3,
    lives: 3,
    maxLives: 3,
    lastLifeRefillTimestamp: Date.now(),
    lastPlayedDate: new Date().toISOString().split('T')[0],
    dailyCompletedDates: [],
    puzzlesSolved: 4,
    accuracyRate: 90,
    avgTimeSeconds: 12.4,
    battleElo: 1200,
    battleWins: 2,
    battleLosses: 0,
    bestQuickScore: 8,
    bestStreakScore: 5,
    achievements: [],
    isPro: false,
    name: 'MathNinja_' + Math.floor(Math.random() * 900 + 100),
    avatar: '🦊',
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: false,
    reminderTime: '09:00',
  };
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getInitialUserStats();
    const parsed = JSON.parse(raw);
    const withLives = checkLivesRegeneration(parsed);
    return syncStatsWithXp(withLives);
  } catch {
    return getInitialUserStats();
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getTitleForLevel(level: number): string {
  if (level >= 201) return '👑 Grandmaster';
  if (level >= 101) return '💎 Genius';
  if (level >= 51) return '🥇 Math Master';
  if (level >= 26) return '🥈 Calculator';
  if (level >= 11) return '🥉 Easy Explorer';
  return '🥉 Beginner';
}

export function getXpRequiredForLevel(level: number): number {
  // Progressive XP threshold needed to advance from level L to level L+1
  return Math.floor(100 * Math.pow(level, 1.35));
}

/**
 * Calculates current level, cumulative floor XP, next level target XP, and progress percentage
 * directly from total cumulative XP.
 */
export function calculateLevelFromXp(xp: number): {
  level: number;
  currentTotalXp: number;
  currentLevelFloorXp: number;
  nextLevelTargetXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let level = 1;
  let currentLevelFloorXp = 0;
  let nextLevelTargetXp = getXpRequiredForLevel(1);

  while (safeXp >= nextLevelTargetXp) {
    level++;
    currentLevelFloorXp = nextLevelTargetXp;
    nextLevelTargetXp += getXpRequiredForLevel(level);
  }

  const xpInCurrentLevel = safeXp - currentLevelFloorXp;
  const xpNeededForLevel = Math.max(1, nextLevelTargetXp - currentLevelFloorXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)));

  return {
    level,
    currentTotalXp: safeXp,
    currentLevelFloorXp,
    nextLevelTargetXp,
    progressPercent,
  };
}

/**
 * Returns level progress where currentLevelXp is the player's total cumulative XP
 * and nextLevelXp is the total cumulative XP required to reach the next level.
 */
export function getLevelProgress(xp: number, _currentLevel?: number): {
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  level: number;
} {
  const { level, currentTotalXp, nextLevelTargetXp, progressPercent } = calculateLevelFromXp(xp);
  return {
    currentLevelXp: currentTotalXp,
    nextLevelXp: nextLevelTargetXp,
    progressPercent,
    level,
  };
}

export function syncStatsWithXp(stats: UserStats): UserStats {
  const { level } = calculateLevelFromXp(stats.xp);
  return {
    ...stats,
    level,
    title: getTitleForLevel(level),
  };
}

export function addXp(stats: UserStats, earnedXp: number): { updated: UserStats; leveledUp: boolean; newLevel: number } {
  const newXp = Math.max(0, (stats.xp || 0) + earnedXp);
  const oldLevelInfo = calculateLevelFromXp(stats.xp || 0);
  const newLevelInfo = calculateLevelFromXp(newXp);
  const leveledUp = newLevelInfo.level > oldLevelInfo.level;

  const updated: UserStats = {
    ...stats,
    xp: newXp,
    level: newLevelInfo.level,
    title: getTitleForLevel(newLevelInfo.level),
  };

  saveUserStats(updated);
  return { updated, leveledUp, newLevel: newLevelInfo.level };
}

export function checkLivesRegeneration(stats: UserStats): UserStats {
  if (stats.lives >= stats.maxLives) {
    return { ...stats, lastLifeRefillTimestamp: Date.now() };
  }

  const REFILL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes per life
  const now = Date.now();
  const elapsed = now - (stats.lastLifeRefillTimestamp || now);
  const livesToAdd = Math.floor(elapsed / REFILL_INTERVAL_MS);

  if (livesToAdd > 0) {
    const newLives = Math.min(stats.maxLives, stats.lives + livesToAdd);
    const newTimestamp = stats.lives + livesToAdd >= stats.maxLives ? now : now - (elapsed % REFILL_INTERVAL_MS);
    const updated = {
      ...stats,
      lives: newLives,
      lastLifeRefillTimestamp: newTimestamp,
    };
    saveUserStats(updated);
    return updated;
  }

  return stats;
}

export function deductLife(stats: UserStats): UserStats {
  const newLives = Math.max(0, stats.lives - 1);
  const updated: UserStats = {
    ...stats,
    lives: newLives,
    lastLifeRefillTimestamp: stats.lives === stats.maxLives ? Date.now() : stats.lastLifeRefillTimestamp,
  };
  saveUserStats(updated);
  return updated;
}

export function refillLivesFull(stats: UserStats): UserStats {
  const updated: UserStats = {
    ...stats,
    lives: stats.maxLives,
    lastLifeRefillTimestamp: Date.now(),
  };
  saveUserStats(updated);
  return updated;
}
