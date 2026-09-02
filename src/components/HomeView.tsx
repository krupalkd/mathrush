import React, { useState, useEffect } from 'react';
import { GameMode, PuzzleCategory, UserStats } from '../types';
import { Zap, Swords, Flame, Sparkles, Brain, Cpu, Clock, Target, ArrowRight, Award, Trophy, ShieldAlert, Hourglass, Lock, Cloud, LogIn, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import { getDailyChallenge } from '../utils/puzzleEngine';
import { getLevelProgress } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  stats: UserStats;
  onStartGame: (mode: GameMode, category?: PuzzleCategory) => void;
  onOpenDaily: () => void;
  onOpenBattle: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenPro: () => void;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  onStartGame,
  onOpenDaily,
  onOpenBattle,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenPro,
}) => {
  const { user, isCloudSynced, setAuthModalOpen, setAuthModalMode } = useAuth();
  const [now, setNow] = useState<number>(Date.now());
  const { puzzle: dailyPuzzle, puzzleNumber } = getDailyChallenge(now);
  const { currentLevelXp, nextLevelXp, progressPercent } = getLevelProgress(stats.xp, stats.level);

  const lastTimestamp = stats.lastDailyCompletedTimestamp || 0;
  const isCooldownActive = lastTimestamp > 0 && now - lastTimestamp < ONE_HOUR_MS;
  const remainingCooldownMs = isCooldownActive ? ONE_HOUR_MS - (now - lastTimestamp) : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCooldown = (ms: number): string => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 pb-28 md:pb-12 text-slate-100 max-w-6xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4">
      {/* Top Banner Hero: Positioning Quote */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/50 rounded-2xl p-3.5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 sm:space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
            <span>The Daily Math Game</span>
          </div>
          <h1 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white font-['Outfit'] leading-snug">
            Engage with daily puzzles, view real-time rankings, and challenge players globally.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Solve fresh challenges (+10,000 XP), monitor live international solver leaderboards, and enter speed 1v1 duels.
          </p>
        </div>
      </div>

      {/* Cloud Sync & Account Bar (if not signed in) */}
      {!user && (
        <div className="p-3 sm:p-4 bg-indigo-950/50 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/25 text-indigo-400 shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white text-xs sm:text-sm block">Save Your MathRush Progress</span>
              <span className="text-[11px] text-slate-300 font-medium">
                Sync your XP, streaks, and global rank across Android and desktop.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                sound.playClick();
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setAuthModalMode('fresh');
                setAuthModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Start Fresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Featured Daily Challenge Hero Card Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/30 border-2 border-amber-500/40 hover:border-amber-400/70 rounded-2xl p-4 sm:p-6 shadow-lg transition-all relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-black tracking-wider bg-amber-500 text-slate-950 rounded uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
                <span>Daily Challenge</span>
              </span>
              <span className="text-[11px] sm:text-xs text-amber-300 font-bold font-mono">Puzzle #{puzzleNumber}</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">• 60s Clock</span>
              {isCooldownActive && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                  ⏳ Cooldown Active
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white font-['JetBrains_Mono'] tracking-wide">
              {dailyPuzzle.question}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Reward: +10,000 XP
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-rose-300 flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Miss: -1,000 XP
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-amber-300 flex items-center gap-1 font-mono font-semibold">
                <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                {isCooldownActive ? `Next: ${formatCooldown(remainingCooldownMs)}` : 'Hourly Rotation'}
              </span>
            </div>
          </div>

          <button
            id="btn-play-daily-hero"
            onClick={() => {
              sound.playClick();
              onOpenDaily();
            }}
            className={`w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap ${
              isCooldownActive
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 shadow-slate-950/40'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isCooldownActive ? (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Review ({formatCooldown(remainingCooldownMs)})</span>
              </>
            ) : (
              <>
                <span>Solve Daily (+10k XP)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Killer Feature: Math Battle */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenBattle();
          }}
          className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-800/50 hover:border-rose-500/80 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:shadow-rose-900/20 active:scale-[0.99] group relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform shrink-0">
                <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              <span className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>LIVE 1V1 DUEL</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1">
              Math Battle (1v1 Duel)
            </h3>

            <div className="space-y-2 mb-3">
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                Speed Battle: Match with online players on the same puzzle. Win duels to claim <strong>+1,000 XP</strong>.
              </p>

              {/* Battle Record Summary Box */}
              <div className="bg-slate-950/90 border border-rose-900/50 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Arena XP Earned:
                  </span>
                  <span className="font-black font-mono text-amber-400 text-xs">
                    +{(stats.battleWins * 1000).toLocaleString()} XP
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-900">
                  <span className="text-slate-400 text-[10px] font-medium">Record:</span>
                  <span className="font-extrabold text-slate-200">
                    <strong className="text-emerald-400">{stats.battleWins}W</strong> - <strong className="text-rose-400">{stats.battleLosses}L</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-rose-400 group-hover:text-rose-300">
            <span className="flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <strong className="text-white">+{(stats.battleWins * 1000).toLocaleString()} XP</strong>
            </span>
            <span className="flex items-center gap-1 font-bold">
              Enter Duel <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 2. Quick Math (10 questions, 30s) */}
        <div
          onClick={() => {
            sound.playClick();
            onStartGame('quick');
          }}
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/70 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:shadow-indigo-900/20 active:scale-[0.99] group relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-md">
                Speed Sprint
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1">Quick Math</h3>
            <p className="text-xs text-slate-300 font-medium mb-3 line-clamp-2">
              10 questions against a 30-second rapid clock. Chain combos to earn massive multiplier XP!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 30s Sprint
            </span>
            <span className="flex items-center gap-1">
              Start <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 3. Streak Mode */}
        <div
          onClick={() => {
            sound.playClick();
            onStartGame('streak');
          }}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:shadow-amber-900/20 active:scale-[0.99] group relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-md">
                High Stakes
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1">Streak Mode</h3>
            <p className="text-xs text-slate-300 font-medium mb-3 line-clamp-2">
              Solve consecutive questions without making a single mistake. How high can your streak climb?
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-amber-400 group-hover:text-amber-300">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Best: {stats.bestStreakScore} in a row
            </span>
            <span className="flex items-center gap-1">
              Play <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 4. Brain & Logic Puzzles */}
        <div
          onClick={() => {
            sound.playClick();
            onStartGame('brain', 'logic');
          }}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/70 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:shadow-emerald-900/20 active:scale-[0.99] group relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform shrink-0">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-md">
                Logic & Equations
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1">Brain Puzzles</h3>
            <p className="text-xs text-slate-300 font-medium mb-3 line-clamp-2">
              Multi-step logic riddles, visual fruit balance equations, and tricky sequence reasoning.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Step-by-Step Hints
            </span>
            <span className="flex items-center gap-1">
              Solve <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 5. AI Adaptive Generator */}
        <div
          onClick={() => {
            sound.playClick();
            onStartGame('adaptive');
          }}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/70 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:shadow-purple-900/20 active:scale-[0.99] group relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform shrink-0">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-md">
                AI Powered
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1">AI Adaptive Trainer</h3>
            <p className="text-xs text-slate-300 font-medium mb-3 line-clamp-2">
              Auto-tunes difficulty based on your exact accuracy ({stats.accuracyRate}%) and speed ({stats.avgTimeSeconds}s).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-purple-400 group-hover:text-purple-300">
            <span>Adaptive Engine</span>
            <span className="flex items-center gap-1">
              Start <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 6. Pro Member / Startup monetization teaser */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenPro();
          }}
          className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-800/40 hover:border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:shadow-amber-900/20 active:scale-[0.99] group relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Award className="w-6 h-6 text-slate-950 font-black" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-500 text-slate-950 rounded-md">
                {stats.isPro ? 'ACTIVE PRO' : '₹99/MO'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1">MathRush Pro</h3>
            <p className="text-xs text-slate-300 font-medium mb-3 line-clamp-2">
              Unlock unlimited hints, detailed speed analytics, AI tutor explanations, and exclusive Master puzzles.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-amber-400 group-hover:text-amber-300">
            <span>{stats.isPro ? 'Manage Membership' : 'Explore Pro Perks'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
            🧠
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold truncate">Puzzles Solved</span>
            <span className="text-sm sm:text-base font-black text-white">{stats.puzzlesSolved}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
            🎯
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold truncate">Accuracy</span>
            <span className="text-sm sm:text-base font-black text-white">{stats.accuracyRate}%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
            ⚡
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold truncate">Avg Speed</span>
            <span className="text-sm sm:text-base font-black text-white">{stats.avgTimeSeconds}s</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
            ⚔️
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 block font-bold truncate">Arena Record</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono truncate block">
              +{(stats.battleWins * 1000).toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
