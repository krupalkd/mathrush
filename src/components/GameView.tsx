import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel, GameMode, Puzzle, PuzzleCategory, PuzzleResult, UserStats } from '../types';
import { sound } from '../utils/audio';
import { CURATED_PUZZLES, generateProceduralPuzzle, fetchAIPuzzle, getDailyChallenge, getPuzzleHintDetails } from '../utils/puzzleEngine';
import { addXp, deductLife } from '../utils/storage';
import { Clock, Lightbulb, Zap, Heart, Flame, HelpCircle, X, ChevronRight, Calculator, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameViewProps {
  mode: GameMode;
  initialCategory?: PuzzleCategory;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onFinishGame: (results: {
    score: number;
    totalQuestions: number;
    totalTimeSpent: number;
    resultsList: PuzzleResult[];
    mode: GameMode;
    leveledUp: boolean;
    newLevel?: number;
    xpEarned: number;
  }) => void;
  onExitGame: () => void;
  onOpenPro: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  mode,
  initialCategory,
  stats,
  onUpdateStats,
  onFinishGame,
  onExitGame,
  onOpenPro,
}) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timeSpentOnCurrent, setTimeSpentOnCurrent] = useState<number>(0);
  const [streakCombo, setStreakCombo] = useState(0);
  const [resultsList, setResultsList] = useState<PuzzleResult[]>([]);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showNoHintsModal, setShowNoHintsModal] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [unlockedHintIds, setUnlockedHintIds] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [hasLeveledUp, setHasLeveledUp] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState<number | undefined>(undefined);

  const timerRef = useRef<number | null>(null);
  const currentPuzzle = puzzles[currentIndex];

  const handleTriggerHint = () => {
    if (!currentPuzzle) return;
    const isAlreadyUnlocked = unlockedHintIds.includes(currentPuzzle.id);

    if (isAlreadyUnlocked) {
      sound.playClick();
      setShowHintModal(true);
      return;
    }

    if (hintsLeft > 0) {
      sound.playClick();
      setHintsLeft((prev) => Math.max(0, prev - 1));
      setUnlockedHintIds((prev) => [...prev, currentPuzzle.id]);
      setShowHintModal(true);
    } else {
      sound.playWrong();
      setShowNoHintsModal(true);
    }
  };

  // Initialize Puzzles for the chosen Game Mode
  useEffect(() => {
    let initialList: Puzzle[] = [];

    if (mode === 'daily') {
      const { puzzle } = getDailyChallenge();
      initialList = [puzzle];
    } else if (mode === 'quick') {
      // 10 high-speed questions
      const pool = CURATED_PUZZLES.slice().sort(() => Math.random() - 0.5);
      while (pool.length < 10) {
        pool.push(generateProceduralPuzzle('easy', initialCategory));
      }
      initialList = pool.slice(0, 10).map((p) => ({ ...p, timeLimit: 25 }));
    } else if (mode === 'streak') {
      // Endless streak mode starting with 10 procedural questions
      initialList = Array.from({ length: 10 }).map((_, idx) => {
        const diff: DifficultyLevel = idx < 3 ? 'beginner' : idx < 7 ? 'easy' : 'medium';
        return generateProceduralPuzzle(diff, initialCategory);
      });
    } else if (mode === 'brain') {
      initialList = CURATED_PUZZLES.filter((p) => p.category === 'logic' || p.category === 'sequence' || p.difficulty === 'hard');
      if (initialList.length < 5) {
        initialList.push(generateProceduralPuzzle('hard', 'logic'));
        initialList.push(generateProceduralPuzzle('hard', 'sequence'));
      }
      initialList = initialList.slice(0, 5);
    } else {
      // Adaptive mode
      initialList = [generateProceduralPuzzle('medium')];
    }

    setPuzzles(initialList);
    setCurrentIndex(0);
    setTimeLeft(initialList[0]?.timeLimit || 25);
    setTimeSpentOnCurrent(0);
    setHintsLeft(3);
    setUnlockedHintIds([]);
  }, [mode, initialCategory]);

  // Main countdown timer
  useEffect(() => {
    if (!currentPuzzle || answeredState !== 'idle') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        if (prev <= 5) {
          sound.playTick(prev <= 3);
        }
        return prev - 1;
      });
      setTimeSpentOnCurrent((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPuzzle, answeredState]);

  // Timeout handler
  const handleTimeout = () => {
    handleAnswerSubmit('__TIMEOUT__');
  };

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (answeredState !== 'idle' || !currentPuzzle) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (currentPuzzle.options[index]) {
          handleAnswerSubmit(currentPuzzle.options[index]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answeredState, currentPuzzle]);

  const handleAnswerSubmit = useCallback(
    async (option: string) => {
      if (answeredState !== 'idle' || !currentPuzzle) return;

      if (timerRef.current) clearInterval(timerRef.current);
      setSelectedOption(option);

      const isCorrect = option === currentPuzzle.correctAnswer;
      const timeSpent = Math.max(1, timeSpentOnCurrent);

      // XP Calculations with combo multiplier & speed bonus
      let earnedXp = 0;
      if (isCorrect) {
        sound.playCorrect(streakCombo);
        setAnsweredState('correct');
        const speedBonus = timeSpent <= 5 ? 30 : timeSpent <= 10 ? 15 : 0;
        const comboBonus = Math.min(50, streakCombo * 10);
        earnedXp = 50 + speedBonus + comboBonus;
        setStreakCombo((prev) => prev + 1);
        setTotalXpEarned((prev) => prev + earnedXp);

        // Update stats
        const xpRes = addXp(stats, earnedXp);
        if (xpRes.leveledUp) {
          sound.playLevelUp();
          setHasLeveledUp(true);
          setNewLevelReached(xpRes.newLevel);
          confetti({ particleCount: 80, spread: 60 });
        }
        onUpdateStats({
          ...xpRes.updated,
          puzzlesSolved: stats.puzzlesSolved + 1,
          streak: Math.max(stats.streak, streakCombo + 1),
          maxStreak: Math.max(stats.maxStreak, streakCombo + 1),
        });
      } else {
        sound.playWrong();
        setAnsweredState('wrong');
        setStreakCombo(0);
        const updatedStats = deductLife(stats);
        onUpdateStats(updatedStats);
      }

      const resultEntry: PuzzleResult = {
        puzzleId: currentPuzzle.id,
        question: currentPuzzle.question,
        userAnswer: option === '__TIMEOUT__' ? 'Time Expired' : option,
        correctAnswer: currentPuzzle.correctAnswer,
        isCorrect,
        timeSpentSeconds: timeSpent,
        xpEarned: earnedXp,
        explanation: currentPuzzle.explanation,
      };

      const updatedResults = [...resultsList, resultEntry];
      setResultsList(updatedResults);

      // Auto advance or finish after short review animation
      setTimeout(async () => {
        // If streak mode and answer is wrong, game ends!
        if (mode === 'streak' && !isCorrect) {
          finishGameSession(updatedResults);
          return;
        }

        // Check if more questions remain
        const nextIdx = currentIndex + 1;
        if (nextIdx < puzzles.length) {
          setCurrentIndex(nextIdx);
          setSelectedOption(null);
          setAnsweredState('idle');
          setTimeLeft(puzzles[nextIdx].timeLimit || 25);
          setTimeSpentOnCurrent(0);
        } else if (mode === 'streak' || mode === 'adaptive') {
          // Dynamically fetch or generate next question for endless mode!
          setLoadingAI(true);
          const nextDiff: DifficultyLevel = nextIdx > 15 ? 'master' : nextIdx > 10 ? 'expert' : nextIdx > 5 ? 'hard' : 'medium';
          const nextPuzzle = await fetchAIPuzzle({
            difficulty: nextDiff,
            userAccuracy: stats.accuracyRate,
            avgTimeSeconds: stats.avgTimeSeconds,
            userLevel: stats.level,
          });
          setPuzzles((prev) => [...prev, nextPuzzle]);
          setCurrentIndex(nextIdx);
          setSelectedOption(null);
          setAnsweredState('idle');
          setTimeLeft(nextPuzzle.timeLimit || 25);
          setTimeSpentOnCurrent(0);
          setLoadingAI(false);
        } else {
          // Finished game mode!
          finishGameSession(updatedResults);
        }
      }, 1200);
    },
    [answeredState, currentPuzzle, timeSpentOnCurrent, streakCombo, stats, resultsList, currentIndex, puzzles, mode, onUpdateStats]
  );

  const finishGameSession = (finalResults: PuzzleResult[]) => {
    const correctCount = finalResults.filter((r) => r.isCorrect).length;
    const totalTime = finalResults.reduce((acc, r) => acc + r.timeSpentSeconds, 0);

    onFinishGame({
      score: correctCount,
      totalQuestions: finalResults.length,
      totalTimeSpent: totalTime,
      resultsList: finalResults,
      mode,
      leveledUp: hasLeveledUp,
      newLevel: newLevelReached,
      xpEarned: totalXpEarned,
    });
  };

  if (!currentPuzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-slate-300">Generating next mathematical challenge...</p>
      </div>
    );
  }

  const progressPercent = Math.min(100, (timeLeft / (currentPuzzle.timeLimit || 30)) * 100);
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-slate-100 min-h-[calc(100vh-5rem)] flex flex-col justify-between">
      {/* Top HUD: Mode title, Timer bar, Lives, Combos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* Mode & Question Counter */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-slate-800 border border-slate-700 text-indigo-300 rounded-lg">
              {mode === 'quick' ? '⚡ Quick Math' : mode === 'daily' ? '🧩 Daily Challenge' : mode === 'streak' ? '🔥 Streak Mode' : '🧠 Brain Puzzle'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {mode === 'streak' ? `Score: ${resultsList.filter((r) => r.isCorrect).length}` : `Q ${currentIndex + 1} of ${puzzles.length}`}
            </span>
          </div>

          {/* Lives & Streak Combo & Hints remaining */}
          <div className="flex items-center gap-2 sm:gap-3">
            {streakCombo >= 2 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 text-xs font-black animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{streakCombo}x!</span>
              </div>
            )}

            {/* Session Hints counter */}
            <div
              className="flex items-center gap-1 text-amber-300 font-bold text-xs bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded-lg"
              title={`${hintsLeft} of 3 hints remaining in this session`}
            >
              <Lightbulb className={`w-3.5 h-3.5 ${hintsLeft > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
              <span>{hintsLeft}/3</span>
            </div>

            <div className="flex items-center gap-1 text-rose-400 font-bold text-xs bg-rose-950/40 border border-rose-800/40 px-2 py-1 rounded-lg">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>{stats.lives}</span>
            </div>

            <button
              id="btn-exit-game"
              onClick={() => {
                sound.playClick();
                onExitGame();
              }}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Quit Session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Countdown Timer Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className={`flex items-center gap-1 ${isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
              <Clock className="w-3.5 h-3.5" />
              {timeLeft}s remaining
            </span>
            <span className="text-slate-400 text-[11px]">Difficulty: {currentPuzzle.difficulty.toUpperCase()}</span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isTimeCritical
                  ? 'bg-rose-500 animate-pulse'
                  : timeLeft <= 10
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Arena Card */}
      <div className="my-6 bg-slate-900 border-2 border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[220px]">
        {/* Subtle category watermark */}
        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400/80 mb-2">
          {currentPuzzle.subtitle || `${currentPuzzle.category.toUpperCase()} PUZZLE`}
        </span>

        {/* High contrast mathematical equation display */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide font-['JetBrains_Mono'] leading-relaxed whitespace-pre-line select-none">
          {currentPuzzle.question}
        </h2>

        {/* Hint button trigger */}
        <button
          id="btn-show-hint"
          onClick={handleTriggerHint}
          className={`mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
            unlockedHintIds.includes(currentPuzzle.id)
              ? 'bg-indigo-950/70 border-indigo-600/70 text-indigo-200 hover:bg-indigo-900/70 shadow-sm'
              : hintsLeft > 0
              ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border-amber-600/40 hover:border-amber-400 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
          }`}
        >
          <Lightbulb
            className={`w-3.5 h-3.5 ${
              hintsLeft > 0 || unlockedHintIds.includes(currentPuzzle.id)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-500'
            }`}
          />
          <span>
            {unlockedHintIds.includes(currentPuzzle.id)
              ? 'View Hint (Unlocked)'
              : hintsLeft > 0
              ? `Need a Hint? (${hintsLeft}/3 left)`
              : 'No Hints Left (0/3)'}
          </span>
        </button>
      </div>

      {/* 4 Large Tactile Options Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentPuzzle.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentPuzzle.correctAnswer;
            const showCorrectHighlight = answeredState !== 'idle' && isCorrect;
            const showWrongHighlight = answeredState === 'wrong' && isSelected;

            let btnStyle = 'bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700 hover:border-indigo-500';
            if (showCorrectHighlight) {
              btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]';
            } else if (showWrongHighlight) {
              btnStyle = 'bg-rose-600/90 border-rose-400 text-white shadow-lg shadow-rose-600/30 animate-shake';
            }

            return (
              <button
                key={idx}
                id={`btn-option-${idx}`}
                disabled={answeredState !== 'idle'}
                onClick={() => handleAnswerSubmit(option)}
                className={`w-full py-4 px-5 rounded-2xl border-2 font-['JetBrains_Mono'] font-extrabold text-lg sm:text-xl flex items-center justify-between transition-all transform active:scale-98 cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <span className="w-7 h-7 rounded-lg bg-black/20 text-xs font-sans font-bold flex items-center justify-center text-slate-300">
                  {idx + 1}
                </span>
                <span className="flex-1 text-center font-black">{option}</span>
                <span className="w-7 text-xs text-right opacity-0">.</span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-400 hidden sm:block">
          💡 Tip: Press numeric keys <strong>1, 2, 3, 4</strong> on your keyboard to submit quickly!
        </p>
      </div>

      {/* Hint / Mathematical Insight Modal */}
      {showHintModal && currentPuzzle && (() => {
        const hintDetails = getPuzzleHintDetails(currentPuzzle);
        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-200">
              {/* Header with Title & 3-Bulb Tracker */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                    <Lightbulb className="w-5 h-5 fill-amber-400" />
                    <span>Mathematical Insight & Hint</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Partial calculations and governing mathematical rules
                  </p>
                </div>
                <button
                  id="btn-close-hint"
                  onClick={() => setShowHintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Hints per session indicator */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl text-xs">
                <span className="text-slate-300 font-medium">Session Hints Remaining:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((slot) => {
                    const isUsed = slot > hintsLeft;
                    return (
                      <span
                        key={slot}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          !isUsed
                            ? 'bg-amber-400/20 border border-amber-400/60 text-amber-300 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-800 border border-slate-700 text-slate-600'
                        }`}
                        title={!isUsed ? `Hint slot ${slot} available` : `Hint slot ${slot} used`}
                      >
                        <Lightbulb className={`w-3 h-3 ${!isUsed ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </span>
                    );
                  })}
                  <span className="ml-1.5 font-extrabold text-amber-300 text-xs">
                    {hintsLeft} / 3
                  </span>
                </div>
              </div>

              {/* Section 1: Mathematical Rule */}
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Mathematical Principle & Rule</span>
                </div>
                <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                  {hintDetails.mathRule}
                </p>
              </div>

              {/* Section 2: Partial Calculation */}
              <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Partial Calculation / Step Reduction</span>
                </div>
                <div className="bg-black/40 border border-amber-900/40 rounded-xl p-2.5 font-['JetBrains_Mono'] text-xs text-amber-200 leading-relaxed whitespace-pre-line select-none">
                  {hintDetails.partialCalculation}
                </div>
              </div>

              {/* Section 3: Solver Clue */}
              <div className="px-3.5 py-2.5 bg-slate-800/40 rounded-2xl text-xs text-slate-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {hintDetails.generalHint}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">
                  Max 3 hints per game session
                </span>
                <button
                  id="btn-confirm-hint"
                  onClick={() => {
                    sound.playClick();
                    setShowHintModal(false);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer transition-all"
                >
                  Got It! Let's Solve
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Out of Hints Modal */}
      {showNoHintsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Hints Remaining</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have utilized all <strong className="text-amber-300">3 hints</strong> allowed for this game session. Test your speed and mental math for the remaining questions!
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-[11px] text-slate-300 flex items-center justify-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
              <span>Hints reset automatically when you start a new game session.</span>
            </div>

            <button
              id="btn-close-no-hints"
              onClick={() => {
                sound.playClick();
                setShowNoHintsModal(false);
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-600 transition-colors cursor-pointer"
            >
              Understood, Continue Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
