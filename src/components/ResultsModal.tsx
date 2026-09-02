import React, { useState, useEffect } from 'react';
import { GameMode, PuzzleResult, UserStats } from '../types';
import { sound } from '../utils/audio';
import { Trophy, Clock, Target, Zap, Share2, RotateCcw, Home, Sparkles, CheckCircle2, XCircle, Download, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadShareCard, shareScoreToSocial } from '../utils/shareImage';

interface ResultsModalProps {
  score: number;
  totalQuestions: number;
  totalTimeSpent: number;
  resultsList: PuzzleResult[];
  mode: GameMode;
  leveledUp: boolean;
  newLevel?: number;
  xpEarned: number;
  stats: UserStats;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  score,
  totalQuestions,
  totalTimeSpent,
  resultsList,
  mode,
  leveledUp,
  newLevel,
  xpEarned,
  stats,
  onPlayAgain,
  onGoHome,
}) => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const avgSpeed = totalQuestions > 0 ? Number((totalTimeSpent / totalQuestions).toFixed(1)) : 0;
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (leveledUp) {
      sound.playLevelUp();
    } else if (score >= Math.max(1, Math.floor(totalQuestions * 0.7))) {
      sound.playBattleWin();
    }
  }, [leveledUp, score, totalQuestions]);

  const handleToggleAccordion = (idx: number) => {
    sound.playClick();
    setActiveAccordion(activeAccordion === idx ? null : idx);
  };

  const handleAskAICoach = async (result: PuzzleResult, idx: number) => {
    sound.playClick();
    setLoadingAi((prev) => ({ ...prev, [result.puzzleId]: true }));

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: result.question,
          userAnswer: result.userAnswer,
          correctAnswer: result.correctAnswer,
        }),
      });
      const data = await res.json();
      setAiExplanations((prev) => ({
        ...prev,
        [result.puzzleId]: data.explanation || result.explanation,
      }));
    } catch {
      setAiExplanations((prev) => ({
        ...prev,
        [result.puzzleId]: result.explanation,
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [result.puzzleId]: false }));
    }
  };

  const handleDownloadCard = () => {
    sound.playClick();
    const bestResult = resultsList.find((r) => r.isCorrect) || resultsList[0];
    downloadShareCard({
      appName: 'MathRush',
      puzzleQuestion: bestResult ? bestResult.question : 'Math Puzzle',
      timeSeconds: avgSpeed || 8.4,
      userName: stats.name,
      userRankTitle: stats.title,
      modeName: mode.toUpperCase(),
    });
  };

  const handleSocialShare = (channel: 'whatsapp' | 'twitter' | 'telegram' | 'native') => {
    sound.playClick();
    const bestResult = resultsList.find((r) => r.isCorrect) || resultsList[0];
    shareScoreToSocial(
      {
        appName: 'MathRush',
        puzzleQuestion: bestResult ? bestResult.question : 'Math Puzzle',
        timeSeconds: avgSpeed || 8.4,
        userName: stats.name,
        userRankTitle: stats.title,
        modeName: mode.toUpperCase(),
      },
      channel
    );
    if (channel === 'native') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-slate-100 space-y-6">
      {/* Top Banner Celebration */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-3xl shadow-xl shadow-amber-500/20">
          {score === totalQuestions ? '👑' : score > 0 ? '🏆' : '🎯'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
          {score === totalQuestions
            ? 'PERFECT RUN!'
            : score >= totalQuestions / 2
            ? 'SESSION COMPLETE!'
            : 'GOOD EFFORT!'}
        </h2>
        <p className="text-xs text-slate-300">
          {accuracy >= 80 ? 'Incredible mental agility!' : 'Practice makes speed effortless!'}
        </p>

        {/* Level Up Banner */}
        {leveledUp && (
          <div className="my-2 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl font-extrabold text-xs shadow-md animate-bounce">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>LEVEL UP! You reached Level {newLevel || stats.level} ({stats.title})!</span>
          </div>
        )}
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <Target className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
          <span className="text-lg font-extrabold text-white">
            {score} / {totalQuestions}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Speed</span>
          <span className="text-lg font-extrabold text-white">{avgSpeed}s</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold block">XP Gained</span>
          <span className="text-lg font-extrabold text-amber-400">+{xpEarned}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <Trophy className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Accuracy</span>
          <span className="text-lg font-extrabold text-white">{accuracy}%</span>
        </div>
      </div>

      {/* Viral "Share My Score" Box (Section 7 Blueprint) */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-indigo-300 font-extrabold text-xs">
            <Share2 className="w-4 h-4" />
            <span>VIRAL CHALLENGE</span>
          </div>
          <p className="text-sm font-extrabold text-white">
            “I solved it in {avgSpeed}s! Can you beat me?”
          </p>
          <p className="text-[11px] text-slate-400">
            Generate an attractive branded card for WhatsApp, Instagram, or Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={handleDownloadCard}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Image Card</span>
          </button>
          <button
            onClick={() => handleSocialShare('whatsapp')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            title="Share to WhatsApp"
          >
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => handleSocialShare('native')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 cursor-pointer"
            title="Copy Link / Native Share"
          >
            <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Question Breakdown with AI Coach */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Step-by-Step Solutions & Explanations ({resultsList.length})
        </h3>

        <div className="space-y-2">
          {resultsList.map((item, idx) => {
            const isOpen = activeAccordion === idx;
            const customAi = aiExplanations[item.puzzleId];
            const isThinking = loadingAi[item.puzzleId];

            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs transition-all"
              >
                <button
                  onClick={() => handleToggleAccordion(idx)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/60 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-['JetBrains_Mono'] font-bold text-white text-sm block">
                        {item.question}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Your answer: <strong className={item.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>{item.userAnswer}</strong> • Time: {item.timeSpentSeconds}s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-semibold text-[11px]">Correct: {item.correctAnswer}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 space-y-2.5">
                    <div className="text-slate-300 leading-relaxed font-mono whitespace-pre-line text-[11px]">
                      {customAi || item.explanation}
                    </div>

                    {!customAi && (
                      <button
                        disabled={isThinking}
                        onClick={() => handleAskAICoach(item, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-300 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isThinking ? 'AI Coach is explaining...' : 'Ask AI Coach for Mental Shortcut'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home Hub</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4 fill-slate-950" />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};
