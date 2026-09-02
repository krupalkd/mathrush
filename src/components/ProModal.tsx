import React, { useEffect } from 'react';
import { UserStats } from '../types';
import { sound } from '../utils/audio';
import { Crown, Check, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProModalProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTogglePro = () => {
    sound.playBattleWin();
    const updated = { ...stats, isPro: !stats.isPro };
    onUpdateStats(updated);
    if (!stats.isPro) {
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const proFeatures = [
    { title: 'Unlimited Hints', desc: 'Step-by-step guidance' },
    { title: 'Zero Advertisements', desc: '100% pure focus mode' },
    { title: 'Master & Genius Levels', desc: 'Olympiad-tier math' },
    { title: 'Deep AI Explanations', desc: 'Speed breakdown on errors' },
    { title: 'Infinite Hearts & Energy', desc: 'No refill wait times' },
    { title: 'Golden Crown Badge', desc: 'Exclusive leaderboard rank' },
  ];

  return (
    <div
      id="pro-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="pro-modal-container"
        className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl relative text-slate-100 my-auto max-h-[92vh] flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent pointer-events-none" />

        {/* Close Button - High Z-Index & Touch Responsive */}
        <button
          id="btn-close-pro-modal"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-8 h-8 sm:w-9 sm:h-9 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 rounded-full flex items-center justify-center transition-all z-30 cursor-pointer border border-slate-700/80 shadow-md active:scale-90"
          aria-label="Close modal"
          title="Close (Esc)"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="p-4 sm:p-5 relative z-10 space-y-3.5 overflow-y-auto">
          {/* Crown & Headline */}
          <div className="text-center space-y-1 pt-0.5">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 shadow-md shadow-amber-500/25 text-2xl">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 fill-slate-950" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
              MathRush Pro Membership
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 max-w-xs mx-auto leading-tight">
              Unlimited stamina, deep AI tutor hints, and exclusive master challenges.
            </p>
          </div>

          {/* Compact Pricing Box */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 sm:p-3 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
              SPECIAL ACCESS TIER
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">₹99</span>
              <span className="text-xs text-slate-400">/ month (~$1.19/mo)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold block">
              ✓ Cancel anytime • Instant unlocked perks
            </span>
          </div>

          {/* Pro Feature Grid - 2 columns for high density */}
          <div className="grid grid-cols-2 gap-1.5">
            {proFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <div className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-left overflow-hidden">
                  <span className="text-[11px] font-bold text-white block truncate">{feat.title}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{feat.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Subscription Toggle */}
          <div className="pt-1">
            <button
              id="btn-toggle-pro-membership"
              type="button"
              onClick={handleTogglePro}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{stats.isPro ? 'Switch to Free Tier' : 'Activate Pro (Instant Demo)'}</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-1.5">
              {stats.isPro
                ? '⭐ Your account is currently active on the Pro Tier.'
                : 'Click to test instant Pro features across the entire app.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
