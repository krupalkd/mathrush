import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import { Zap, LogIn, Lock, X } from 'lucide-react';

interface SignInGateProps {
  title?: string;
  subtitle?: string;
  onGoBack?: () => void;
}

export const SignInGate: React.FC<SignInGateProps> = ({
  title = 'Sign In to Start Playing',
  subtitle = 'Create or sign in to your MathRush account to unlock all game modes, track your XP, earn streaks, and save your progress in the cloud.',
  onGoBack,
}) => {
  const { loginWithGoogle, loginWithFacebook, setAuthModalOpen, setAuthModalMode } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onGoBack) {
        onGoBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGoBack]);

  return (
    <div className="py-4 sm:py-6 px-3 sm:px-4 max-w-md mx-auto animate-scale-up">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />

        {/* Top-Right Close X Button */}
        {onGoBack && (
          <button
            id="btn-close-sign-in-gate"
            type="button"
            onClick={() => {
              sound.playClick();
              onGoBack();
            }}
            className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-8 h-8 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer border border-slate-700/80 shadow-md active:scale-90"
            title="Close & Return to Dashboard"
            aria-label="Close and return home"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25 relative z-10">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-amber-300" />
            <span>Sign In First For Gameplay</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">{title}</h2>
          <p className="text-[11px] sm:text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-2 gap-2 text-left text-[11px] bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">Cloud XP & Save</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="truncate">1v1 Battle Arena</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
            <span className="truncate">Daily Rewards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span className="truncate">Streaks & Shields</span>
          </div>
        </div>

        {/* Sign In Options */}
        <div className="space-y-2 relative z-10">
          {/* Google */}
          <button
            id="btn-gate-google"
            type="button"
            onClick={async () => {
              try {
                await loginWithGoogle();
              } catch (e) {
                console.warn('Sign In Gate Google auth:', e);
              }
            }}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-98 text-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* Facebook */}
          <button
            id="btn-gate-facebook"
            type="button"
            onClick={async () => {
              try {
                await loginWithFacebook();
              } catch (e) {
                console.warn('Sign In Gate Facebook auth:', e);
              }
            }}
            className="w-full py-2.5 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-98 text-xs"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>

          {/* Email / Password Modal Trigger */}
          <button
            id="btn-gate-email"
            type="button"
            onClick={() => {
              sound.playClick();
              setAuthModalMode('signin');
              setAuthModalOpen(true);
            }}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700 text-xs"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sign In with Email & Password</span>
          </button>
        </div>

        {onGoBack && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onGoBack();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer block mx-auto underline pt-1"
          >
            ← Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};
