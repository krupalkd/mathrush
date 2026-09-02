import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { sound } from '../utils/audio';
import { INITIAL_ACHIEVEMENTS, getLevelProgress, addXp, refillLivesFull } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Award,
  Flame,
  Target,
  Clock,
  Zap,
  Swords,
  Edit2,
  Check,
  Volume2,
  VolumeX,
  Heart,
  Crown,
  Bell,
  BellOff,
  BellRing,
  Send,
  Sparkles,
  Info,
  ShieldCheck,
  AlertTriangle,
  Cloud,
  CloudCheck,
  LogIn,
  LogOut,
  RotateCcw,
  RefreshCw,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onOpenPro: () => void;
}

const AVATAR_OPTIONS = ['🦊', '🦁', '🐼', '⚡', '🧙‍♂️', '🚀', '👑', '💎', '🦄', '🐯', '🦉', '🤖'];
const REMINDER_TIME_OPTIONS = [
  { value: '08:00', label: '8:00 AM (Morning Boost)' },
  { value: '09:00', label: '9:00 AM (Standard Daily)' },
  { value: '12:00', label: '12:00 PM (Lunch Break)' },
  { value: '18:00', label: '6:00 PM (Evening Practice)' },
  { value: '20:00', label: '8:00 PM (Streak Saver)' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  onUpdateStats,
  onOpenPro,
}) => {
  const {
    user,
    profile,
    isCloudSynced,
    isSaving,
    lastSavedAt,
    setAuthModalOpen,
    setAuthModalMode,
    logout,
    startFreshJourney,
  } = useAuth();

  const [now, setNow] = useState<number>(Date.now());
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(stats.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showFreshConfirm, setShowFreshConfirm] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  const getRefillCountdown = (): string => {
    if (stats.lives >= stats.maxLives) return '100% Full';
    const REFILL_INTERVAL_MS = 10 * 60 * 1000;
    const elapsed = now - (stats.lastLifeRefillTimestamp || now);
    const remainingMs = Math.max(0, REFILL_INTERVAL_MS - (elapsed % REFILL_INTERVAL_MS));
    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleRefillLives = () => {
    sound.playClick();
    const updated = refillLivesFull(stats);
    onUpdateStats(updated);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleToggleSound = () => {
    const nextVal = stats.soundEnabled === false;
    sound.enabled = nextVal;
    if (nextVal) sound.playClick();
    onUpdateStats({ ...stats, soundEnabled: nextVal });
  };

  const handleRequestNotificationPermission = async () => {
    sound.playClick();
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        sound.playBattleWin();
        confetti({ particleCount: 50, spread: 60 });
        const updated = {
          ...stats,
          notificationsEnabled: true,
          reminderTime: stats.reminderTime || '09:00',
        };
        onUpdateStats(updated);

        // Immediate sample notification
        try {
          new Notification('🔥 MathRush Daily Streak Reminder Enabled!', {
            body: `You're all set! We will remind you daily at ${stats.reminderTime || '9:00 AM'} to keep your ${stats.streak}-day streak alive and claim +10,000 XP.`,
            icon: '/favicon.ico',
          });
        } catch {
          // Some sandboxes restrict direct Notification constructor
        }
      } else {
        const updated = { ...stats, notificationsEnabled: false };
        onUpdateStats(updated);
      }
    } catch {
      // Fallback
    }
  };

  const handleToggleNotifications = () => {
    sound.playClick();
    if (permissionStatus !== 'granted') {
      handleRequestNotificationPermission();
      return;
    }
    const nextState = !stats.notificationsEnabled;
    onUpdateStats({ ...stats, notificationsEnabled: nextState });
  };

  const handleSendTestNotification = () => {
    sound.playClick();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('⚡ MathRush Daily Puzzle Ready!', {
          body: `Today's +10,000 XP challenge is live! Keep your ${stats.streak}-day streak intact.`,
          icon: '/favicon.ico',
        });
        sound.playOptionSelect();
      } catch {
        // Handle constructor restriction
      }
    }
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleChangeReminderTime = (time: string) => {
    sound.playClick();
    onUpdateStats({ ...stats, reminderTime: time });
  };

  const { currentLevelXp, nextLevelXp, progressPercent } = getLevelProgress(stats.xp, stats.level);

  const handleSaveName = () => {
    sound.playClick();
    if (newName.trim()) {
      const updated = { ...stats, name: newName.trim() };
      onUpdateStats(updated);
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (avatar: string) => {
    sound.playClick();
    const updated = { ...stats, avatar };
    onUpdateStats(updated);
    setShowAvatarPicker(false);
  };

  const handleClaimAchievement = (achId: string, xpReward: number) => {
    sound.playBattleWin();
    confetti({ particleCount: 70, spread: 50 });
    const updatedAch = [...(stats.achievements || []), achId];
    const { updated } = addXp(
      {
        ...stats,
        achievements: updatedAch,
      },
      xpReward
    );
    onUpdateStats(updated);
  };

  const levelTiers = [
    { title: 'Beginner', levels: 'Lv 1–10', icon: '🥉', min: 1 },
    { title: 'Calculator', levels: 'Lv 11–25', icon: '🥈', min: 11 },
    { title: 'Math Master', levels: 'Lv 26–50', icon: '🥇', min: 26 },
    { title: 'Genius', levels: 'Lv 51–100', icon: '💎', min: 51 },
    { title: 'Grandmaster', levels: 'Lv 101+', icon: '👑', min: 101 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 text-slate-100 space-y-6 pb-24 md:pb-12">
      {/* Profile Card Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with edit icon */}
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 p-0.5 text-4xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                {stats.avatar}
              </div>
            </button>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-indigo-600 text-[10px] font-bold rounded-md text-white">
              Edit
            </span>
          </div>

          {/* User Name & Title */}
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-800 border border-slate-600 px-2.5 py-1 text-sm font-bold rounded-lg text-white"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                    {stats.name}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {stats.isPro && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black rounded uppercase">
                  PRO MEMBER
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-extrabold rounded-lg">
                Level {stats.level} • {stats.title}
              </span>
              <span className="text-slate-400">• Total XP: {stats.xp.toLocaleString()}</span>
            </div>

            {/* XP progress bar */}
            <div className="pt-2 space-y-1 max-w-md">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Progress to Next Level</span>
                <span className="text-amber-400 font-mono">
                  {currentLevelXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker Dropdown */}
        {showAvatarPicker && (
          <div className="mt-4 p-4 bg-slate-950 border border-slate-700 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Choose Your Avatar:</span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`p-2 rounded-xl text-2xl hover:bg-slate-800 transition-colors ${
                    stats.avatar === av ? 'bg-indigo-600/40 border border-indigo-500' : 'bg-slate-900'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🎮 Core Player Hub: Dedicated Cards for Lives, Streaks, Level Progression & Volume */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Player Dashboard & Game Settings
          </h2>
          <span className="text-[11px] text-indigo-400 font-semibold">Live Real-time State</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. 💖 Lives & Energy Reserve */}
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lives & Energy</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-white">{stats.lives} / {stats.maxLives}</span>
                    <span className="text-xs text-rose-300 font-bold">Hearts Available</span>
                  </div>
                </div>
              </div>

              {/* Visual Heart Indicators */}
              <div className="flex items-center gap-1">
                {Array.from({ length: stats.maxLives }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < stats.lives
                        ? 'text-rose-500 fill-rose-500'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 block font-medium">Refill Status</span>
                <span className="font-bold text-amber-300">
                  {stats.lives < stats.maxLives
                    ? `Next Heart in ${getRefillCountdown()}`
                    : '100% Full Energy (5/5)'}
                </span>
              </div>

              {stats.lives < stats.maxLives ? (
                <button
                  id="profile-refill-lives-btn"
                  onClick={handleRefillLives}
                  className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  ⚡ Free Full Refill
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-600/30 px-2 py-1 rounded-lg">
                  Max Charged
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {stats.isPro ? (
                <span className="text-amber-300 font-semibold">⭐ Pro Member: You have infinite stamina & instant refills.</span>
              ) : (
                <span>Hearts protect your streak during incorrect puzzle answers. Refills 1 heart every 10 minutes.</span>
              )}
            </p>
          </div>

          {/* 2. 🔥 Daily Streak & Momentum */}
          <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Daily Streak</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-amber-300">{stats.streak} Days</span>
                    <span className="text-xs text-slate-400 font-bold">Active</span>
                  </div>
                </div>
              </div>

              <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] font-black text-amber-300">
                🔥 Active
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Best Streak</span>
                <span className="text-sm font-black text-white">{stats.maxStreak} Days Record</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Daily Reward</span>
                <span className="text-sm font-black text-amber-300">+10,000 XP</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Solve the featured Daily Puzzle every 24 hours to build momentum and maintain global leaderboard placement.
            </p>
          </div>

          {/* 3. ⭐ Level Progression & Rank */}
          <div className="bg-slate-900 border border-indigo-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rank Progression</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-indigo-200">Level {stats.level}</span>
                    <span className="text-xs text-indigo-400 font-bold">• {stats.title}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-black font-mono">
                {stats.xp.toLocaleString()} XP
              </span>
            </div>

            <div className="space-y-1.5 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-300 font-bold">Level {stats.level} to {stats.level + 1}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {currentLevelXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block text-right font-medium">
                {Math.max(0, nextLevelXp - currentLevelXp).toLocaleString()} XP needed for next level
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Earn XP by completing daily math challenges (+10,000 XP) and winning 1v1 battle duels (+1,000 XP).
            </p>
          </div>

          {/* 4. 🔊 Volume & Master Audio Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  stats.soundEnabled !== false
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                }`}>
                  {stats.soundEnabled !== false ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Game Audio & Volume</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-lg font-black ${
                      stats.soundEnabled !== false ? 'text-emerald-300' : 'text-rose-300'
                    }`}>
                      {stats.soundEnabled !== false ? 'Sound ON' : 'Sound MUTED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Master Toggle */}
              <button
                id="profile-master-sound-toggle"
                onClick={handleToggleSound}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all active:scale-95 cursor-pointer shadow-sm ${
                  stats.soundEnabled !== false
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {stats.soundEnabled !== false ? '🔊 Mute Audio' : '🔈 Enable Sound'}
              </button>
            </div>

            {/* Audio Sound Effect Testing Preview Buttons */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Test Sound Synthesizer:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    if (!stats.soundEnabled) sound.enabled = true;
                    sound.playClick();
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Click FX
                </button>
                <button
                  onClick={() => {
                    if (!stats.soundEnabled) sound.enabled = true;
                    sound.playOptionSelect();
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-indigo-300 text-[10px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Select FX
                </button>
                <button
                  onClick={() => {
                    if (!stats.soundEnabled) sound.enabled = true;
                    sound.playBattleWin();
                  }}
                  className="py-1 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-300 text-[10px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Victory FX
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides real-time dynamic acoustic synth feedback during calculation chains, timers, and multiplayer battle victories.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Account & Data Sync Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Cloud Account & Game Sync</h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                    isSaving
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : isCloudSynced
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSaving ? 'bg-amber-400 animate-ping' : isCloudSynced ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  {isSaving ? 'Syncing...' : isCloudSynced ? 'Cloud Synced' : 'Local Only'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user
                  ? `Connected via ${profile?.providerId === 'google.com' ? 'Google' : profile?.providerId === 'facebook.com' ? 'Facebook' : profile?.providerId === 'anonymous' ? 'Guest Mode' : 'Email'}: ${user.email || user.displayName || 'Player'}`
                  : 'Sign in to automatically sync XP, rank, streaks, and battle stats to the cloud.'}
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => {
                sound.playClick();
                logout();
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Connect</span>
            </button>
          )}
        </div>

        {/* Quick Social Connect Bar if not signed in */}
        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Sign-In</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="p-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Sign-In</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAuthModalMode('signin');
                setAuthModalOpen(true);
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Sign-In</span>
            </button>
          </div>
        )}
      </div>

      {/* Start Process Fresh Card */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Start Process Fresh</h3>
              <p className="text-xs text-slate-400">
                Restart your journey from Level 1 with 0 XP, full lives, and fresh record.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowFreshConfirm(!showFreshConfirm);
            }}
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            {showFreshConfirm ? 'Hide Reset' : 'Reset & Start Fresh'}
          </button>
        </div>

        {showFreshConfirm && (
          <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-3 text-xs animate-scale-up">
            <div className="flex items-start gap-2.5 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Are you sure you want to start fresh? This will reset your current Level ({stats.level}), XP ({stats.xp.toLocaleString()}), and streaks to fresh starter stats and synchronize with your cloud account.
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFreshConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await startFreshJourney();
                  setShowFreshConfirm(false);
                  confetti({ particleCount: 70, spread: 80 });
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-lg shadow-md cursor-pointer uppercase tracking-wider"
              >
                Confirm Fresh Start
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Browser Notification Permissions & Daily Streak Reminders Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                Daily Streak Reminders
              </h3>
              <p className="text-[11px] text-slate-400">
                Receive browser notifications before your streak expires (+10,000 XP)
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {permissionStatus === 'granted' && stats.notificationsEnabled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active
            </span>
          ) : permissionStatus === 'granted' && !stats.notificationsEnabled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
              <BellOff className="w-3.5 h-3.5" />
              Paused
            </span>
          ) : permissionStatus === 'denied' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              Blocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5" />
              Not Configured
            </span>
          )}
        </div>

        {/* Permission Action or Toggle Row */}
        {permissionStatus !== 'granted' ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Allow browser notifications to get an alert when a fresh daily challenge goes live and safeguard your active <strong>{stats.streak}-day streak</strong> from resetting.
              </p>
            </div>

            {permissionStatus === 'denied' ? (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-lg p-2.5 space-y-1">
                <span className="font-bold block">Notifications are blocked in your browser</span>
                <span className="text-[11px] text-slate-400 block">
                  Click the lock or settings icon in your browser URL bar to allow notifications for MathRush.
                </span>
              </div>
            ) : permissionStatus === 'unsupported' ? (
              <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                Browser notifications are not supported in this environment.
              </div>
            ) : (
              <button
                id="btn-request-notification-permission"
                onClick={handleRequestNotificationPermission}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-lg shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <BellRing className="w-4 h-4" />
                <span>Enable Browser Streak Reminders</span>
              </button>
            )}
          </div>
        ) : (
          /* Granted Controls */
          <div className="space-y-3 pt-1">
            {/* Toggle Row */}
            <div className="flex items-center justify-between text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div>
                <span className="text-slate-200 font-bold block">Daily Notifications</span>
                <span className="text-[11px] text-slate-400">
                  {stats.notificationsEnabled ? 'Streak alerts will fire at your preferred time' : 'Notifications paused'}
                </span>
              </div>

              <button
                id="btn-toggle-notifications"
                onClick={handleToggleNotifications}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  stats.notificationsEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {stats.notificationsEnabled ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Time Preference Selector */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <label htmlFor="reminder-time-select" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Preferred Reminder Time</span>
                <span className="text-[11px] font-mono text-amber-400">{stats.reminderTime || '09:00'}</span>
              </label>

              <select
                id="reminder-time-select"
                value={stats.reminderTime || '09:00'}
                onChange={(e) => handleChangeReminderTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white font-medium focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                {REMINDER_TIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Notification Trigger */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                id="btn-test-notification"
                onClick={handleSendTestNotification}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Send Test Reminder</span>
              </button>

              {testNotificationSent && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Sent!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Level Roadmap Grid (Section 5 Blueprint) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Rank Progression Ladder
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {levelTiers.map((tier) => {
            const isUnlocked = stats.level >= tier.min;
            const isCurrent = stats.title.toLowerCase().includes(tier.title.toLowerCase());

            return (
              <div
                key={tier.title}
                className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-600/20 scale-105'
                    : isUnlocked
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-slate-950 border-slate-800 opacity-50'
                }`}
              >
                <span className="text-2xl block">{tier.icon}</span>
                <span className="text-xs font-bold text-white block truncate">{tier.title}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{tier.levels}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Statistics Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Performance Metrics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Puzzles Solved
            </span>
            <span className="text-2xl font-black text-white font-mono">{stats.puzzlesSolved}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Overall Accuracy
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.accuracyRate}%</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Avg Solving Speed
            </span>
            <span className="text-2xl font-black text-indigo-300 font-mono">{stats.avgTimeSeconds}s</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" /> Math Battle XP
            </span>
            <span className="text-2xl font-black text-rose-300 font-mono">
              +{(stats.battleWins * 1000).toLocaleString()} XP
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> 1v1 Battle Record
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {stats.battleWins}W / {stats.battleLosses}L
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Longest Streak
            </span>
            <span className="text-2xl font-black text-orange-400 font-mono">
              {stats.maxStreak} in a row
            </span>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Badges & Achievements
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const isClaimed = stats.achievements?.includes(ach.id);
            const isEligible = stats.puzzlesSolved >= 1 || (ach.id === 'ach_speed_demon' && stats.avgTimeSeconds < 15);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  isClaimed
                    ? 'bg-indigo-950/30 border-indigo-500/30'
                    : isEligible
                    ? 'bg-slate-900 border-amber-500/50'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ach.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-white block">{ach.title}</span>
                    <span className="text-[11px] text-slate-400 block">{ach.description}</span>
                  </div>
                </div>

                {isClaimed ? (
                  <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-[10px] font-bold rounded-lg uppercase">
                    Unlocked
                  </span>
                ) : isEligible ? (
                  <button
                    onClick={() => handleClaimAchievement(ach.id, ach.xpReward)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                  >
                    Claim +{ach.xpReward} XP
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">In Progress</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
