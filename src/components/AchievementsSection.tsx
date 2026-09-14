import React, { useState, useMemo } from 'react';
import { Achievement, UserStats } from '../types';
import { INITIAL_ACHIEVEMENTS, getAchievementProgress, addXp } from '../utils/storage';
import { sound } from '../utils/audio';
import {
  Award,
  Trophy,
  Flame,
  Target,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  Swords,
  Crown,
  Clock,
  Check,
  X,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementsSectionProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

type FilterCategory = 'all' | 'milestones' | 'streaks' | 'battles' | 'skills' | 'unlocked' | 'in_progress';

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Compute live progress for each achievement
  const achievementsWithStatus = useMemo(() => {
    return INITIAL_ACHIEVEMENTS.map((ach) => {
      const progress = getAchievementProgress(ach, stats);
      return {
        ...ach,
        ...progress,
      };
    });
  }, [stats]);

  // Overall completion metrics
  const totalBadges = achievementsWithStatus.length;
  const unlockedCount = achievementsWithStatus.filter((a) => a.isClaimed || a.isEligible).length;
  const claimedCount = achievementsWithStatus.filter((a) => a.isClaimed).length;
  const unclaimedCount = achievementsWithStatus.filter((a) => a.isEligible && !a.isClaimed).length;
  const overallPercent = Math.round((unlockedCount / totalBadges) * 100);

  const totalEarnedXp = achievementsWithStatus
    .filter((a) => a.isClaimed)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const pendingClaimableXp = achievementsWithStatus
    .filter((a) => a.isEligible && !a.isClaimed)
    .reduce((sum, a) => sum + a.xpReward, 0);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievementsWithStatus.filter((ach) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'unlocked') return ach.isClaimed || ach.isEligible;
      if (selectedCategory === 'in_progress') return !ach.isClaimed && !ach.isEligible;
      return ach.category === selectedCategory;
    });
  }, [achievementsWithStatus, selectedCategory]);

  // Claim a single achievement
  const handleClaimAchievement = (achId: string, xpReward: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playBattleWin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const currentAchList = Array.isArray(stats.achievements) ? stats.achievements : [];
    if (currentAchList.includes(achId)) return;

    const updatedAchList = [...currentAchList, achId];
    const { updated } = addXp(
      {
        ...stats,
        achievements: updatedAchList,
      },
      xpReward
    );

    onUpdateStats(updated);
  };

  // Claim all eligible achievements at once
  const handleClaimAll = () => {
    const eligibleBadges = achievementsWithStatus.filter((a) => a.isEligible && !a.isClaimed);
    if (eligibleBadges.length === 0) return;

    sound.playBattleWin();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });

    let cumulativeStats = { ...stats };
    const currentAchList = new Set(cumulativeStats.achievements || []);

    let totalBonusXp = 0;
    for (const badge of eligibleBadges) {
      currentAchList.add(badge.id);
      totalBonusXp += badge.xpReward;
    }

    cumulativeStats.achievements = Array.from(currentAchList);
    const { updated } = addXp(cumulativeStats, totalBonusXp);
    onUpdateStats(updated);
  };

  const handleShareBadge = (badge: Achievement) => {
    sound.playClick();
    const shareText = `🏆 I just unlocked the '${badge.title}' badge in MathRush! Can you beat my math streak? Play now: ${window.location.origin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const getRarityBadgeStyle = (rarity?: string) => {
    switch (rarity) {
      case 'platinum':
        return {
          border: 'border-cyan-500/40',
          bg: 'bg-gradient-to-br from-slate-900 to-cyan-950/40',
          tag: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          glow: 'from-cyan-500/20 to-indigo-500/20',
          medallion: 'border-cyan-400 bg-cyan-950/80 text-cyan-200',
        };
      case 'gold':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-gradient-to-br from-slate-900 to-amber-950/30',
          tag: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'from-amber-500/20 to-orange-500/20',
          medallion: 'border-amber-400 bg-amber-950/80 text-amber-200',
        };
      case 'silver':
        return {
          border: 'border-slate-600/60',
          bg: 'bg-slate-900',
          tag: 'bg-slate-800 text-slate-300 border-slate-700',
          glow: 'from-slate-700/20 to-slate-800/20',
          medallion: 'border-slate-400 bg-slate-800 text-slate-200',
        };
      default:
        return {
          border: 'border-amber-700/40',
          bg: 'bg-slate-900',
          tag: 'bg-amber-900/30 text-amber-400 border-amber-800/50',
          glow: 'from-amber-900/10 to-slate-900',
          medallion: 'border-amber-700 bg-slate-900 text-amber-400',
        };
    }
  };

  return (
    <section id="achievements-section" className="space-y-4">
      {/* Section Header & Summary Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                  Achievements & Unlockable Badges
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {unlockedCount}/{totalBadges} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock prestigious medals for milestone achievements like 100 Correct Answers and 5-Day Streaks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Earned XP</span>
              <span className="text-xs font-black text-amber-300 font-mono">
                +{totalEarnedXp.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Total Milestone Completion
            </span>
            <span className="text-amber-300 font-mono font-bold">{overallPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Unclaimed Badges Alert Notification */}
        {unclaimedCount > 0 && (
          <div className="p-3.5 bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎉</span>
              <div>
                <span className="font-bold text-amber-200 block">
                  {unclaimedCount} Milestone Badge{unclaimedCount > 1 ? 's' : ''} Ready to Claim!
                </span>
                <span className="text-slate-300 text-[11px]">
                  Claim your rewards now to collect an extra +{pendingClaimableXp.toLocaleString()} XP.
                </span>
              </div>
            </div>

            <button
              id="btn-claim-all-achievements"
              onClick={handleClaimAll}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider text-xs whitespace-nowrap"
            >
              Claim All (+{pendingClaimableXp.toLocaleString()} XP)
            </button>
          </div>
        )}

        {/* Filter Navigation Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            id="filter-ach-all"
            onClick={() => {
              sound.playClick();
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Badges ({totalBadges})
          </button>

          <button
            id="filter-ach-milestones"
            onClick={() => {
              sound.playClick();
              setSelectedCategory('milestones');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === 'milestones'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            🎯 Milestones (100 Answers)
          </button>

          <button
            id="filter-ach-streaks"
            onClick={() => {
              sound.playClick();
              setSelectedCategory('streaks');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === 'streaks'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            🔥 Streaks (5-Day Streak)
          </button>

          <button
            id="filter-ach-unlocked"
            onClick={() => {
              sound.playClick();
              setSelectedCategory('unlocked');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === 'unlocked'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            ✓ Unlocked ({unlockedCount})
          </button>

          <button
            id="filter-ach-in-progress"
            onClick={() => {
              sound.playClick();
              setSelectedCategory('in_progress');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === 'in_progress'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            ⏳ In Progress ({totalBadges - unlockedCount})
          </button>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredAchievements.map((ach) => {
          const style = getRarityBadgeStyle(ach.rarity);
          const isFeaturedTarget = ach.id === 'ach_100_answers' || ach.id === 'ach_5_day_streak';

          return (
            <div
              key={ach.id}
              id={`badge-card-${ach.id}`}
              onClick={() => {
                sound.playOptionSelect();
                setSelectedBadge(ach);
              }}
              className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between gap-4 ${
                style.bg
              } ${style.border} ${
                ach.isClaimed
                  ? 'shadow-lg shadow-black/40'
                  : ach.isEligible
                  ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                  : 'opacity-85 hover:opacity-100 hover:border-slate-700'
              } hover:-translate-y-0.5`}
            >
              {/* Highlight Ribbon for specific key milestones */}
              {isFeaturedTarget && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-xl tracking-wider shadow-sm">
                  Featured Milestone
                </div>
              )}

              {/* Badge Top Header: Medallion + Title + Rarity */}
              <div className="flex items-start gap-3.5">
                {/* Medallion Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-inner transition-transform ${
                      ach.isClaimed
                        ? `${style.medallion} scale-100`
                        : ach.isEligible
                        ? 'border-amber-400 bg-amber-950/70 text-amber-200 animate-pulse'
                        : 'border-slate-800 bg-slate-950 text-slate-600'
                    }`}
                  >
                    <span>{ach.icon}</span>
                  </div>

                  {/* Corner Status Badge */}
                  {ach.isClaimed ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : ach.isEligible ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-md animate-bounce">
                      !
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] border border-slate-700">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <div className="space-y-1 flex-1 pr-12 sm:pr-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-black text-white leading-tight">
                      {ach.title}
                    </h3>
                    {ach.rarity && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${style.tag}`}>
                        {ach.rarity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar & Current Ratio */}
              <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[170px] sm:max-w-none">
                    {ach.remainingText}
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {ach.isClaimed
                      ? `${ach.target} / ${ach.target} (${ach.unit || 'done'})`
                      : `${ach.currentValue} / ${ach.target} ${ach.unit ? `(${ach.unit})` : ''}`}
                  </span>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.isClaimed
                        ? 'bg-emerald-500'
                        : ach.isEligible
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Badge Footer: Reward + Action */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="text-xs font-black font-mono text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +{ach.xpReward.toLocaleString()} XP Reward
                </span>

                {ach.isClaimed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : ach.isEligible ? (
                  <button
                    id={`btn-claim-${ach.id}`}
                    onClick={(e) => handleClaimAchievement(ach.id, ach.xpReward, e)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 uppercase tracking-wider whitespace-nowrap animate-pulse"
                  >
                    <span>Claim Badge</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>{ach.progressPercent}% Completed</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Medallion Showcase */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div
                className={`w-24 h-24 rounded-3xl border-4 flex items-center justify-center text-5xl shadow-2xl ${
                  selectedBadge.unlocked || stats.achievements?.includes(selectedBadge.id)
                    ? 'border-amber-400 bg-amber-950/60 shadow-amber-500/20'
                    : 'border-slate-700 bg-slate-950 text-slate-500'
                }`}
              >
                <span>{selectedBadge.icon}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  {selectedBadge.rarity || 'Milestone'} Badge
                </span>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  {selectedBadge.description}
                </p>
              </div>
            </div>

            {/* Progress Breakdown Card */}
            {(() => {
              const progress = getAchievementProgress(selectedBadge, stats);
              return (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Milestone Requirement</span>
                    <span className="font-bold text-white">
                      {selectedBadge.target} {selectedBadge.unit || 'required'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Your Current Progress</span>
                    <span className="font-mono font-bold text-amber-300">
                      {progress.currentValue} / {selectedBadge.target}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        progress.isClaimed
                          ? 'bg-emerald-500'
                          : progress.isEligible
                          ? 'bg-amber-400'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {progress.remainingText}
                  </p>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {stats.achievements?.includes(selectedBadge.id) ? (
                <button
                  onClick={() => handleShareBadge(selectedBadge)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Share Achievement</span>
                </button>
              ) : getAchievementProgress(selectedBadge, stats).isEligible ? (
                <button
                  onClick={() => {
                    handleClaimAchievement(selectedBadge.id, selectedBadge.xpReward);
                    setSelectedBadge(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Claim +{selectedBadge.xpReward.toLocaleString()} XP
                </button>
              ) : (
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Keep Playing to Unlock
                </button>
              )}
            </div>

            {copiedNotification && (
              <p className="text-center text-xs text-emerald-400 font-bold animate-pulse">
                Copied badge brag link to clipboard! 📋
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
