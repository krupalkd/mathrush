import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, UserStats } from '../types';
import { sound } from '../utils/audio';
import {
  INITIAL_GLOBAL_PLAYERS,
  GlobalPlayerTemplate,
  buildLeaderboardEntries,
} from '../utils/leaderboardData';
import {
  Crown,
  Search,
  Radio,
} from 'lucide-react';

interface LeaderboardViewProps {
  stats: UserStats;
  onOpenBattle?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ stats }) => {
  const [tab, setTab] = useState<'alltime' | 'weekly' | 'daily' | 'battle'>('alltime');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<GlobalPlayerTemplate[]>(INITIAL_GLOBAL_PLAYERS);
  const [recentGainPlayerId, setRecentGainPlayerId] = useState<string | null>(null);

  // Periodic real-time XP simulation for global competitors
  useEffect(() => {
    const liveInterval = setInterval(() => {
      const eligiblePlayers = players.filter((p) => p.status !== 'idle');
      if (eligiblePlayers.length === 0) return;
      const target = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

      const isBattleWin = Math.random() > 0.35;
      const xpGain = isBattleWin ? (Math.random() > 0.7 ? 10000 : 1000) : 150;

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
    }, 4500);

    return () => clearInterval(liveInterval);
  }, [players]);

  // Build unified real-time ranking sorted by XP
  const { entries, userEntry } = buildLeaderboardEntries(players, stats, tab, 'score');

  const filteredEntries = entries.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.country.includes(searchQuery)
  );

  // Top 3 Podium
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

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
            Global XP Standings
          </h1>
          <p className="text-xs text-slate-400">
            Real-time global rankings and authentic XP standings.
          </p>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full">
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
            <span className="text-sm font-mono font-black text-indigo-300 block pt-1">
              {top2.score.toLocaleString()} XP
            </span>
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
            <span className="text-base sm:text-lg font-mono font-black text-amber-400 block pt-1">
              {top1.score.toLocaleString()} XP
            </span>
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
            <span className="text-sm font-mono font-black text-indigo-300 block pt-1">
              {top3.score.toLocaleString()} XP
            </span>
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

      {/* Real-time Global Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Column Headers */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">Player & Country</div>
          <div className="col-span-3 text-right">
            {tab === 'battle' ? 'Arena XP' : 'Total XP'}
          </div>
        </div>

        <div className="divide-y divide-slate-800/70">
          {filteredEntries.map((player) => {
            const isUserRow = player.isUser;
            const hasRecentGain = recentGainPlayerId === player.id;

            return (
              <div
                key={player.id}
                className={`p-3 sm:px-4 sm:py-3.5 transition-all ${
                  isUserRow
                    ? 'bg-indigo-950/50 border-l-4 border-indigo-500 hover:bg-indigo-950/70'
                    : hasRecentGain
                    ? 'bg-amber-950/30 border-l-4 border-amber-400'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Mobile View */}
                <div className="flex sm:hidden items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-mono shrink-0 ${
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

                    <div className="relative shrink-0">
                      <span className="text-xl">{player.avatar}</span>
                      {player.status === 'online' && (
                        <span className="w-2 h-2 bg-emerald-400 rounded-full border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white truncate">
                          {player.name}
                        </span>
                        {isUserRow && (
                          <span className="px-1.5 py-0.2 bg-indigo-500 text-white text-[9px] font-black rounded uppercase">
                            YOU
                          </span>
                        )}
                        {player.isPro && (
                          <span className="px-1 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black rounded flex items-center gap-0.5 shadow-sm">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" />
                            <span>PRO</span>
                          </span>
                        )}
                        <span className="text-[11px]">{player.country}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {player.badge} • Lvl {player.level || 1}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className="font-black text-sm text-amber-400 block">
                      {player.score.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {/* Desktop Grid (sm+) */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                  {/* Rank Column */}
                  <div className="col-span-2 flex items-center justify-center">
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
                  <div className="col-span-7 flex items-center gap-2.5">
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
                        {player.isPro && (
                          <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black rounded flex items-center gap-0.5 shadow-sm">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" />
                            <span>PRO</span>
                          </span>
                        )}
                        <span className="text-xs">{player.country}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {player.badge} • Lvl {player.level || 1}
                      </span>
                    </div>
                  </div>

                  {/* Real XP Score Column */}
                  <div className="col-span-3 text-right font-mono">
                    <span className="font-black text-sm text-white block">
                      {player.score.toLocaleString()} XP
                    </span>
                  </div>
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

          {/* User Real Stats Bar: Real XP */}
          <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/30 self-stretch sm:self-auto justify-end font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {tab === 'battle' ? 'Arena XP' : 'Total Standings XP'}
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
