import React, { useState, useEffect, useRef } from 'react';
import { BattleOpponent, Puzzle, UserStats } from '../types';
import { sound } from '../utils/audio';
import { CURATED_PUZZLES, generateProceduralPuzzle } from '../utils/puzzleEngine';
import { addXp } from '../utils/storage';
import { Swords, Trophy, Clock, Zap, RotateCcw, Share2, ArrowLeft, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadShareCard, shareScoreToSocial } from '../utils/shareImage';

interface MathBattleViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onBack: () => void;
}

const OPPONENT_POOL = [
  { name: 'Lucas R.', avatar: '🦁', country: '🇧🇷', baseElo: 1210, speedFactor: 1.1 },
  { name: 'Sophia K.', avatar: '🦊', country: '🇬🇧', baseElo: 1190, speedFactor: 0.95 },
  { name: 'Arjun P.', avatar: '⚡', country: '🇮🇳', baseElo: 1240, speedFactor: 0.88 },
  { name: 'Elena V.', avatar: '🐼', country: '🇩🇪', baseElo: 1225, speedFactor: 1.05 },
  { name: 'Kenji T.', avatar: '🚀', country: '🇯🇵', baseElo: 1280, speedFactor: 0.82 },
  { name: 'Maya M.', avatar: '👑', country: '🇺🇸', baseElo: 1205, speedFactor: 1.0 },
];

export const MathBattleView: React.FC<MathBattleViewProps> = ({
  stats,
  onUpdateStats,
  onBack,
}) => {
  const [battleState, setBattleState] = useState<'matching' | 'ready' | 'dueling' | 'finished'>('matching');
  const [opponent, setOpponent] = useState<BattleOpponent | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [userSolveTime, setUserSolveTime] = useState<number>(0);
  const [opponentSolveTime, setOpponentSolveTime] = useState<number>(0);
  const [opponentProgress, setOpponentProgress] = useState<number>(0);
  const [opponentState, setOpponentState] = useState<'thinking' | 'answered' | 'failed'>('thinking');
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);
  const [readyCountdown, setReadyCountdown] = useState<number>(3);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [hasLeveledUp, setHasLeveledUp] = useState<boolean>(false);

  const duelTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // 1. Matchmaking Simulation
  useEffect(() => {
    if (battleState !== 'matching') return;

    const randomOpponent = OPPONENT_POOL[Math.floor(Math.random() * OPPONENT_POOL.length)];
    const chosenPuzzle = CURATED_PUZZLES[Math.floor(Math.random() * CURATED_PUZZLES.length)] || generateProceduralPuzzle('medium');
    setPuzzle(chosenPuzzle);

    // Opponent takes between 9 and 22 seconds based on difficulty
    const targetTime = Number((11 * randomOpponent.speedFactor + (Math.random() * 6 - 3)).toFixed(1));

    const timeout = setTimeout(() => {
      setOpponent({
        id: `opp-${Date.now()}`,
        name: randomOpponent.name,
        avatar: randomOpponent.avatar,
        elo: randomOpponent.baseElo,
        country: randomOpponent.country,
        accuracy: 92,
        targetSolvingTime: targetTime,
        status: 'connected',
        currentQuestionIndex: 0,
        score: 0,
        reactionEmoji: '🧐',
      });
      setBattleState('ready');
      sound.playClick();
    }, 1800);

    return () => clearTimeout(timeout);
  }, [battleState]);

  // 2. Ready Countdown (3... 2... 1... START)
  useEffect(() => {
    if (battleState !== 'ready') return;

    setReadyCountdown(3);
    const interval = setInterval(() => {
      setReadyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startDuel();
          return 0;
        }
        sound.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [battleState]);

  const startDuel = () => {
    setBattleState('dueling');
    startTimeRef.current = Date.now();
    setUserAnswer(null);
    setUserSolveTime(0);
    setOpponentProgress(0);
    setOpponentState('thinking');
    setBattleResult(null);

    // Opponent real-time progress simulation
    if (!opponent) return;
    const opponentTotalMs = opponent.targetSolvingTime * 1000;
    const updateIntervalMs = 100;

    duelTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, Math.round((elapsed / opponentTotalMs) * 100));
      setOpponentProgress(progress);

      if (elapsed >= opponentTotalMs) {
        setOpponentSolveTime(opponent.targetSolvingTime);
        setOpponentState('answered');
      }
    }, updateIntervalMs);
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (duelTimerRef.current) clearInterval(duelTimerRef.current);
    };
  }, []);

  const handleUserAnswer = (option: string) => {
    if (battleState !== 'dueling' || userAnswer || !puzzle || !opponent) return;

    if (duelTimerRef.current) clearInterval(duelTimerRef.current);
    const elapsedSeconds = Number(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    setUserAnswer(option);
    setUserSolveTime(elapsedSeconds);

    const isUserCorrect = option === puzzle.correctAnswer;
    const isOpponentCorrect = true; // Bot answered with high accuracy
    const isUserFaster = elapsedSeconds < opponent.targetSolvingTime;

    let won = false;
    if (isUserCorrect && isUserFaster) {
      won = true;
      sound.playBattleWin();
      confetti({ particleCount: 100, spread: 70 });
      setBattleResult('win');
      const earnedXp = 1000;
      setXpEarned(earnedXp);
      const xpRes = addXp(stats, earnedXp);
      if (xpRes.leveledUp) {
        setHasLeveledUp(true);
      }
      onUpdateStats({
        ...xpRes.updated,
        battleWins: stats.battleWins + 1,
        puzzlesSolved: stats.puzzlesSolved + 1,
      });
    } else {
      sound.playWrong();
      setBattleResult('loss');
      const participationXp = 100;
      setXpEarned(participationXp);
      const xpRes = addXp(stats, participationXp);
      if (xpRes.leveledUp) {
        setHasLeveledUp(true);
      }
      onUpdateStats({
        ...xpRes.updated,
        battleLosses: stats.battleLosses + 1,
      });
    }

    setOpponentSolveTime(opponent.targetSolvingTime);
    setBattleState('finished');
  };

  const handleRematch = () => {
    sound.playClick();
    setHasLeveledUp(false);
    setXpEarned(0);
    setBattleState('matching');
  };

  const handleShareVictory = () => {
    sound.playClick();
    if (!puzzle) return;
    downloadShareCard({
      appName: 'MathRush',
      puzzleQuestion: puzzle.question,
      timeSeconds: userSolveTime,
      userName: stats.name,
      userRankTitle: stats.title,
      modeName: 'Math Battle 1v1',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 text-slate-100 min-h-[85vh] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-bold">
            <Swords className="w-4 h-4 text-rose-400" />
            <span>1v1 Math Battle</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-amber-300 rounded-xl text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stats.xp} XP (Lv.{stats.level})</span>
          </div>
        </div>
      </div>

      {/* PHASE 1: MATCHMAKING */}
      {battleState === 'matching' && (
        <div className="my-auto text-center space-y-6 py-12">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
            <Swords className="w-10 h-10 text-rose-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-['Outfit']">Searching for Global Opponent...</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Matching with players near your skill level (Lv. {stats.level} • {stats.title})...
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-2xl">{stats.avatar}</span>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{stats.name} (You)</span>
                <span className="text-[10px] text-amber-400">{stats.xp} XP • Lv.{stats.level}</span>
              </div>
            </div>
            <span className="font-black text-rose-500 text-sm">VS</span>
            <div className="flex items-center gap-2 bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-700/40 border-dashed animate-pulse">
              <span className="text-2xl">❓</span>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-400 block">Matching...</span>
                <span className="text-[10px] text-slate-500">Searching</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: READY COUNTDOWN */}
      {battleState === 'ready' && opponent && (
        <div className="my-auto text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-6">
            <div className="bg-slate-800 p-4 rounded-2xl border border-indigo-500/40 w-44">
              <span className="text-4xl block mb-2">{stats.avatar}</span>
              <span className="font-bold text-sm text-white block truncate">{stats.name}</span>
              <span className="text-xs text-indigo-400 font-semibold">{stats.xp} XP • Lv.{stats.level}</span>
            </div>

            <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-rose-600/50 animate-bounce">
              {readyCountdown > 0 ? readyCountdown : 'GO!'}
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-rose-500/40 w-44">
              <span className="text-4xl block mb-2">{opponent.avatar}</span>
              <span className="font-bold text-sm text-white block truncate">
                {opponent.name} {opponent.country}
              </span>
              <span className="text-xs text-amber-400 font-semibold">{opponent.elo} XP</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-rose-300">
            ⚡ Both players receive the SAME puzzle. First correct answer wins!
          </p>
        </div>
      )}

      {/* PHASE 3: ACTIVE DUEL */}
      {battleState === 'dueling' && puzzle && opponent && (
        <div className="space-y-6 my-auto">
          {/* Dual Split HUD */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player A: You */}
            <div className="bg-slate-900 border border-indigo-500/50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{stats.avatar}</span> You ({stats.name})
                </span>
                <span className="text-indigo-400 font-extrabold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Solving...
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-full animate-pulse" />
              </div>
            </div>

            {/* Player B: Opponent */}
            <div className="bg-slate-900 border border-rose-500/50 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{opponent.avatar}</span> {opponent.name} {opponent.country}
                </span>
                <span className="text-rose-400 font-extrabold">
                  {opponentState === 'answered' ? '⚡ Answered!' : '🧠 Thinking...'}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-200"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Central Math Puzzle Equation */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400">
              DUEL PUZZLE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-['JetBrains_Mono'] tracking-wide">
              {puzzle.question}
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {puzzle.options.map((opt, idx) => (
              <button
                key={idx}
                id={`btn-battle-opt-${idx}`}
                onClick={() => handleUserAnswer(opt)}
                className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-indigo-600 hover:border-indigo-400 border-2 border-slate-700 font-['JetBrains_Mono'] font-black text-xl text-white transition-all transform active:scale-95 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 4: FINISHED VICTORY / DEFEAT BANNER */}
      {battleState === 'finished' && puzzle && opponent && (
        <div className="my-auto space-y-6 text-center py-6">
          {/* Winner Banner */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-4xl shadow-xl shadow-amber-500/30 mb-2">
              {battleResult === 'win' ? '👑' : '💔'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
              {battleResult === 'win' ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <p className="text-sm text-slate-300">
              {battleResult === 'win'
                ? `You solved it faster than ${opponent.name} and claimed the crown!`
                : `${opponent.name} solved it faster this time. Keep training!`}
            </p>
          </div>

          {/* Speed Comparison Card (Section 3 Blueprint) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-400 uppercase">
              <span>Player</span>
              <span>Time Taken</span>
              <span>Result</span>
            </div>

            {/* You */}
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-xl">{stats.avatar}</span>
                <span className="text-white">You ({stats.name})</span>
              </div>
              <span className="font-['JetBrains_Mono'] font-extrabold text-indigo-300">
                {userSolveTime}s ⚡
              </span>
              <span className={`text-xs font-bold ${battleResult === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {battleResult === 'win' ? 'Winner 🏆' : '2nd Place'}
              </span>
            </div>

            {/* Opponent */}
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-xl">{opponent.avatar}</span>
                <span className="text-slate-300">{opponent.name}</span>
              </div>
              <span className="font-['JetBrains_Mono'] font-extrabold text-slate-400">
                {opponentSolveTime}s ⏱️
              </span>
              <span className={`text-xs font-bold ${battleResult === 'win' ? 'text-slate-500' : 'text-emerald-400'}`}>
                {battleResult === 'win' ? '2nd Place' : 'Winner 🏆'}
              </span>
            </div>

            {/* XP Result & Rewards */}
            <div className="bg-slate-950 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>XP Result:</span>
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black ${battleResult === 'win' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  +{xpEarned} XP
                </span>
                <span className="text-slate-400 text-xs font-semibold">
                  (Total: {stats.xp} XP)
                </span>
                {hasLeveledUp && (
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] rounded-full font-black animate-pulse">
                    Level Up! Lv.{stats.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Answer & Solution Breakdown Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Puzzle Solution & Answer</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 capitalize">
                {puzzle.category} • {puzzle.difficulty}
              </span>
            </div>

            {/* Battle Equation */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Battle Equation
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['JetBrains_Mono']">
                {puzzle.question}
              </h3>
            </div>

            {/* Answer Comparison Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Right Answer Box */}
              <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider block">
                    Right Answer
                  </span>
                  <span className="text-lg font-black text-emerald-300 font-['JetBrains_Mono']">
                    {puzzle.correctAnswer}
                  </span>
                </div>
              </div>

              {/* Your Answer Box */}
              <div
                className={`border rounded-xl p-3 flex items-center gap-3 ${
                  userAnswer === puzzle.correctAnswer
                    ? 'bg-emerald-950/20 border-emerald-700/30 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-700/30 text-rose-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    userAnswer === puzzle.correctAnswer
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {userAnswer === puzzle.correctAnswer ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Your Answer
                  </span>
                  <span className="text-lg font-black font-['JetBrains_Mono'] truncate block">
                    {userAnswer || 'No answer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            {puzzle.explanation && (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Step-by-Step Explanation</span>
                </span>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                  {puzzle.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRematch}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Next Battle</span>
            </button>

            {battleResult === 'win' && (
              <button
                onClick={handleShareVictory}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share Victory Card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
