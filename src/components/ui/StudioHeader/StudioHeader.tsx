'use client';

import React from 'react';
import {
  FileDown,
  FilePlus2,
  FolderClock,
  Moon,
  Save,
  Settings2,
  Sun,
} from 'lucide-react';
import { UI_TEXT } from '@/lib/constants';
import { AppLang } from '@/types/offer';

interface StudioHeaderProps {
  lang: AppLang;
  offerNo: string;
  savedCount: number;
  isGeneratingPdf: boolean;
  darkMode: boolean;
  onSetLang: (lang: AppLang) => void;
  onToggleDarkMode: () => void;
  onNewOffer: () => void;
  onSaveOffer: () => void;
  onDownloadPdf: () => void;
  onOpenSavedDrawer: () => void;
  onOpenPricingModal: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  lang,
  offerNo,
  savedCount,
  isGeneratingPdf,
  darkMode,
  onSetLang,
  onToggleDarkMode,
  onNewOffer,
  onSaveOffer,
  onDownloadPdf,
  onOpenSavedDrawer,
  onOpenPricingModal,
}) => {
  const T = UI_TEXT[lang];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/flexi-home-logo.jpg`}
            alt="Flexi Home Logo"
            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                FLEXI HOME
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                {lang === 'en' ? `OFFER № ${offerNo}` : `ОФЕРТА № ${offerNo}`}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {T.appSub}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switcher: Strictly BG or EN */}
          <div
            role="group"
            aria-label="Language Switcher"
            className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-0.5"
          >
            <button
              type="button"
              aria-label="Превключи на Български език"
              onClick={() => onSetLang('bg')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                lang === 'bg'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              <span>🇧🇬</span>
              <span>Български</span>
            </button>
            <button
              type="button"
              aria-label="Switch to English language"
              onClick={() => onSetLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>

          <button
            type="button"
            aria-label={T.btnPricing}
            onClick={onOpenPricingModal}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">{T.btnPricing}</span>
          </button>

          <button
            type="button"
            aria-label={T.btnHistory}
            onClick={onOpenSavedDrawer}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <FolderClock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{T.btnHistory}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-[11px] font-bold">
              {savedCount}
            </span>
          </button>

          <button
            type="button"
            aria-label={T.btnNewOffer}
            onClick={onNewOffer}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>{T.btnNewOffer}</span>
          </button>

          <button
            type="button"
            aria-label={T.btnSaveOffer}
            onClick={onSaveOffer}
            className="px-3.5 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/70 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{T.btnSaveOffer}</span>
          </button>

          <button
            type="button"
            aria-label={T.btnDownloadPdf}
            disabled={isGeneratingPdf}
            onClick={onDownloadPdf}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>
              {isGeneratingPdf ? T.btnGeneratingPdf : T.btnDownloadPdf}
            </span>
          </button>

          <button
            type="button"
            aria-label={darkMode ? 'Light Mode' : 'Dark Mode'}
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
