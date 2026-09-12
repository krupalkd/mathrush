import React, { useState } from 'react';
import { Download, Share, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // If already installed in standalone display mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const accepted = await install();
    if (accepted) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 3500);
    }
  };

  // Chromium, Desktop, Android native install flow
  if (isInstallable) {
    return (
      <>
        <button
          id="btn-pwa-install"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 rounded-xl font-extrabold text-xs transition-transform active:scale-95 cursor-pointer shadow-md ${
            compact
              ? 'px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              : 'px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-500/20'
          }`}
          title="Install MathRush app to your device for offline play"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Install App</span>
        </button>

        {installedNotice && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-2 rounded-xl shadow-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>MathRush installed successfully!</span>
          </div>
        )}
      </>
    );
  }

  // iOS Safari instruction guide flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl font-extrabold text-xs transition-transform active:scale-95 cursor-pointer border ${
            compact
              ? 'px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Install on iPhone / iPad"
        >
          <Share className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <Share className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Install MathRush on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl space-y-2 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Launch MathRush directly from your home screen for full offline play!</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
