import React, { useState } from 'react';
import { WifiOff, ShieldCheck, Zap, X, ChevronRight } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineBannerProps {
  onGoToProfile?: () => void;
  onSelectOfflineMode?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  onGoToProfile,
  onSelectOfflineMode,
}) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="offline-status-banner"
      className="sticky top-0 z-40 w-full bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/40 text-slate-100 px-3 py-2 shadow-lg transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-amber-300">
              <span>Offline Mode Active</span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40 text-amber-200">
                Cached Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Your profile, stats, achievements, and saved game modes (Quick Math, Streak, Daily Challenge, Master Olympiad) are fully cached and playable offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onGoToProfile && (
            <button
              onClick={onGoToProfile}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
            >
              View Stats & Profile
            </button>
          )}

          {onSelectOfflineMode && (
            <button
              onClick={onSelectOfflineMode}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>Play Offline</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
