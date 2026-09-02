import React from 'react';
import { UserStats } from '../types';
import { sound } from '../utils/audio';
import { Crown, Check, Sparkles, X, Zap, ShieldCheck, HeartHandshake } from 'lucide-react';
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
  const handleTogglePro = () => {
    sound.playBattleWin();
    const updated = { ...stats, isPro: !stats.isPro };
    onUpdateStats(updated);
    if (!stats.isPro) {
      confetti({ particleCount: 100, spread: 70 });
    }
  };

  const proFeatures = [
    { title: 'Unlimited Puzzle Hints', desc: 'Never get stuck — step-by-step guidance whenever needed' },
    { title: 'Zero Advertisements', desc: 'Clean, distraction-free pure focus mode' },
    { title: 'Exclusive Master & Genius Puzzles', desc: 'Compete in high-IQ logic and olympiad level math' },
    { title: 'Deep AI Coach Explanations', desc: 'Mental shortcuts and speed math breakdown for every puzzle' },
    { title: 'Unlimited Hearts & Energy', desc: 'Practice and grind endlessly without waiting for heart refills' },
    { title: 'Pro Gold Crown & Badge', desc: 'Golden nameplate on global leaderboards and 1v1 battles' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-750 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 text-3xl mb-1">
            <Crown className="w-8 h-8 text-slate-950 fill-slate-950" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            MathRush Pro Membership
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Supercharge your cognitive speed with unlimited energy, AI coaching, and master challenges.
          </p>
        </div>

        {/* Pricing Card (Section 6 Blueprint: ₹99/mo) */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">
            POPULAR SUBSCRIPTION
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black text-white font-mono">₹99</span>
            <span className="text-xs text-slate-400">/ month (~$1.19/mo)</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            ✓ Cancel anytime • 7-day risk-free guarantee
          </span>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5">
          {proFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{feat.title}</span>
                <span className="text-[11px] text-slate-400 block">{feat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Subscription Toggle Simulator */}
        <div className="pt-2">
          <button
            onClick={handleTogglePro}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-98"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{stats.isPro ? 'Demote to Free Tier' : 'Activate Pro Membership (Instant Demo)'}</span>
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-2">
            Simulate the full monetization experience with one click.
          </p>
        </div>
      </div>
    </div>
  );
};
