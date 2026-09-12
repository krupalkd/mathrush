import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, Trophy, ArrowRight, X, Zap } from 'lucide-react';
import { getTitleForLevel } from '../utils/storage';

interface LevelUpOverlayProps {
  isOpen: boolean;
  level: number;
  title?: string;
  previousLevel?: number;
  onClose: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  isOpen,
  level,
  title,
  previousLevel,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Play celebration audio
    sound.playLevelUp();

    // Staggered multi-cannon confetti sequence
    const triggerConfettiSequence = () => {
      // 1. Initial burst from center
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { x: 0.5, y: 0.55 },
        colors: ['#fbbf24', '#f59e0b', '#6366f1', '#a855f7', '#10b981', '#ffffff'],
        disableForReducedMotion: true,
      });

      // 2. Left cannon
      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.65 },
          colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#eab308'],
          disableForReducedMotion: true,
        });
      }, 250);

      // 3. Right cannon
      const timer2 = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.65 },
          colors: ['#fbbf24', '#8b5cf6', '#ec4899', '#eab308'],
          disableForReducedMotion: true,
        });
      }, 450);

      // 4. Golden shower stars
      const timer3 = setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 120,
          origin: { x: 0.5, y: 0.4 },
          shapes: ['circle'],
          colors: ['#fbbf24', '#fef08a', '#f59e0b'],
          gravity: 0.8,
          scalar: 1.2,
          disableForReducedMotion: true,
        });
      }, 750);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    };

    const cleanupTimers = triggerConfettiSequence();

    // Keyboard escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanupTimers();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTitle = title || getTitleForLevel(level);
  const oldLevel = previousLevel || Math.max(1, level - 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Up Celebration"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Radiant Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/25 via-indigo-600/20 to-orange-500/25 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main Celebration Card */}
      <div
        id="level-up-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm sm:max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/15 space-y-6 overflow-hidden transform transition-all animate-scale-up"
      >
        {/* Decorative Top Flare */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500" />

        {/* Close Icon */}
        <button
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Eyebrow Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
          <span>Milestone Reached</span>
        </div>

        {/* Level Up Medallion & Glow Ring */}
        <div className="relative flex items-center justify-center my-2">
          {/* Outer Pulsing Glow Aura */}
          <div className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-xl animate-ping pointer-events-none" />

          {/* Rotating Halo Border */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center p-2 border border-amber-500/30">
              <span className="text-3xl sm:text-4xl">👑</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 font-mono mt-1">
                LEVEL
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] leading-none">
                {level}
              </span>
            </div>
          </div>
        </div>

        {/* Title & Level Progression */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
            LEVEL UP!
          </h2>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-400 font-semibold font-mono">Level {oldLevel}</span>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-extrabold text-amber-300 font-mono text-base">
              Level {level}
            </span>
          </div>

          <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold rounded-xl text-xs">
            Rank: {currentTitle}
          </div>
        </div>

        {/* Perks & Unlocked Rewards Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Rank Rewards & Perks Unlocked</span>
          </div>

          <ul className="space-y-1.5 text-slate-300 pl-1 text-[11px]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Energy and lives restored to maximum stamina</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Climbed higher in global leaderboard rank standings</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span>Unlocked new math arena multiplier bonus</span>
            </li>
          </ul>
        </div>

        {/* Primary Action Button */}
        <button
          id="btn-level-up-continue"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Claim & Continue</span>
        </button>
      </div>
    </div>
  );
};
