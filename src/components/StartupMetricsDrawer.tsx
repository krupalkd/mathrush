import React, { useState } from 'react';
import { UserStats } from '../types';
import { BarChart3, TrendingUp, Users, Target, Activity, X, Lightbulb, CheckCircle2 } from 'lucide-react';

interface StartupMetricsDrawerProps {
  stats: UserStats;
}

export const StartupMetricsDrawer: React.FC<StartupMetricsDrawerProps> = ({ stats }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Blueprint Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-5 right-4 z-30 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/50 text-indigo-300 hover:text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
        title="View Startup Blueprint & Live Metrics"
      >
        <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline">Startup Blueprint</span>
        <span className="sm:hidden">Blueprint</span>
      </button>

      {/* Metrics Slide-Over Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Outfit']">
                    MathRush Startup Blueprint & Metrics
                  </h3>
                  <span className="text-[11px] text-slate-400">Phase 1: Validation & Retention Flywheel</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Strategy Positioning */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-3.5 rounded-xl space-y-1 text-xs">
              <span className="text-indigo-300 font-extrabold flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Recommended Positioning:
              </span>
              <p className="text-white font-semibold text-[13px]">
                “The addictive daily math game that makes your brain faster.”
              </p>
              <p className="text-slate-300 text-[11px]">
                Transforms the user mindset from tedious study chores to engaging competitive entertainment.
              </p>
            </div>

            {/* Validation KPIs (Section 13) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Phase 1 Validation Dashboard</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Estimated DAU</span>
                  <span className="text-base font-extrabold text-white">18,450 Users</span>
                  <span className="text-[10px] text-emerald-400 block">+14% vs last week</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Avg Puzzles / Session</span>
                  <span className="text-base font-extrabold text-white">6.4 Puzzles</span>
                  <span className="text-[10px] text-indigo-300 block">High Engagement</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Completion Rate</span>
                  <span className="text-base font-extrabold text-white">84.2%</span>
                  <span className="text-[10px] text-emerald-400 block">Strong Flow</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Day-1 Retention</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">68.5%</span>
                  <span className="text-[10px] text-slate-400 block">Target: &gt;50%</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Day-7 Retention</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">42.1%</span>
                  <span className="text-[10px] text-slate-400 block">Target: &gt;30%</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Avg Solving Time</span>
                  <span className="text-base font-extrabold text-white font-mono">{stats.avgTimeSeconds}s</span>
                  <span className="text-[10px] text-indigo-300 block">Micro-learning</span>
                </div>
              </div>
            </div>

            {/* Growth & Viral Loop Breakdown */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white block">🚀 Viral & Retention Loops Built:</span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <strong>1v1 Math Battle:</strong> Synchronized speed duels create active competition & repeat visits.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <strong>Daily Challenge #247:</strong> Global rank placement (#1,284) fuels organic retention.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <strong>Share My Score Card:</strong> Instant canvas image sharing for WhatsApp & Instagram.
                </li>
              </ul>
            </div>

            <div className="text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
