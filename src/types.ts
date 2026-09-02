export type GameMode = 'quick' | 'daily' | 'streak' | 'battle' | 'brain' | 'adaptive';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export type PuzzleCategory = 'arithmetic' | 'sequence' | 'bodmas' | 'logic' | 'equation' | 'speed';

export interface Puzzle {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  mathRule?: string;
  partialCalculation?: string;
  explanation: string;
  category: PuzzleCategory | string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in seconds
  subtitle?: string;
  visualEquation?: {
    items: { label: string; count: number; op?: string }[];
    targetValue?: number;
  };
}

export interface UserStats {
  xp: number;
  level: number;
  title: string;
  streak: number;
  maxStreak: number;
  lives: number;
  maxLives: number;
  lastLifeRefillTimestamp: number;
  lastPlayedDate: string;
  dailyCompletedDates: string[];
  lastDailyCompletedTimestamp?: number;
  lastDailyResult?: {
    puzzleId: string;
    question: string;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    earnedXp: number;
    timestamp: number;
    puzzleNumber?: number;
  };
  puzzlesSolved: number;
  accuracyRate: number;
  avgTimeSeconds: number;
  battleElo: number;
  battleWins: number;
  battleLosses: number;
  bestQuickScore: number;
  bestStreakScore: number;
  achievements: string[];
  isPro: boolean;
  name: string;
  avatar: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled?: boolean;
  reminderTime?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  wins: number;
  losses: number;
  winRate: number; // percentage e.g. 78.5
  timeSec?: number;
  rank: number;
  badge: string;
  country: string;
  level?: number;
  isUser?: boolean;
  status?: 'online' | 'in_game' | 'idle';
  recentGain?: number;
}

export interface BattleOpponent {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  country: string;
  accuracy: number;
  targetSolvingTime: number; // seconds to answer
  status: 'searching' | 'connected' | 'solving' | 'answered' | 'failed';
  currentQuestionIndex: number;
  score: number;
  reactionEmoji?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xpReward: number;
  unlocked: boolean;
}

export interface PuzzleResult {
  puzzleId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  xpEarned: number;
  explanation: string;
}
