import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with autoUpdate and caching
const updateSW = registerSW({
  onNeedRefresh() {
    // When a new SW version is activated
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[MathRush SW] App ready for offline play with cached stats & game modes');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
