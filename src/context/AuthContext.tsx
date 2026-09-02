import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
  FirebaseUser,
  CloudUserProfile,
  saveUserStatsToCloud,
  loadUserStatsFromCloud,
  resetUserToFreshStatsCloud,
  getFreshGameStats,
} from '../firebase';
import { UserStats } from '../types';
import { loadUserStats, saveUserStats, syncStatsWithXp, checkLivesRegeneration } from '../utils/storage';
import { sound } from '../utils/audio';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: CloudUserProfile | null;
  stats: UserStats;
  loading: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  isCloudSynced: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup' | 'reset' | 'fresh';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'reset' | 'fresh') => void;
  updateStats: (newStats: UserStats, immediateCloudSave?: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  startFreshJourney: (customName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<CloudUserProfile | null>(null);
  const [stats, setStatsState] = useState<UserStats>(() => loadUserStats());
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reset' | 'fresh'>('signin');

  const statsRef = useRef<UserStats>(stats);
  statsRef.current = stats;

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync stats to Firestore with debounce
  const triggerCloudSave = useCallback(
    async (targetStats: UserStats, currentUserId?: string | null) => {
      const targetUid = currentUserId || user?.uid;
      if (!targetUid) return;

      setIsSaving(true);
      const success = await saveUserStatsToCloud(targetUid, targetStats, {
        email: user?.email || null,
        displayName: user?.displayName || targetStats.name,
        photoURL: user?.photoURL || null,
      });

      setIsSaving(false);
      if (success) {
        setIsCloudSynced(true);
        setLastSavedAt(Date.now());
      }
    },
    [user]
  );

  // General updateStats handler used throughout the app
  const updateStats = useCallback(
    (newStats: UserStats, immediateCloudSave: boolean = false) => {
      const normalized = syncStatsWithXp(checkLivesRegeneration(newStats));
      setStatsState(normalized);
      saveUserStats(normalized);

      if (user?.uid) {
        if (immediateCloudSave) {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          triggerCloudSave(normalized, user.uid);
        } else {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => {
            triggerCloudSave(normalized, user.uid);
          }, 1500);
        }
      }
    },
    [user, triggerCloudSave]
  );

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setLoading(true);
        // Load user data from Firestore
        const cloudData = await loadUserStatsFromCloud(firebaseUser.uid);

        if (cloudData && cloudData.stats) {
          // Existing user with saved stats in cloud
          const merged = syncStatsWithXp(checkLivesRegeneration(cloudData.stats));
          setStatsState(merged);
          saveUserStats(merged);
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || merged.name,
            photoURL: firebaseUser.photoURL,
            providerId: firebaseUser.providerData[0]?.providerId || 'password',
            stats: merged,
          });
          setIsCloudSynced(true);
          setLastSavedAt(Date.now());
        } else {
          // Brand new user or fresh start: initialize fresh starter stats and persist to cloud
          const fresh = getFreshGameStats(
            firebaseUser.displayName || statsRef.current.name,
            statsRef.current.avatar
          );
          setStatsState(fresh);
          saveUserStats(fresh);
          await saveUserStatsToCloud(firebaseUser.uid, fresh, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || fresh.name,
            photoURL: firebaseUser.photoURL,
            providerId: firebaseUser.providerData[0]?.providerId || 'password',
          });
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || fresh.name,
            photoURL: firebaseUser.photoURL,
            providerId: firebaseUser.providerData[0]?.providerId || 'password',
            stats: fresh,
          });
          setIsCloudSynced(true);
          setLastSavedAt(Date.now());
        }
        setLoading(false);
      } else {
        setProfile(null);
        setIsCloudSynced(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const loginWithGoogle = async () => {
    try {
      sound.playClick();
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        sound.playBattleWin();
        setAuthModalOpen(false);
      }
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  // Facebook Sign In
  const loginWithFacebook = async () => {
    try {
      sound.playClick();
      const result = await signInWithPopup(auth, facebookProvider);
      if (result.user) {
        sound.playBattleWin();
        setAuthModalOpen(false);
      }
    } catch (err: unknown) {
      console.error('Facebook Sign In Error:', err);
      throw err;
    }
  };

  // Email Sign In
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      sound.playClick();
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        sound.playBattleWin();
        setAuthModalOpen(false);
      }
    } catch (err: unknown) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  // Email Sign Up
  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    try {
      sound.playClick();
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        if (displayName) {
          await updateProfile(result.user, { displayName });
        }
        sound.playBattleWin();
        setAuthModalOpen(false);
      }
    } catch (err: unknown) {
      console.error('Email Registration Error:', err);
      throw err;
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    try {
      sound.playClick();
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      console.error('Password Reset Error:', err);
      throw err;
    }
  };

  // Guest Sign In
  const loginAsGuest = async () => {
    try {
      sound.playClick();
      const result = await signInAnonymously(auth);
      if (result.user) {
        sound.playOptionSelect();
        setAuthModalOpen(false);
      }
    } catch (err: unknown) {
      console.error('Guest Sign In Error:', err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      sound.playClick();
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setIsCloudSynced(false);
      // Keep or reset local stats
      const fresh = getFreshGameStats();
      setStatsState(fresh);
      saveUserStats(fresh);
    } catch (err: unknown) {
      console.error('Sign Out Error:', err);
      throw err;
    }
  };

  // Start fresh process: reset all stats to starter values (0 XP, Level 1, clean history) and save to cloud
  const startFreshJourney = async (customName?: string) => {
    sound.playBattleWin();
    const fresh = getFreshGameStats(customName || user?.displayName || stats.name, stats.avatar);
    setStatsState(fresh);
    saveUserStats(fresh);

    if (user?.uid) {
      await resetUserToFreshStatsCloud(user.uid, fresh.name, fresh.avatar);
      setIsCloudSynced(true);
      setLastSavedAt(Date.now());
    }

    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        stats,
        loading,
        isSaving,
        lastSavedAt,
        isCloudSynced,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        updateStats,
        loginWithGoogle,
        loginWithFacebook,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        loginAsGuest,
        logout,
        startFreshJourney,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
