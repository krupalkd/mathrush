import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, UserStats } from '../types';
import { sound } from '../utils/audio';
import {
  INITIAL_GLOBAL_PLAYERS,
  GlobalPlayerTemplate,
  buildLeaderboardEntries,
  LiveEventMessage,
} from '../utils/leaderboardData';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Flame,
  Swords,
  Search,
  Zap,
  RefreshCw,
  Radio,
  Clock,
  Target,
  Percent,
  TrendingUp,
  Shield,
  Activity,
  ArrowUpDown,
  Users,
} from 'lucide-react';

interface LeaderboardViewProps {
  stats: UserStats;
  onOpenBattle?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ stats, onOpenBattle }) => {
  const [tab, setTab] = useState<'alltime' | 'weekly' | 'daily' | 'battle'>('alltime');
  const [sortBy, setSortBy] = useState<'score' | 'winrate' | 'speed'>('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<GlobalPlayerTemplate[]>(INITIAL_GLOBAL_PLAYERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectedPlayerIds, setConnectedPlayerIds] = useState<Record<string, boolean>>({});
  const [socialToast, setSocialToast] = useState<{ message: string; icon: string } | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEventMessage[]>([
    {
      id: 'ev-1',
      playerName: 'Vikram Mehta',
      avatar: '🧙‍♂️',
      action: 'Won 1v1 Battle',
      xpDelta: 1000,
      timestamp: Date.now() - 4000,
    },
    {
      id: 'ev-2',
      playerName: 'Elena Rostov',
      avatar: '🦊',
      action: 'Solved Daily Quest',
      xpDelta: 10000,
      timestamp: Date.now() - 15000,
    },
  ]);
  const [recentGainPlayerId, setRecentGainPlayerId] = useState<string | null>(null);

  // Periodic real-time XP simulation for global competitors
  useEffect(() => {
    const liveInterval = setInterval(() => {
      // Pick a random online/in_game player to earn XP or finish a battle
      const eligiblePlayers = players.filter((p) => p.status !== 'idle');
      if (eligiblePlayers.length === 0) return;
      const target = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

      const isBattleWin = Math.random() > 0.35;
      const xpGain = isBattleWin ? (Math.random() > 0.7 ? 10000 : 1000) : 150;
      const actionText =
        xpGain === 10000
          ? 'Solved Daily Quest (+10k XP)'
          : isBattleWin
          ? 'Won 1v1 Battle (+1,000 XP)'
          : 'Completed Quick Rush (+150 XP)';

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === target.id) {
            return {
              ...p,
              baseAllTimeXp: p.baseAllTimeXp + xpGain,
              baseWeeklyXp: p.baseWeeklyXp + xpGain,
              baseDailyXp: p.baseDailyXp + xpGain,
              battleElo: isBattleWin ? p.battleElo + (xpGain >= 1000 ? 15 : 5) : p.battleElo,
              wins: isBattleWin ? p.wins + 1 : p.wins,
              losses: !isBattleWin ? p.losses + 1 : p.losses,
            };
          }
          return p;
        })
      );

      setRecentGainPlayerId(target.id);
      setTimeout(() => setRecentGainPlayerId(null), 2500);

      // Add to live events feed
      setLiveEvents((prev) => [
        {
          id: `ev-${Date.now()}`,
          playerName: target.name,
          avatar: target.avatar,
          action: actionText,
          xpDelta: xpGain,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 3),
      ]);
    }, 4500);

    return () => clearInterval(liveInterval);
  }, [players]);

  const handleManualRefresh = () => {
    sound.playClick();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Build unified real-time ranking with user's actual XP and Win/Loss
  const { entries, userEntry } = buildLeaderboardEntries(players, stats, tab, sortBy);

  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.country.includes(searchQuery)
  );

  // Top 3 Podium
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  // Helper for win rate color badges
  const getWinRateColor = (winRate: number) => {
    if (winRate >= 75) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (winRate >= 50) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-slate-100 space-y-6 pb-28 md:pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-md flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Real-Time Global Network</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
              Live Connected
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
            Global XP & Battle Standings
          </h1>
          <p className="text-xs text-slate-400">
            Real-time rankings with authentic XP, win/loss ratios, and live mathematical battle stats.
          </p>
        </div>

        {/* Live Manual Refresh Action */}
        <button
          onClick={handleManualRefresh}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          title="Refresh real-time standings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sync Real-Time XP</span>
        </button>
      </div>

      {/* Live Activity Feed Marquee */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 overflow-hidden shadow-inner text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-bold shrink-0">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="uppercase text-[10px] tracking-wider text-slate-400">Live Feed:</span>
        </div>
        <div className="flex-1 overflow-hidden truncate">
          {liveEvents.length > 0 && (
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <span className="text-sm">{liveEvents[0].avatar}</span>
              <strong className="text-white">{liveEvents[0].playerName}</strong>
              <span className="text-slate-400">{liveEvents[0].action}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                +{liveEvents[0].xpDelta.toLocaleString()} XP
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: 'alltime', label: 'All-Time XP' },
              { id: 'weekly', label: 'Weekly XP' },
              { id: 'daily', label: 'Daily Sprint' },
              { id: 'battle', label: '1v1 Arena XP' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                setTab(t.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                tab === t.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown / Pills */}
        <div className="flex items-center gap-1.5 self-end md:self-auto text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <button
            onClick={() => {
              sound.playClick();
              setSortBy('score');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              sortBy === 'score'
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'battle' ? 'Arena XP' : 'Real XP'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSortBy('winrate');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              sortBy === 'winrate'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Win/Loss Ratio (%)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSortBy('speed');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              sortBy === 'speed'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Speed
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top1 && top2 && top3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-3 pb-1">
          {/* 2nd Place */}
          <div
            className={`bg-slate-900/90 border rounded-2xl p-3 sm:p-4 text-center order-1 space-y-1 relative shadow-lg ${
              top2.isUser ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-700/80'
            }`}
          >
            <span className="text-2xl sm:text-3xl block">{top2.avatar}</span>
            <span className="text-xs font-bold text-slate-200 block truncate">
              {top2.name} {top2.country}
            </span>
            <div className="inline-block px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-extrabold text-slate-300">
              🥈 Rank #2
            </div>
            <span className="text-sm font-mono font-black text-indigo-300 block">
              {top2.score.toLocaleString()} XP
            </span>
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col items-center gap-0.5">
              <span className="font-bold text-emerald-400">
                {top2.wins}W - {top2.losses}L
              </span>
              <span className="text-slate-400 font-mono">({top2.winRate}% Win Rate)</span>
            </div>
          </div>

          {/* 1st Place (Center & Champion Crown) */}
          <div
            className={`bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-900 border-2 rounded-2xl p-4 sm:p-5 text-center order-2 space-y-1.5 shadow-xl scale-105 ${
              top1.isUser ? 'border-amber-400 shadow-amber-500/30' : 'border-amber-500/70 shadow-amber-500/10'
            }`}
          >
            <div className="w-6 h-6 mx-auto text-amber-400">
              <Crown className="w-6 h-6 fill-amber-400 mx-auto animate-bounce" />
            </div>
            <span className="text-3xl sm:text-4xl block">{top1.avatar}</span>
            <span className="text-xs sm:text-sm font-black text-white block truncate">
              {top1.name} {top1.country}
            </span>
            <div className="inline-block px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider">
              👑 Champion #1
            </div>
            <span className="text-base sm:text-lg font-mono font-black text-amber-400 block">
              {top1.score.toLocaleString()} XP
            </span>
            <div className="pt-1.5 border-t border-amber-500/20 text-[11px] flex flex-col items-center gap-0.5">
              <span className="font-extrabold text-emerald-400">
                {top1.wins}W - {top1.losses}L
              </span>
              <span className="text-amber-300 font-mono font-bold">({top1.winRate}% Win Rate)</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div
            className={`bg-slate-900/90 border rounded-2xl p-3 sm:p-4 text-center order-3 space-y-1 relative shadow-lg ${
              top3.isUser ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-700/80'
            }`}
          >
            <span className="text-2xl sm:text-3xl block">{top3.avatar}</span>
            <span className="text-xs font-bold text-slate-200 block truncate">
              {top3.name} {top3.country}
            </span>
            <div className="inline-block px-2 py-0.5 bg-amber-900/40 border border-amber-700/40 text-amber-400 rounded text-[10px] font-extrabold">
              🥉 Rank #3
            </div>
            <span className="text-sm font-mono font-black text-indigo-300 block">
              {top3.score.toLocaleString()} XP
            </span>
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col items-center gap-0.5">
              <span className="font-bold text-emerald-400">
                {top3.wins}W - {top3.losses}L
              </span>
              <span className="text-slate-400 font-mono">({top3.winRate}% Win Rate)</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search global competitors by name or country..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {/* Social Connection Toast Alert */}
      {socialToast && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 border-2 border-indigo-400 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-indigo-300">
            <span className="text-xl">{socialToast.icon}</span>
            <span>{socialToast.message}</span>
          </div>
          <button
            onClick={() => setSocialToast(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real-time Global Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Column Headers */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">Player & Country</div>
          <div className="col-span-2 text-center">Win / Loss & Rate</div>
          <div className="col-span-2 text-center">Avg Speed</div>
          <div className="col-span-3 text-right">
            {tab === 'battle' ? 'Arena XP & Connect' : 'Real XP & Connect'}
          </div>
        </div>

        <div className="divide-y divide-slate-800/70">
          {filteredEntries.map((player) => {
            const isUserRow = player.isUser;
            const hasRecentGain = recentGainPlayerId === player.id;
            const isConnected = !!connectedPlayerIds[player.id];
            const winLossRatioVal =
              player.losses > 0
                ? (player.wins / player.losses).toFixed(2)
                : player.wins.toFixed(1);

            return (
              <div
                key={player.id}
                className={`p-3.5 sm:px-4 sm:py-3.5 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center transition-all ${
                  isUserRow
                    ? 'bg-indigo-950/50 border-l-4 border-indigo-500 hover:bg-indigo-950/70'
                    : hasRecentGain
                    ? 'bg-amber-950/30 border-l-4 border-amber-400'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Mobile Top Row / Rank & Player */}
                <div className="flex items-center justify-between sm:contents">
                  {/* Rank Column */}
                  <div className="sm:col-span-1 flex items-center justify-start sm:justify-center">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-mono ${
                        player.rank === 1
                          ? 'bg-amber-500 text-slate-950'
                          : player.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white'
                          : isUserRow
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{player.rank}
                    </span>
                  </div>

                  {/* Player Info Column */}
                  <div className="sm:col-span-4 flex items-center gap-2.5">
                    <div className="relative">
                      <span className="text-xl sm:text-2xl">{player.avatar}</span>
                      {player.status === 'online' && (
                        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">
                          {player.name}
                        </span>
                        {isUserRow && (
                          <span className="px-1.5 py-0.2 bg-indigo-500 text-white text-[9px] font-black rounded uppercase">
                            YOU
                          </span>
                        )}
                        <span className="text-xs">{player.country}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {player.badge} • Lvl {player.level || 1}
                      </span>
                    </div>
                  </div>

                  {/* Mobile-only Score Display & Quick Connect */}
                  <div className="sm:hidden text-right font-mono flex flex-col items-end gap-1">
                    <span className="font-black text-base text-amber-400 block">
                      {player.score.toLocaleString()} XP
                    </span>
                    {!isUserRow && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            sound.playCorrect();
                            setConnectedPlayerIds((prev) => ({ ...prev, [player.id]: true }));
                            setSocialToast({
                              message: `Connected with ${player.name} ${player.country}! High-five sent 👋`,
                              icon: '🤝',
                            });
                            confetti({ particleCount: 20, spread: 45 });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            isConnected
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/60'
                          }`}
                        >
                          {isConnected ? '🤝 Connected' : '👋 Connect'}
                        </button>
                        {onOpenBattle && (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onOpenBattle();
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all cursor-pointer"
                          >
                            ⚔️ Duel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Win / Loss Ratio Column */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2 pt-1 sm:pt-0">
                  <span className="sm:hidden text-[11px] text-slate-400 font-semibold">
                    Win / Loss:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      <strong className="text-emerald-400">{player.wins}W</strong> -{' '}
                      <strong className="text-rose-400">{player.losses}L</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border font-mono ${getWinRateColor(
                        player.winRate
                      )}`}
                      title={`Ratio: ${winLossRatioVal}`}
                    >
                      {player.winRate}% Win
                    </span>
                  </div>
                </div>

                {/* Avg Speed Column */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-1 text-xs text-slate-400 font-mono">
                  <span className="sm:hidden text-[11px] text-slate-400 font-semibold">
                    Speed:
                  </span>
                  <span className="flex items-center gap-1 text-indigo-300 font-semibold">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {player.timeSec || 5.0}s
                  </span>
                </div>

                {/* Real XP Score & Connect Column */}
                <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-2 font-mono">
                  <div className="text-right">
                    <span className="font-black text-sm text-white block">
                      {player.score.toLocaleString()} XP
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ratio: {winLossRatioVal}
                    </span>
                  </div>

                  {!isUserRow && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          sound.playCorrect();
                          setConnectedPlayerIds((prev) => ({ ...prev, [player.id]: true }));
                          setSocialToast({
                            message: `Connected with ${player.name} ${player.country}! High-five sent 👋`,
                            icon: '🤝',
                          });
                          confetti({ particleCount: 25, spread: 50 });
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isConnected
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-indigo-600 hover:text-white'
                        }`}
                        title={isConnected ? 'Connected' : 'Send high-five & connect'}
                      >
                        {isConnected ? '🤝' : '👋'}
                      </button>

                      {onOpenBattle && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenBattle();
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1"
                          title={`Challenge ${player.name} to 1v1 Math Battle`}
                        >
                          <Swords className="w-3 h-3" />
                          <span>Duel</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Pinned Rank Summary Bar (Fixed / Standout at Bottom) */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/70 rounded-2xl p-4 shadow-2xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center font-mono shadow-md">
              #{userEntry.rank}
            </div>
            <span className="text-3xl">{userEntry.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white">
                  {userEntry.name} (Your Official Rank)
                </span>
                <span className="px-2 py-0.5 bg-indigo-500 text-[10px] font-black text-white rounded uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <span className="text-xs text-indigo-300">
                {userEntry.badge} • Level {stats.level}
              </span>
            </div>
          </div>

          {/* User Real Stats Bar: Real XP & Win/Loss Ratio */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/30 self-stretch sm:self-auto justify-between sm:justify-end font-mono">
            {/* W/L Ratio */}
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Win / Loss Record
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">
                  <strong className="text-emerald-400">{userEntry.wins}W</strong> -{' '}
                  <strong className="text-rose-400">{userEntry.losses}L</strong>
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${getWinRateColor(
                    userEntry.winRate
                  )}`}
                >
                  {userEntry.winRate}% Win Rate
                </span>
              </div>
            </div>

            {/* Real Total XP */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {tab === 'battle' ? 'Arena XP' : 'Real-Time XP'}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-400 block">
                {userEntry.score.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
