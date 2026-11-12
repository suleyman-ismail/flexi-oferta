'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { AppLang } from '@/types/offer';

const STORAGE_KEY = 'flexi_oferta_pwa_dismissed_v1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaInstallBannerProps {
  lang: AppLang;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(window.navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Register Service Worker for offline mode
    if ('serviceWorker' in navigator) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      navigator.serviceWorker
        .register(`${basePath}/sw.js`)
        .catch(() => {
          // ignore SW registration failure in dev/test
        });
    }

    const standalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    setIsStandalone(Boolean(standalone));

    try {
      const wasDismissed = localStorage.getItem(STORAGE_KEY);
      if (wasDismissed) {
        const dismissTime = parseInt(wasDismissed, 10);
        if (Date.now() - dismissTime < 7 * 24 * 60 * 60 * 1000) {
          return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
          };
        }
      }
    } catch {
      // ignore storage errors
    }

    if (!standalone) {
      setDismissed(false);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const ua = window.navigator.userAgent || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-label={lang === 'bg' ? 'Офлайн режим' : 'Offline Mode'}
        className="bg-amber-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2"
      >
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>
          {lang === 'bg'
            ? 'Работите в ОФЛАЙН режим — Всички калкулации, запазени оферти и PDF генериране работят без интернет.'
            : 'Working in OFFLINE mode — All calculations, saved quotes and 4-page PDF export work without internet.'}
        </span>
      </div>
    );
  }

  if (isStandalone || dismissed) return null;

  return (
    <div
      role="region"
      aria-label={
        lang === 'bg'
          ? 'Инсталиране на приложението Flexi Оферта'
          : 'Install Flexi Offer App'
      }
      className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 text-white px-4 py-2 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold leading-tight truncate">
            {lang === 'bg'
              ? 'Инсталирай Flexi Home ОФЕРТА като приложение (Телефон / Компютър)'
              : 'Install Flexi Home ОФЕРТА as a Standalone App (Phone / Desktop)'}
          </p>
          <p className="text-[11px] text-indigo-100 truncate">
            {isIOS
              ? lang === 'bg'
                ? 'В Safari натиснете Сподели (Share ⎋) → „Към началния екран“ (Add to Home Screen)'
                : 'In Safari tap Share ⎋ → "Add to Home Screen" for 1-tap offline access'
              : lang === 'bg'
              ? 'Бърз достъп от икона на екрана и пълна работа офлайн на обекта (като Flexi CRM)'
              : 'Launch from your home screen or dock with full offline PDF generation'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-[10px] font-semibold text-emerald-100">
          <Wifi className="w-3 h-3" />
          {lang === 'bg' ? 'PWA Офлайн готов' : 'PWA Offline Ready'}
        </span>

        {!isIOS && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            aria-label={
              lang === 'bg' ? 'Инсталирай приложението' : 'Install App'
            }
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-indigo-900 font-extrabold text-xs hover:bg-indigo-50 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bg' ? 'Инсталирай' : 'Install App'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label={
            lang === 'bg' ? 'Затвори банера за инсталация' : 'Dismiss install banner'
          }
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
