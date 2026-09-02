import React, { useState, useEffect, useCallback, useId } from 'react';
import { UserStats } from '../types';
import { getDailyChallenge } from '../utils/puzzleEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  Clock,
  Trophy,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Share2,
  Swords,
  Hourglass,
  Lock,
  ChevronRight,
  Check,
  RotateCcw,
} from 'lucide-react';

interface DailyChallengeViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onGoHome: () => void;
  onOpenBattle: () => void;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const DAILY_WIN_XP = 10000;
const DAILY_LOSS_PENALTY_XP = 1000;

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  stats,
  onUpdateStats,
  onGoHome,
  onOpenBattle,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const { puzzle, puzzleNumber } = getDailyChallenge(now);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Live timer updater for countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const lastTimestamp = stats.lastDailyCompletedTimestamp || 0;
  const isCooldownActive = lastTimestamp > 0 && now - lastTimestamp < ONE_HOUR_MS;
  const remainingCooldownMs = isCooldownActive ? ONE_HOUR_MS - (now - lastTimestamp) : 0;

  // Format cooldown display
  const formatCooldown = (ms: number): string => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Submit Answer Handler
  const handleSubmitAnswer = useCallback((answerToSubmit: string) => {
    if (hasSubmitted || !isPlaying) return;

    const trimmed = answerToSubmit.trim();
    if (!trimmed) return;

    setHasSubmitted(true);
    setIsPlaying(false);

    const isCorrect = trimmed.toLowerCase() === puzzle.correctAnswer.toLowerCase();

    if (isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#38bdf8'],
      });
    } else {
      sound.playWrong();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const completedDates = stats.dailyCompletedDates || [];
    const updatedDates = completedDates.includes(todayStr)
      ? completedDates
      : [...completedDates, todayStr];

    const currentXp = stats.xp || 0;
    const nextXp = isCorrect
      ? currentXp + DAILY_WIN_XP
      : Math.max(0, currentXp - DAILY_LOSS_PENALTY_XP);

    const nextStreak = isCorrect ? stats.streak + 1 : Math.max(1, stats.streak);
    const maxStreak = Math.max(stats.maxStreak || 1, nextStreak);

    const newStats: UserStats = {
      ...stats,
      xp: nextXp,
      streak: nextStreak,
      maxStreak: maxStreak,
      dailyCompletedDates: updatedDates,
      lastDailyCompletedTimestamp: Date.now(),
      lastDailyResult: {
        puzzleId: puzzle.id,
        question: puzzle.question,
        correctAnswer: puzzle.correctAnswer,
        userAnswer: trimmed,
        isCorrect: isCorrect,
        explanation: puzzle.explanation,
        earnedXp: isCorrect ? DAILY_WIN_XP : -DAILY_LOSS_PENALTY_XP,
        timestamp: Date.now(),
        puzzleNumber: puzzleNumber,
      },
      puzzlesSolved: isCorrect ? stats.puzzlesSolved + 1 : stats.puzzlesSolved,
    };

    onUpdateStats(newStats);
  }, [hasSubmitted, isPlaying, onUpdateStats, puzzle.correctAnswer, puzzle.explanation, puzzle.id, puzzle.question, puzzleNumber, stats]);

  // Active game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0 && !hasSubmitted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitAnswer(selectedOption || customInput || 'TIMEOUT');
            return 0;
          }
          if (prev <= 10) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, hasSubmitted, selectedOption, customInput, handleSubmitAnswer]);

  const handleStartChallenge = () => {
    sound.playOptionSelect();
    setIsPlaying(true);
    setTimeLeft(60);
    setSelectedOption(null);
    setCustomInput('');
    setShowHint(false);
    setHasSubmitted(false);
  };

  const handleShareResult = () => {
    sound.playClick();
    const resultText = stats.lastDailyResult?.isCorrect
      ? `🔥 Solved MathRush Daily Challenge #${puzzleNumber} in ${60 - timeLeft}s! Claimed +10,000 XP. Can you beat me?`
      : `⚡ Attempted MathRush Daily Challenge #${puzzleNumber}! Join the live duels.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(resultText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Daywise streak representation (Past 7 days)
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Top Header & Streak Stats Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                  Daily Challenge
                </span>
                <span className="text-xs font-mono text-slate-400">Puzzle #{puzzleNumber}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] mt-0.5">
                The Daily Math Arena
              </h1>
            </div>
          </div>

          {/* Current Daily Streak Tracker */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Active Streak
                </span>
                <span className="text-lg font-black text-white font-mono leading-none">
                  {stats.streak} Days
                </span>
              </div>
            </div>

            {/* 7-Day Daywise Streak Badges */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
              {daysOfWeek.map((day, idx) => {
                const isPastOrToday = idx <= todayDayIndex;
                const isCompleted = isPastOrToday && stats.streak > 0;
                return (
                  <div key={idx} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-slate-500 font-bold">{day}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCompleted
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                          : idx === todayDayIndex
                          ? 'border-2 border-amber-400 text-amber-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Challenge Stakes Info */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Victory Reward: +10,000 XP
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Incorrect Penalty: -1,000 XP
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
            <span>Cycle: Fresh hourly challenge rotation</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Challenge Arena */}
      {!isPlaying && !hasSubmitted && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Puzzle #{puzzleNumber} is Live</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              Ready to test your speed?
            </h2>
            <p className="text-sm text-slate-300">
              You will have <strong>60 seconds</strong> to calculate the correct answer. Accurate solvers immediately receive <strong>+10,000 XP</strong> and advance their daily streak.
            </p>
          </div>

          {/* Cooldown Status or Start Button */}
          {isCooldownActive ? (
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-5 max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Challenge Cooldown Active</span>
              </div>
              <p className="text-xs text-slate-400">
                You already completed this cycle's daily puzzle! You can play again as soon as the cooldown expires.
              </p>
              <div className="text-2xl font-black font-mono text-amber-300 bg-slate-900 border border-slate-800 rounded-lg py-2">
                {formatCooldown(remainingCooldownMs)}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenBattle();
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Play 1v1 Battle (+1,000 XP)</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onGoHome();
                  }}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Back Home
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                id="btn-start-daily-challenge"
                onClick={handleStartChallenge}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-base font-black rounded-xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 mx-auto transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <span>Start Daily Challenge</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Playing View */}
      {isPlaying && (
        <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Top Bar with Timer */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {puzzle.subtitle || `Challenge #${puzzleNumber}`}
            </span>

            {/* 60s Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-black text-sm transition-colors ${
                timeLeft <= 10
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-slate-950 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s remaining</span>
            </div>
          </div>

          {/* Puzzle Question Display */}
          <div className="text-center py-6 sm:py-8 bg-slate-950/70 border border-slate-800 rounded-xl px-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['JetBrains_Mono'] tracking-wide">
              {puzzle.question}
            </h2>
          </div>

          {/* Multiple Choice Options Grid */}
          {puzzle.options && puzzle.options.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto">
              {puzzle.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setSelectedOption(opt);
                    handleSubmitAnswer(opt);
                  }}
                  className={`py-4 px-6 rounded-xl border text-xl font-black font-['JetBrains_Mono'] transition-all transform active:scale-95 cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700 hover:border-amber-400/60'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            /* Custom Input Mode */
            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitAnswer(customInput);
                  }
                }}
                placeholder="Type answer & press Enter"
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white text-center text-2xl font-black font-mono py-3 rounded-xl outline-none"
                autoFocus
              />
              <button
                onClick={() => handleSubmitAnswer(customInput)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-md cursor-pointer transition-transform active:scale-95"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Hint Drawer Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setShowHint(!showHint);
              }}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
            </button>
            <span className="text-slate-500">60s timed challenge</span>
          </div>

          {showHint && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
              💡 <strong>Hint:</strong> {puzzle.hint}
            </div>
          )}
        </div>
      )}

      {/* Post-Submission Result & Breakdown View */}
      {hasSubmitted && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            {stats.lastDailyResult?.isCorrect ? (
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                  Victory! Challenge Solved
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-black font-mono rounded-full">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>+{DAILY_WIN_XP.toLocaleString()} XP Claimed</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto text-2xl">
                  <XCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                  Incorrect Calculation
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-black font-mono rounded-full">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>-{DAILY_LOSS_PENALTY_XP.toLocaleString()} XP Penalty</span>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Solution Explanation */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Step-by-Step Mathematical Explanation</span>
            </h3>

            <div className="text-sm font-mono text-slate-200 whitespace-pre-line leading-relaxed bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              {puzzle.explanation}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Your Answer: <strong className="text-white font-mono">{stats.lastDailyResult?.userAnswer}</strong></span>
              <span>Correct: <strong className="text-emerald-400 font-mono">{puzzle.correctAnswer}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleShareResult}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Result Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Share Daily Result</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenBattle();
              }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Jump Into 1v1 Battle (+1,000 XP)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onGoHome();
              }}
              className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Home
            </button>
          </div>
        </div>
      )}

      {/* Live Global Solvers Leaderboard Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white font-['Outfit']">
              Top Daily Arena Solvers (Live)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1,492 Solvers Today</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <span className="text-base font-black font-mono text-amber-400">#1</span>
            <div className="text-xl">👑</div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">Aarav_SpeedMath</span>
              <span className="text-[10px] text-slate-400 font-mono">3.4s solve • +10,000 XP</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <span className="text-base font-black font-mono text-slate-300">#2</span>
            <div className="text-xl">🦊</div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">Elena_Vortex</span>
              <span className="text-[10px] text-slate-400 font-mono">4.1s solve • +10,000 XP</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <span className="text-base font-black font-mono text-amber-600">#3</span>
            <div className="text-xl">⚡</div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">QuantumKai</span>
              <span className="text-[10px] text-slate-400 font-mono">4.8s solve • +10,000 XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
