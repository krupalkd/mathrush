import { LeaderboardEntry, UserStats } from '../types';

export interface GlobalPlayerTemplate {
  id: string;
  name: string;
  avatar: string;
  country: string;
  badge: string;
  level: number;
  baseAllTimeXp: number;
  baseWeeklyXp: number;
  baseDailyXp: number;
  battleElo: number;
  wins: number;
  losses: number;
  avgTime: number;
  status: 'online' | 'in_game' | 'idle';
}

export const INITIAL_GLOBAL_PLAYERS: GlobalPlayerTemplate[] = [
  {
    id: 'p-1',
    name: 'Vikram Mehta',
    avatar: '🧙‍♂️',
    country: '🇮🇳',
    badge: '👑 Grandmaster',
    level: 28,
    baseAllTimeXp: 68450,
    baseWeeklyXp: 18400,
    baseDailyXp: 11200,
    battleElo: 2420,
    wins: 94,
    losses: 12,
    avgTime: 3.4,
    status: 'online',
  },
  {
    id: 'p-2',
    name: 'Elena Rostov',
    avatar: '🦊',
    country: '🇩🇪',
    badge: '💎 Math Genius',
    level: 24,
    baseAllTimeXp: 54200,
    baseWeeklyXp: 15100,
    baseDailyXp: 10400,
    battleElo: 2280,
    wins: 76,
    losses: 14,
    avgTime: 3.9,
    status: 'in_game',
  },
  {
    id: 'p-3',
    name: 'Kai Takahashi',
    avatar: '⚡',
    country: '🇯🇵',
    badge: '💎 Math Genius',
    level: 22,
    baseAllTimeXp: 46800,
    baseWeeklyXp: 12800,
    baseDailyXp: 10000,
    battleElo: 2150,
    wins: 68,
    losses: 18,
    avgTime: 4.2,
    status: 'online',
  },
  {
    id: 'p-4',
    name: 'Sarah Jenkins',
    avatar: '🦁',
    country: '🇺🇸',
    badge: '🥇 Math Master',
    level: 19,
    baseAllTimeXp: 38900,
    baseWeeklyXp: 11200,
    baseDailyXp: 5400,
    battleElo: 1980,
    wins: 58,
    losses: 20,
    avgTime: 4.8,
    status: 'online',
  },
  {
    id: 'p-5',
    name: 'Lucas Silva',
    avatar: '🐼',
    country: '🇧🇷',
    badge: '🥇 Math Master',
    level: 17,
    baseAllTimeXp: 31500,
    baseWeeklyXp: 9400,
    baseDailyXp: 4200,
    battleElo: 1860,
    wins: 49,
    losses: 22,
    avgTime: 5.1,
    status: 'idle',
  },
  {
    id: 'p-6',
    name: 'Chloe Dubois',
    avatar: '🦄',
    country: '🇫🇷',
    badge: '🥇 Math Master',
    level: 16,
    baseAllTimeXp: 26400,
    baseWeeklyXp: 8100,
    baseDailyXp: 3800,
    battleElo: 1740,
    wins: 42,
    losses: 21,
    avgTime: 5.6,
    status: 'in_game',
  },
  {
    id: 'p-7',
    name: 'Aiden Wong',
    avatar: '🚀',
    country: '🇸🇬',
    badge: '🥈 Speed Calculator',
    level: 14,
    baseAllTimeXp: 21800,
    baseWeeklyXp: 7200,
    baseDailyXp: 3100,
    battleElo: 1620,
    wins: 36,
    losses: 19,
    avgTime: 6.0,
    status: 'online',
  },
  {
    id: 'p-8',
    name: 'Amira Hassan',
    avatar: '⭐',
    country: '🇪🇬',
    badge: '🥈 Speed Calculator',
    level: 13,
    baseAllTimeXp: 18900,
    baseWeeklyXp: 6400,
    baseDailyXp: 2600,
    battleElo: 1540,
    wins: 31,
    losses: 18,
    avgTime: 6.4,
    status: 'online',
  },
  {
    id: 'p-9',
    name: 'Liam O’Connor',
    avatar: '🍀',
    country: '🇮🇪',
    badge: '🥈 Speed Calculator',
    level: 11,
    baseAllTimeXp: 15400,
    baseWeeklyXp: 5100,
    baseDailyXp: 2100,
    battleElo: 1460,
    wins: 26,
    losses: 17,
    avgTime: 6.9,
    status: 'idle',
  },
  {
    id: 'p-10',
    name: 'Maya Patel',
    avatar: '🐯',
    country: '🇬🇧',
    badge: '🥉 Logic Apprentice',
    level: 9,
    baseAllTimeXp: 12100,
    baseWeeklyXp: 4300,
    baseDailyXp: 1800,
    battleElo: 1390,
    wins: 21,
    losses: 16,
    avgTime: 7.3,
    status: 'online',
  },
  {
    id: 'p-11',
    name: 'Mateo Hernandez',
    avatar: '🦅',
    country: '🇲🇽',
    badge: '🥉 Logic Apprentice',
    level: 8,
    baseAllTimeXp: 9800,
    baseWeeklyXp: 3600,
    baseDailyXp: 1500,
    battleElo: 1310,
    wins: 18,
    losses: 15,
    avgTime: 7.8,
    status: 'online',
  },
  {
    id: 'p-12',
    name: 'Zoe Lindqvist',
    avatar: '🦉',
    country: '🇸🇪',
    badge: '🥉 Logic Apprentice',
    level: 7,
    baseAllTimeXp: 7600,
    baseWeeklyXp: 2900,
    baseDailyXp: 1200,
    battleElo: 1250,
    wins: 14,
    losses: 14,
    avgTime: 8.2,
    status: 'idle',
  },
];

export interface LiveEventMessage {
  id: string;
  playerName: string;
  avatar: string;
  action: string;
  xpDelta: number;
  timestamp: number;
}

export function buildLeaderboardEntries(
  players: GlobalPlayerTemplate[],
  userStats: UserStats,
  tab: 'alltime' | 'weekly' | 'daily' | 'battle',
  sortBy: 'score' | 'winrate' | 'speed'
): { entries: LeaderboardEntry[]; userEntry: LeaderboardEntry } {
  // 1. Calculate user's stats
  const userWins = userStats.battleWins || 0;
  const userLosses = userStats.battleLosses || 0;
  const userTotalGames = userWins + userLosses;
  const userWinRate =
    userTotalGames > 0
      ? Math.round((userWins / userTotalGames) * 1000) / 10
      : userStats.accuracyRate || 0;

  let userScore = userStats.xp;
  if (tab === 'weekly') {
    // Proportional weekly XP calculation based on current XP
    userScore = Math.min(userStats.xp, Math.max(1200, Math.floor(userStats.xp * 0.45)));
  } else if (tab === 'daily') {
    // Proportional daily XP
    userScore = Math.min(userStats.xp, Math.max(800, Math.floor(userStats.xp * 0.22)));
  } else if (tab === 'battle') {
    userScore = (userStats.battleWins || 0) * 1000;
  }

  const rawUserEntry: LeaderboardEntry = {
    id: 'user_current',
    name: userStats.name || 'You',
    avatar: userStats.avatar || '⚡',
    score: userScore,
    wins: userWins,
    losses: userLosses,
    winRate: userWinRate,
    timeSec: userStats.avgTimeSeconds || 6.2,
    rank: 1,
    badge: userStats.title || 'Math Cadet',
    country: '🌐',
    level: userStats.level || 1,
    isUser: true,
    status: 'online',
  };

  // 2. Build global entries based on current tab
  const entriesList: LeaderboardEntry[] = players.map((p) => {
    let score = p.baseAllTimeXp;
    if (tab === 'weekly') score = p.baseWeeklyXp;
    else if (tab === 'daily') score = p.baseDailyXp;
    else if (tab === 'battle') score = p.wins * 1000;

    const totalBattles = p.wins + p.losses;
    const winRate =
      totalBattles > 0
        ? Math.round((p.wins / totalBattles) * 1000) / 10
        : 50.0;

    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      country: p.country,
      badge: p.badge,
      level: p.level,
      score,
      wins: p.wins,
      losses: p.losses,
      winRate,
      timeSec: p.avgTime,
      rank: 0,
      isUser: false,
      status: p.status,
    };
  });

  // 3. Insert user into the unified list
  const combined = [...entriesList, rawUserEntry];

  // 4. Sort based on metric
  combined.sort((a, b) => {
    if (sortBy === 'winrate') {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.score - a.score;
    }
    if (sortBy === 'speed') {
      const aTime = a.timeSec || 99;
      const bTime = b.timeSec || 99;
      if (aTime !== bTime) return aTime - bTime;
      return b.score - a.score;
    }
    // Default: Sort by Score (XP or ELO)
    if (b.score !== a.score) return b.score - a.score;
    return b.winRate - a.winRate;
  });

  // 5. Assign computed mathematical ranks
  let userFinalEntry = rawUserEntry;
  const rankedEntries = combined.map((entry, index) => {
    const ranked = {
      ...entry,
      rank: index + 1,
    };
    if (ranked.isUser) {
      userFinalEntry = ranked;
    }
    return ranked;
  });

  return {
    entries: rankedEntries,
    userEntry: userFinalEntry,
  };
}
