import React, { useState, useEffect } from 'react';
import { GameMode, PuzzleCategory, UserStats } from '../types';
import {
  Flame,
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Crown,
  Zap,
  Trophy,
  User,
  Home,
  Swords,
  Cloud,
  CloudCheck,
  LogIn,
  RotateCcw,
  Gamepad2,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { refillLivesFull } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPro: () => void;
  activeGameMode?: GameMode;
  selectedCategory?: PuzzleCategory;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onUpdateStats,
  currentTab,
  onSelectTab,
  onOpenPro,
  activeGameMode = 'quick',
  selectedCategory,
}) => {
  const { user, profile, isCloudSynced, isSaving, setAuthModalOpen, setAuthModalMode } = useAuth();
  const [showHeartTooltip, setShowHeartTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refillCountdown, setRefillCountdown] = useState('');

  // Helper to format active game / board name
  const getActiveGameTitle = (): { name: string; icon: string; highlight?: boolean } => {
    switch (currentTab) {
      case 'home':
        return { name: 'Mainboard', icon: '🎮', highlight: true };
      case 'game':
        if (activeGameMode === 'quick') return { name: 'Quick Rush', icon: '⚡' };
        if (activeGameMode === 'streak') return { name: 'Survival Streak', icon: '🔥' };
        if (activeGameMode === 'brain') return { name: 'Memory Matrix', icon: '🧠' };
        if (activeGameMode === 'adaptive') return { name: 'Adaptive Speed IQ', icon: '🎯' };
        if (activeGameMode === 'daily') return { name: 'Daily Challenge', icon: '✨' };
        if (activeGameMode === 'battle') return { name: '1v1 Math Duel', icon: '⚔️' };
        return { name: 'Math Game', icon: '🎮' };
      case 'battle':
        return { name: '1v1 Battle Arena', icon: '⚔️' };
      case 'daily':
        return { name: 'Daily Puzzle', icon: '✨' };
      case 'leaderboard':
        return { name: 'Global Ranks', icon: '🏆' };
      case 'profile':
        return { name: 'Player Profile', icon: '👤' };
      case 'results':
        return { name: 'Match Summary', icon: '📊' };
      default:
        return { name: 'MathRush Game', icon: '⚡' };
    }
  };

  const activeInfo = getActiveGameTitle();

  useEffect(() => {
    const updateCountdown = () => {
      if (stats.lives >= stats.maxLives) {
        setRefillCountdown('Full');
        return;
      }
      const REFILL_MS = 10 * 60 * 1000;
      const elapsed = Date.now() - (stats.lastLifeRefillTimestamp || Date.now());
      const remaining = Math.max(0, REFILL_MS - (elapsed % REFILL_MS));
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setRefillCountdown(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats.lives, stats.lastLifeRefillTimestamp, stats.maxLives]);

  const toggleSound = () => {
    const updated = !stats.soundEnabled;
    sound.enabled = updated;
    onUpdateStats({ ...stats, soundEnabled: updated });
    if (updated) sound.playClick();
  };

  const handleRefillLives = () => {
    sound.playClick();
    const updated = refillLivesFull(stats);
    onUpdateStats(updated);
    setShowHeartTooltip(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
      {/* Primary Top Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 h-12 sm:h-14 md:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Game Name Header */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-brand-home"
            onClick={() => {
              sound.playClick();
              onSelectTab('home');
            }}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none text-left"
            title="MathRush - Return to Game Mainboard"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base md:text-lg tracking-tight text-white font-['Outfit']">
                  MathRush
                </span>
                <span className="hidden xs:inline-flex px-1.5 py-0.2 sm:py-0.5 text-[9px] sm:text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase tracking-wider">
                  Game
                </span>
                {stats.isPro && (
                  <span className="px-1.5 py-0.2 sm:py-0.5 text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded uppercase tracking-wider">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block leading-none">
                Speed Mental Math Arena
              </p>
            </div>
          </button>

          {/* Active Mainboard / Game Mode Indicator Chip */}
          <div
            id="navbar-active-game-indicator"
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              currentTab === 'home'
                ? 'bg-indigo-950/60 border-indigo-700/50 text-indigo-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <span>{activeInfo.icon}</span>
            <span className="text-white font-black">{activeInfo.name}</span>
          </div>
        </div>

        {/* Center Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            id="nav-tab-home"
            onClick={() => {
              sound.playClick();
              onSelectTab('home');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'home'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Mainboard
          </button>
          <button
            id="nav-tab-leaderboard"
            onClick={() => {
              sound.playClick();
              onSelectTab('leaderboard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
          <button
            id="nav-tab-profile"
            onClick={() => {
              sound.playClick();
              onSelectTab('profile');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </button>
        </nav>

        {/* Right Status Bars & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hearts / Lives (Desktop view) */}
          <div className="relative hidden md:block">
            <button
              id="btn-hearts-indicator"
              onClick={() => setShowHeartTooltip(!showHeartTooltip)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/50 border border-rose-800/40 rounded-lg hover:border-rose-600/60 transition-colors cursor-pointer"
              title="Lives remaining"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="font-bold text-xs text-rose-200">
                {stats.lives}/{stats.maxLives}
              </span>
            </button>

            {showHeartTooltip && (
              <div className="absolute right-0 mt-2 w-56 p-3.5 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">❤️ Lives Status</span>
                  <span className="text-rose-400 font-bold">{stats.lives}/{stats.maxLives}</span>
                </div>
                <p className="text-slate-300 text-[11px] mb-2.5">
                  {stats.lives < stats.maxLives
                    ? `Next heart refilling in ${refillCountdown}`
                    : 'Your energy is completely full!'}
                </p>
                {stats.lives < stats.maxLives && (
                  <button
                    onClick={handleRefillLives}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    ⚡ Instant Refill (Free)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Daily Streak (Desktop view) */}
          <div
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/40 border border-amber-800/40 rounded-lg"
            title={`${stats.streak} day streak!`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-extrabold text-xs text-amber-300">{stats.streak}</span>
          </div>

          {/* Level Badge (Desktop view) */}
          <button
            id="btn-level-badge"
            onClick={() => {
              sound.playClick();
              onSelectTab('profile');
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/50 border border-indigo-800/40 rounded-lg hover:border-indigo-600 transition-colors cursor-pointer"
            title="Your Player Level"
          >
            <span className="text-xs">⭐</span>
            <span className="font-bold text-xs text-indigo-200">Lv.{stats.level}</span>
          </button>

          {/* Upgrade to Pro Button */}
          {!stats.isPro ? (
            <button
              id="btn-go-pro-nav"
              onClick={() => {
                sound.playClick();
                onOpenPro();
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[10px] sm:text-xs rounded-lg shadow-sm transition-all transform active:scale-95 cursor-pointer shrink-0"
              title="Upgrade to Pro"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 shrink-0" />
              <span>PRO</span>
            </button>
          ) : null}

          {/* Sound / Volume Toggle Button */}
          <button
            id="btn-toggle-sound"
            onClick={toggleSound}
            className="w-8 h-8 sm:w-9 sm:h-9 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg border border-slate-700/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title={stats.soundEnabled ? 'Sound is ON (Click to Mute)' : 'Sound is MUTED (Click to Unmute)'}
            aria-label={stats.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
            )}
          </button>

          {/* Cloud Sync & Auth Button */}
          {user ? (
            <div className="relative">
              <button
                id="btn-user-cloud-menu"
                onClick={() => {
                  sound.playClick();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors cursor-pointer shrink-0"
                title={user.email || user.displayName || 'Cloud Account'}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] sm:text-xs overflow-hidden shrink-0 border border-indigo-400/40">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{stats.avatar || '🦊'}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-200 hidden sm:inline max-w-[70px] truncate">
                    {user.displayName?.split(' ')[0] || stats.name}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                      isSaving
                        ? 'bg-amber-400 animate-ping'
                        : isCloudSynced
                        ? 'bg-emerald-400'
                        : 'bg-slate-500'
                    }`}
                    title={isSaving ? 'Syncing to cloud...' : isCloudSynced ? 'Cloud Synced' : 'Local'}
                  />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs space-y-2.5 animate-scale-up">
                  <div className="border-b border-slate-800 pb-2">
                    <p className="font-bold text-white truncate">{user.displayName || stats.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || 'Guest Player'}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>Cloud Auto-Save Active</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowUserMenu(false);
                      onSelectTab('profile');
                    }}
                    className="w-full py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-left font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>View Cloud Profile & XP</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowUserMenu(false);
                      setAuthModalMode('fresh');
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2 px-2.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 rounded-lg text-left font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Start Fresh Process</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-open-signin-nav"
              onClick={() => {
                sound.playClick();
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar with Full Icons & Unclipped Labels */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-lg border-t border-slate-800 px-4 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl">
        <button
          id="btn-mobile-nav-mainboard"
          onClick={() => {
            sound.playClick();
            onSelectTab('home');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-xl transition-all cursor-pointer min-w-[70px] ${
            currentTab === 'home'
              ? 'bg-indigo-600/20 text-indigo-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5 shrink-0" />
          <span className="text-[11px] tracking-tight leading-none font-bold">Mainboard</span>
        </button>

        <button
          id="btn-mobile-nav-ranks"
          onClick={() => {
            sound.playClick();
            onSelectTab('leaderboard');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-xl transition-all cursor-pointer min-w-[70px] ${
            currentTab === 'leaderboard'
              ? 'bg-indigo-600/20 text-indigo-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5 shrink-0" />
          <span className="text-[11px] tracking-tight leading-none font-bold">Ranks</span>
        </button>

        <button
          id="btn-mobile-nav-profile"
          onClick={() => {
            sound.playClick();
            onSelectTab('profile');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-xl transition-all cursor-pointer min-w-[70px] ${
            currentTab === 'profile'
              ? 'bg-indigo-600/20 text-indigo-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="text-[11px] tracking-tight leading-none font-bold">Profile</span>
        </button>
      </div>
    </header>
  );
};
