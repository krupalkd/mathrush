import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    loginAsGuest,
    startFreshJourney,
    promptReason,
    user,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    sound.playClick();
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) {
        handleClose();
      }
    };
    if (authModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const parseAuthError = (err: unknown): string => {
    if (!err || typeof err !== 'object') return 'An unexpected error occurred. Please try again.';
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr.code || '';

    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Only one popup request is allowed at a time.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email using a different sign-in method.';
      default:
        return anyErr.message || 'Authentication failed. Please try again.';
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await loginWithGoogle();
      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await loginWithFacebook();
      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (authModalMode === 'reset') {
      try {
        setIsLoading(true);
        await resetPassword(email.trim());
        setSuccessMessage('Password reset link sent! Check your email inbox.');
      } catch (err) {
        setErrorMessage(parseAuthError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      if (authModalMode === 'signup') {
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email.trim(), password, displayName.trim() || 'Math Ninja');
      } else {
        await loginWithEmail(email.trim(), password);
      }
      confetti({ particleCount: 60, spread: 80 });
    } catch (err) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFreshAction = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await startFreshJourney(displayName.trim() || undefined);
      confetti({ particleCount: 70, spread: 90 });
    } catch (err) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await loginAsGuest();
    } catch (err) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="auth-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm sm:max-w-md overflow-hidden shadow-2xl relative text-white animate-scale-up my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />

        {/* Modal Close Button - High Priority Z-Index */}
        <button
          id="btn-close-auth-modal"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-8 h-8 sm:w-9 sm:h-9 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 rounded-full flex items-center justify-center transition-all z-30 cursor-pointer border border-slate-700/80 shadow-md active:scale-90"
          aria-label="Close modal"
          title="Close (Esc)"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="p-4 sm:p-5 relative z-10 space-y-3.5 overflow-y-auto">
          {/* Header Title & Branding */}
          <div className="text-center space-y-1 pt-0.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center mx-auto shadow-md shadow-indigo-500/25">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
              {authModalMode === 'signup'
                ? 'Create MathRush Account'
                : authModalMode === 'reset'
                ? 'Reset Password'
                : authModalMode === 'fresh'
                ? 'Start Fresh Process'
                : 'Sign In to MathRush'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs mx-auto leading-tight">
              {authModalMode === 'fresh'
                ? 'Begin a fresh journey at Level 1 with full cloud persistence.'
                : 'Sync your game progress, battle rank, streaks, and XP across all devices.'}
            </p>
          </div>

          {/* Gameplay Requirement Notice */}
          {promptReason && authModalMode !== 'fresh' && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-200 animate-fade-in">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px]">{promptReason}</span>
            </div>
          )}

          {/* Mode Switch Tabs */}
          {authModalMode !== 'fresh' && (
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                id="tab-mode-signin"
                onClick={() => {
                  sound.playOptionSelect();
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setAuthModalMode('signin');
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-mode-signup"
                onClick={() => {
                  sound.playOptionSelect();
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setAuthModalMode('signup');
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-600/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-[11px]">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px]">{successMessage}</span>
            </div>
          )}

          {/* Mode: Start Fresh Process */}
          {authModalMode === 'fresh' ? (
            <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Start Fresh Process</h4>
                  <p className="text-[10px] text-slate-400">
                    Reset player progress to Level 1, 0 XP, 3 lives, and save cleanly to cloud.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">
                  Choose Player Nickname
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={user?.displayName || 'e.g. MathNinja_101'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAuthModalMode('signin')}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-start-fresh"
                  onClick={handleStartFreshAction}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Start Fresh'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Social Auth Providers (Google & Facebook) */}
              <div className="grid grid-cols-1 gap-2">
                {/* Google Sign In Button */}
                <button
                  id="btn-auth-google"
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-60"
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

                {/* Facebook Sign In Button */}
                <button
                  id="btn-auth-facebook"
                  type="button"
                  onClick={handleFacebookAuth}
                  disabled={isLoading}
                  className="w-full py-2 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continue with Facebook</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-0.5">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  or with email
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmitEmail} className="space-y-2.5">
                {authModalMode === 'signup' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="input-signup-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Player Nickname"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="input-auth-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ninja@mathrush.io"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {authModalMode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-300">Password</label>
                      {authModalMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            setAuthModalMode('reset');
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="input-auth-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-auth-submit-email"
                  disabled={isLoading}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 mt-1"
                >
                  {isLoading ? (
                    <span>Please wait...</span>
                  ) : authModalMode === 'signup' ? (
                    <>
                      <span>Sign Up with Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : authModalMode === 'reset' ? (
                    <span>Send Reset Email</span>
                  ) : (
                    <>
                      <span>Sign In with Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest & Start Fresh Utilities */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  id="btn-guest-mode"
                  onClick={handleGuestMode}
                  disabled={isLoading}
                  className="hover:text-slate-200 transition-colors font-medium flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <span>Play as Guest</span>
                </button>

                <button
                  type="button"
                  id="btn-open-start-fresh"
                  onClick={() => {
                    sound.playOptionSelect();
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setAuthModalMode('fresh');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start Fresh</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
