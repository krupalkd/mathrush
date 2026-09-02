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
import { SignInGate } from './components/SignInGate';
import { StartupMetricsDrawer } from './components/StartupMetricsDrawer';

function AppContent() {
  const { user, stats, updateStats, loading, openAuthForGameplay } = useAuth();
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
    if (!user) {
      openAuthForGameplay(
        () => {
          setActiveGameMode(mode);
          setSelectedCategory(category);
          setCurrentTab('game');
        },
        'Sign in first to start gameplay, climb the leaderboards, and save your progress.'
      );
      return;
    }
    setActiveGameMode(mode);
    setSelectedCategory(category);
    setCurrentTab('game');
  };

  const handleOpenDaily = () => {
    if (!user) {
      openAuthForGameplay(
        () => setCurrentTab('daily'),
        'Sign in first to solve the Daily Challenge and claim +10,000 XP.'
      );
      return;
    }
    setCurrentTab('daily');
  };

  const handleOpenBattle = () => {
    if (!user) {
      openAuthForGameplay(
        () => setCurrentTab('battle'),
        'Sign in first to duel opponents in the 1v1 Live Math Battle Arena.'
      );
      return;
    }
    setCurrentTab('battle');
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
          if (tab === 'game' || tab === 'daily' || tab === 'battle') {
            if (!user) {
              openAuthForGameplay(
                () => {
                  if (tab === 'game' && !activeGameMode) {
                    setActiveGameMode('quick');
                  }
                  setCurrentTab(tab);
                },
                'Sign in first to access MathRush gameplay and keep your streaks intact.'
              );
              return;
            }
          }
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
            onOpenDaily={handleOpenDaily}
            onOpenBattle={handleOpenBattle}
            onOpenLeaderboard={() => setCurrentTab('leaderboard')}
            onOpenProfile={() => setCurrentTab('profile')}
            onOpenPro={() => setShowProModal(true)}
          />
        )}

        {currentTab === 'daily' && (
          !user ? (
            <SignInGate
              title="Daily Challenge Locked"
              subtitle="Please sign in to solve today's high-stakes arithmetic puzzle, earn +10,000 XP, and maintain your streak."
              onGoBack={() => setCurrentTab('home')}
            />
          ) : (
            <DailyChallengeView
              stats={stats}
              onUpdateStats={updateStats}
              onGoHome={() => setCurrentTab('home')}
              onOpenBattle={handleOpenBattle}
            />
          )
        )}

        {currentTab === 'game' && (
          !user ? (
            <SignInGate
              title="Gameplay Locked"
              subtitle="Sign in to play MathRush, choose any speed or focus mode, and record your high scores."
              onGoBack={() => setCurrentTab('home')}
            />
          ) : (
            <GameView
              mode={activeGameMode}
              initialCategory={selectedCategory}
              stats={stats}
              onUpdateStats={updateStats}
              onFinishGame={handleFinishGame}
              onExitGame={() => setCurrentTab('home')}
              onOpenPro={() => setShowProModal(true)}
            />
          )
        )}

        {currentTab === 'battle' && (
          !user ? (
            <SignInGate
              title="Math Battle Arena Locked"
              subtitle="Sign in with your player account to matchmake and duel live competitors in real-time math duels."
              onGoBack={() => setCurrentTab('home')}
            />
          ) : (
            <MathBattleView
              stats={stats}
              onUpdateStats={updateStats}
              onBack={() => setCurrentTab('home')}
            />
          )
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

