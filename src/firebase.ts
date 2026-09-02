import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserStats } from './types';
import { getInitialUserStats, syncStatsWithXp } from './utils/storage';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom database ID from config if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('public_profile');
facebookProvider.addScope('email');

export interface CloudUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  createdAt?: number;
  lastLoginAt?: number;
  stats?: UserStats;
}

/**
 * Returns fresh starter game stats for a new player or when starting the process fresh.
 */
export function getFreshGameStats(customName?: string, customAvatar?: string): UserStats {
  const initial = getInitialUserStats();
  return {
    ...initial,
    xp: 0,
    level: 1,
    title: '🥉 Beginner',
    streak: 0,
    maxStreak: 0,
    lives: 3,
    maxLives: 3,
    lastLifeRefillTimestamp: Date.now(),
    lastPlayedDate: new Date().toISOString().split('T')[0],
    dailyCompletedDates: [],
    puzzlesSolved: 0,
    accuracyRate: 100,
    avgTimeSeconds: 0,
    battleElo: 1000,
    battleWins: 0,
    battleLosses: 0,
    bestQuickScore: 0,
    bestStreakScore: 0,
    achievements: [],
    name: customName || `Ninja_${Math.floor(Math.random() * 9000 + 1000)}`,
    avatar: customAvatar || '🦊',
  };
}

/**
 * Save player game stats to Cloud Firestore
 */
export async function saveUserStatsToCloud(
  uid: string,
  stats: UserStats,
  extraProfile?: Partial<CloudUserProfile>
): Promise<boolean> {
  if (!uid) return false;
  try {
    const userDocRef = doc(db, 'users', uid);
    const payload: Record<string, unknown> = {
      uid,
      stats,
      updatedAt: Date.now(),
      lastActive: serverTimestamp(),
    };

    if (extraProfile) {
      if (extraProfile.email !== undefined) payload.email = extraProfile.email;
      if (extraProfile.displayName !== undefined) payload.displayName = extraProfile.displayName;
      if (extraProfile.photoURL !== undefined) payload.photoURL = extraProfile.photoURL;
      if (extraProfile.providerId !== undefined) payload.providerId = extraProfile.providerId;
    }

    await setDoc(userDocRef, payload, { merge: true });

    // Also update public leaderboard entry in the background
    try {
      const leaderDocRef = doc(db, 'leaderboard', uid);
      await setDoc(
        leaderDocRef,
        {
          uid,
          name: stats.name || 'Anonymous Player',
          avatar: stats.avatar || '🦊',
          xp: stats.xp || 0,
          level: stats.level || 1,
          title: stats.title || 'Beginner',
          battleElo: stats.battleElo || 1000,
          wins: stats.battleWins || 0,
          losses: stats.battleLosses || 0,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch {
      // Non-blocking
    }

    return true;
  } catch (err) {
    console.warn('Failed to save user stats to Firestore:', err);
    return false;
  }
}

/**
 * Load player game stats from Cloud Firestore
 */
export async function loadUserStatsFromCloud(uid: string): Promise<{ stats: UserStats; profile?: CloudUserProfile } | null> {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.stats) {
        const parsedStats = syncStatsWithXp(data.stats as UserStats);
        return {
          stats: parsedStats,
          profile: {
            uid,
            email: data.email || null,
            displayName: data.displayName || null,
            photoURL: data.photoURL || null,
            providerId: data.providerId || 'email',
          },
        };
      }
    }
    return null;
  } catch (err) {
    console.warn('Failed to load user stats from Firestore:', err);
    return null;
  }
}

/**
 * Start fresh: reset user game stats to brand-new starter data and save to Firestore
 */
export async function resetUserToFreshStatsCloud(
  uid: string,
  customName?: string,
  customAvatar?: string
): Promise<UserStats> {
  const fresh = getFreshGameStats(customName, customAvatar);
  if (uid) {
    await saveUserStatsToCloud(uid, fresh);
  }
  return fresh;
}

// Export Auth functions
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
  type FirebaseUser,
};
