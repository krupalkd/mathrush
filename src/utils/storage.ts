import { Achievement, UserStats } from '../types';

const STATS_KEY = 'mathrush_user_stats_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'First Step',
    description: 'Solve your very first math puzzle correctly',
    icon: '🎯',
    target: 1,
    current: 0,
    xpReward: 100000,
    unlocked: false,
    category: 'milestones',
    rarity: 'bronze',
    unit: 'puzzle',
  },
  {
    id: 'ach_25_answers',
    title: '25 Correct Answers',
    description: 'Solve 25 correct math puzzles across any mode',
    icon: '🥈',
    target: 25,
    current: 0,
    xpReward: 250000,
    unlocked: false,
    category: 'milestones',
    rarity: 'silver',
    unit: 'correct answers',
  },
  {
    id: 'ach_100_answers',
    title: '100 Correct Answers',
    description: 'Solve 100 correct math puzzles in MathRush',
    icon: '💯',
    target: 100,
    current: 0,
    xpReward: 1000000,
    unlocked: false,
    category: 'milestones',
    rarity: 'gold',
    unit: 'correct answers',
  },
  {
    id: 'ach_250_answers',
    title: '250 Correct Answers',
    description: 'Solve 250 correct math puzzles and prove true mental mastery',
    icon: '👑',
    target: 250,
    current: 0,
    xpReward: 2500000,
    unlocked: false,
    category: 'milestones',
    rarity: 'platinum',
    unit: 'correct answers',
  },
  {
    id: 'ach_3_day_streak',
    title: '3-Day Streak',
    description: 'Maintain an active daily challenge streak for 3 consecutive days',
    icon: '⚡',
    target: 3,
    current: 0,
    xpReward: 300000,
    unlocked: false,
    category: 'streaks',
    rarity: 'silver',
    unit: 'days',
  },
  {
    id: 'ach_5_day_streak',
    title: '5-Day Streak',
    description: 'Maintain an uninterrupted daily streak for 5 consecutive days',
    icon: '🔥',
    target: 5,
    current: 0,
    xpReward: 1500000,
    unlocked: false,
    category: 'streaks',
    rarity: 'gold',
    unit: 'days',
  },
  {
    id: 'ach_7_day_streak',
    title: '7-Day Streak',
    description: 'Achieve a full 1-week continuous daily streak',
    icon: '🌟',
    target: 7,
    current: 0,
    xpReward: 3000000,
    unlocked: false,
    category: 'streaks',
    rarity: 'platinum',
    unit: 'days',
  },
  {
    id: 'ach_streak_flame',
    title: 'On Fire (10 Combos)',
    description: 'Reach a streak combo of 10 consecutive correct answers in one session',
    icon: '🔥',
    target: 10,
    current: 0,
    xpReward: 500000,
    unlocked: false,
    category: 'streaks',
    rarity: 'silver',
    unit: 'combos',
  },
  {
    id: 'ach_speed_demon',
    title: 'Speed Demon',
    description: 'Solve puzzles with average solving speed under 5.0 seconds',
    icon: '⚡',
    target: 5,
    current: 0,
    xpReward: 750000,
    unlocked: false,
    category: 'skills',
    rarity: 'silver',
    unit: 'seconds',
  },
  {
    id: 'ach_battle_gladiator',
    title: 'Math Gladiator',
    description: 'Win 5 live 1v1 Math Battles against arena opponents',
    icon: '⚔️',
    target: 5,
    current: 0,
    xpReward: 1200000,
    unlocked: false,
    category: 'battles',
    rarity: 'silver',
    unit: 'battle wins',
  },
  {
    id: 'ach_xp_master',
    title: 'XP Champion',
    description: 'Accumulate 10,000,000 Total XP in MathRush',
    icon: '💎',
    target: 10000000,
    current: 0,
    xpReward: 10000000,
    unlocked: false,
    category: 'milestones',
    rarity: 'platinum',
    unit: 'XP',
  },
  {
    id: 'ach_level_10',
    title: 'Level 10 Achiever',
    description: 'Advance your player rank progression to Level 10',
    icon: '🏆',
    target: 10,
    current: 1,
    xpReward: 2000000,
    unlocked: false,
    category: 'milestones',
    rarity: 'gold',
    unit: 'Level',
  },
  {
    id: 'ach_math_master',
    title: 'Calculator Rank',
    description: 'Reach Level 25 and earn the Calculator master title',
    icon: '🥈',
    target: 25,
    current: 1,
    xpReward: 5000000,
    unlocked: false,
    category: 'milestones',
    rarity: 'platinum',
    unit: 'Level',
  },
  {
    id: 'ach_sharpshooter',
    title: 'Sharpshooter',
    description: 'Maintain 95%+ overall accuracy with at least 15 puzzles solved',
    icon: '🎯',
    target: 95,
    current: 0,
    xpReward: 800000,
    unlocked: false,
    category: 'skills',
    rarity: 'gold',
    unit: '% accuracy',
  },
];

export function getAchievementProgress(ach: Achievement, stats: UserStats): {
  currentValue: number;
  isEligible: boolean;
  isClaimed: boolean;
  progressPercent: number;
  remainingText: string;
} {
  const isClaimed = Boolean(stats.achievements?.includes(ach.id));
  let currentValue = 0;
  let isEligible = false;
  let remainingText = '';

  switch (ach.id) {
    case 'ach_first_step':
    case 'ach_25_answers':
    case 'ach_100_answers':
    case 'ach_250_answers': {
      currentValue = stats.puzzlesSolved || 0;
      isEligible = currentValue >= ach.target;
      const left = Math.max(0, ach.target - currentValue);
      remainingText = isEligible ? 'Milestone achieved!' : `${left} more correct answers to unlock`;
      break;
    }
    case 'ach_3_day_streak':
    case 'ach_5_day_streak':
    case 'ach_7_day_streak': {
      currentValue = Math.max(
        stats.streak || 0,
        stats.maxStreak || 0,
        Array.isArray(stats.dailyCompletedDates) ? stats.dailyCompletedDates.length : 0
      );
      isEligible = currentValue >= ach.target;
      const left = Math.max(0, ach.target - currentValue);
      remainingText = isEligible ? 'Streak milestone unlocked!' : `${left} more day${left > 1 ? 's' : ''} to unlock`;
      break;
    }
    case 'ach_streak_flame': {
      currentValue = Math.max(stats.bestStreakScore || 0, stats.maxStreak || 0);
      isEligible = currentValue >= ach.target;
      const left = Math.max(0, ach.target - currentValue);
      remainingText = isEligible ? 'Combo goal unlocked!' : `${left} combo correct answers needed`;
      break;
    }
    case 'ach_speed_demon': {
      currentValue = stats.avgTimeSeconds || 0;
      isEligible = (stats.puzzlesSolved || 0) >= 5 && currentValue > 0 && currentValue <= 5;
      remainingText = isEligible
        ? 'Lightning speed unlocked!'
        : (stats.puzzlesSolved || 0) < 5
        ? `Solve at least 5 puzzles first (${stats.puzzlesSolved || 0}/5 solved)`
        : `Average ${currentValue.toFixed(1)}s (needs ≤ 5.0s)`;
      break;
    }
    case 'ach_battle_gladiator': {
      currentValue = stats.battleWins || 0;
      isEligible = currentValue >= ach.target;
      const left = Math.max(0, ach.target - currentValue);
      remainingText = isEligible ? 'Gladiator victory achieved!' : `${left} more battle win${left > 1 ? 's' : ''} to unlock`;
      break;
    }
    case 'ach_xp_master': {
      currentValue = stats.xp || 0;
      isEligible = currentValue >= ach.target;
      const left = Math.max(0, ach.target - currentValue);
      remainingText = isEligible ? 'XP Champion reached!' : `${left.toLocaleString()} more XP needed`;
      break;
    }
    case 'ach_level_10': {
      currentValue = stats.level || 1;
      isEligible = currentValue >= 10;
      const left = Math.max(0, 10 - currentValue);
      remainingText = isEligible ? 'Level 10 unlocked!' : `${left} more level${left > 1 ? 's' : ''} needed`;
      break;
    }
    case 'ach_math_master': {
      currentValue = stats.level || 1;
      isEligible = currentValue >= ach.target;
      const left = Math.max(0, ach.target - currentValue);
      remainingText = isEligible ? 'Calculator Rank reached!' : `${left} more level${left > 1 ? 's' : ''} to unlock`;
      break;
    }
    case 'ach_sharpshooter': {
      currentValue = stats.accuracyRate || 0;
      isEligible = (stats.puzzlesSolved || 0) >= 15 && currentValue >= ach.target;
      remainingText = isEligible
        ? 'Pinpoint accuracy achieved!'
        : (stats.puzzlesSolved || 0) < 15
        ? `Solve 15 puzzles with ≥95% accuracy (${stats.puzzlesSolved || 0}/15)`
        : `Current accuracy: ${currentValue}% (target ≥95%)`;
      break;
    }
    default: {
      currentValue = 0;
      isEligible = false;
      remainingText = '';
    }
  }

  if (isClaimed) {
    isEligible = true;
  }

  let progressPercent = 0;
  if (isClaimed) {
    progressPercent = 100;
  } else if (ach.id === 'ach_speed_demon') {
    if (isEligible) {
      progressPercent = 100;
    } else if ((stats.puzzlesSolved || 0) < 5) {
      progressPercent = Math.round(((stats.puzzlesSolved || 0) / 5) * 50);
    } else {
      progressPercent = Math.min(90, Math.round((5 / Math.max(5, currentValue || 6)) * 100));
    }
  } else {
    progressPercent = Math.min(100, Math.max(0, Math.round((currentValue / ach.target) * 100)));
  }

  return {
    currentValue,
    isEligible,
    isClaimed,
    progressPercent,
    remainingText,
  };
}

export function getInitialUserStats(): UserStats {
  return {
    xp: 0,
    level: 1,
    title: 'Beginner',
    streak: 0,
    maxStreak: 0,
    lives: 3,
    maxLives: 3,
    lastLifeRefillTimestamp: Date.now(),
    lastPlayedDate: new Date().toISOString().split('T')[0],
    dailyCompletedDates: [],
    puzzlesSolved: 0,
    accuracyRate: 100,
    avgTimeSeconds: 0,
    battleElo: 1000,
    battleWins: 0,
    battleLosses: 0,
    bestQuickScore: 0,
    bestStreakScore: 0,
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
    // Ensure initial rank progression shows Level 1 instead of default mock Level 2
    if (parsed.level === 2 && (parsed.xp === 120 || parsed.xp === undefined || parsed.puzzlesSolved <= 4)) {
      parsed.level = 1;
      parsed.xp = 0;
      parsed.puzzlesSolved = 0;
      parsed.battleWins = 0;
      parsed.battleLosses = 0;
      parsed.title = 'Beginner';
    }
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
  if (stats.isPro) {
    if (stats.lives !== stats.maxLives) {
      const updated = { ...stats, lives: stats.maxLives, lastLifeRefillTimestamp: Date.now() };
      saveUserStats(updated);
      return updated;
    }
    return stats;
  }

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
  if (stats.isPro) {
    // Pro members have infinite hearts / energy
    return { ...stats, lives: stats.maxLives };
  }

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
