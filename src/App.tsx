import React, { useState, useEffect } from 'react';
import { GameMode, PuzzleCategory, PuzzleResult, UserStats } from './types';
import { sound } from './utils/audio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { GameView } from './components/GameView';
import { MathBattleView } from './components/MathBattleView';
import { DailyChallengeView } from './components/DailyChallengeView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { ResultsModal } from './components/ResultsModal';
import { ProModal } from './components/ProModal';
import { AuthModal } from './components/AuthModal';
import { StartupMetricsDrawer } from './components/StartupMetricsDrawer';

function AppContent() {
  const { stats, updateStats, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('quick');
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory | undefined>(undefined);
  const [showProModal, setShowProModal] = useState<boolean>(false);

  // Game session results state
  const [gameResults, setGameResults] = useState<{
    score: number;
    totalQuestions: number;
    totalTimeSpent: number;
    resultsList: PuzzleResult[];
    mode: GameMode;
    leveledUp: boolean;
    newLevel?: number;
    xpEarned: number;
  } | null>(null);

  useEffect(() => {
    sound.enabled = stats.soundEnabled !== false;
    sound.hapticsEnabled = stats.hapticsEnabled !== false;
  }, [stats.soundEnabled, stats.hapticsEnabled]);

  const handleStartGame = (mode: GameMode, category?: PuzzleCategory) => {
    setActiveGameMode(mode);
    setSelectedCategory(category);
    setCurrentTab('game');
  };

  const handleFinishGame = (results: {
    score: number;
    totalQuestions: number;
    totalTimeSpent: number;
    resultsList: PuzzleResult[];
    mode: GameMode;
    leveledUp: boolean;
    newLevel?: number;
    xpEarned: number;
  }) => {
    setGameResults(results);
    setCurrentTab('results');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-['Plus_Jakarta_Sans']">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/30">
          <span className="text-2xl font-black">⚡</span>
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading your MathRush cloud profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] antialiased selection:bg-indigo-500 selection:text-white">
      {/* Global Top Navbar */}
      <Navbar
        stats={stats}
        onUpdateStats={updateStats}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'game' && !activeGameMode) {
            setActiveGameMode('quick');
          }
          setCurrentTab(tab);
        }}
        onOpenPro={() => setShowProModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-6xl mx-auto">
        {currentTab === 'home' && (
          <HomeView
            stats={stats}
            onStartGame={handleStartGame}
            onOpenDaily={() => setCurrentTab('daily')}
            onOpenBattle={() => setCurrentTab('battle')}
            onOpenLeaderboard={() => setCurrentTab('leaderboard')}
            onOpenProfile={() => setCurrentTab('profile')}
            onOpenPro={() => setShowProModal(true)}
          />
        )}

        {currentTab === 'daily' && (
          <DailyChallengeView
            stats={stats}
            onUpdateStats={updateStats}
            onGoHome={() => setCurrentTab('home')}
            onOpenBattle={() => setCurrentTab('battle')}
          />
        )}

        {currentTab === 'game' && (
          <GameView
            mode={activeGameMode}
            initialCategory={selectedCategory}
            stats={stats}
            onUpdateStats={updateStats}
            onFinishGame={handleFinishGame}
            onExitGame={() => setCurrentTab('home')}
            onOpenPro={() => setShowProModal(true)}
          />
        )}

        {currentTab === 'battle' && (
          <MathBattleView
            stats={stats}
            onUpdateStats={updateStats}
            onBack={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardView
            stats={stats}
            onOpenBattle={() => setCurrentTab('battle')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            stats={stats}
            onUpdateStats={updateStats}
            onOpenPro={() => setShowProModal(true)}
          />
        )}

        {currentTab === 'results' && gameResults && (
          <ResultsModal
            score={gameResults.score}
            totalQuestions={gameResults.totalQuestions}
            totalTimeSpent={gameResults.totalTimeSpent}
            resultsList={gameResults.resultsList}
            mode={gameResults.mode}
            leveledUp={gameResults.leveledUp}
            newLevel={gameResults.newLevel}
            xpEarned={gameResults.xpEarned}
            stats={stats}
            onPlayAgain={() => {
              setCurrentTab('game');
            }}
            onGoHome={() => {
              setCurrentTab('home');
            }}
          />
        )}
      </main>

      {/* Global Auth Modal for Google, Facebook, Email & Fresh Start */}
      <AuthModal />

      {/* Pro Upgrade Subscription Modal */}
      {showProModal && (
        <ProModal
          stats={stats}
          onUpdateStats={updateStats}
          onClose={() => setShowProModal(false)}
        />
      )}

      {/* Startup Blueprint Telemetry Drawer */}
      <StartupMetricsDrawer stats={stats} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

