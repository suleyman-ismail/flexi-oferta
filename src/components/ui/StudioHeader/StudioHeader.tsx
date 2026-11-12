'use client';

import React from 'react';
import {
  Crown,
  FileDown,
  FilePlus2,
  FolderClock,
  LogOut,
  Moon,
  Save,
  Settings2,
  Sun,
  UserCheck,
} from 'lucide-react';
import { UI_TEXT } from '@/lib/constants';
import { AppLang, UserProfile } from '@/types/offer';

interface StudioHeaderProps {
  lang: AppLang;
  offerNo: string;
  savedCount: number;
  totalTeamOffersCount?: number;
  currentUser?: UserProfile | null;
  isGeneratingPdf: boolean;
  darkMode: boolean;
  onSetLang: (lang: AppLang) => void;
  onToggleDarkMode: () => void;
  onNewOffer: () => void;
  onSaveOffer: () => void;
  onDownloadPdf: () => void;
  onOpenSavedDrawer: () => void;
  onOpenPricingModal: () => void;
  onOpenAdminModal?: () => void;
  onLogout?: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  lang,
  offerNo,
  savedCount,
  totalTeamOffersCount,
  currentUser,
  isGeneratingPdf,
  darkMode,
  onSetLang,
  onToggleDarkMode,
  onNewOffer,
  onSaveOffer,
  onDownloadPdf,
  onOpenSavedDrawer,
  onOpenPricingModal,
  onOpenAdminModal,
  onLogout,
}) => {
  const T = UI_TEXT[lang];
  const isAdmin = !currentUser || currentUser.role === 'admin';

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
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                FLEXI HOME{' '}
                <span className="text-indigo-600 dark:text-indigo-400">
                  ОФЕРТА
                </span>
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                № {offerNo}
              </span>
              {currentUser && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>{currentUser.name}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {T.appSub}
            </p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switcher: strictly Bulgarian (BG) or English (EN) */}
          <div
            className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-0.5"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => onSetLang('bg')}
              aria-label="Превключи на Български език"
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                lang === 'bg'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              🇧🇬 Български
            </button>
            <button
              type="button"
              onClick={() => onSetLang('en')}
              aria-label="Switch to English language"
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Admin Panel Button (Visible only to Admin) */}
          {isAdmin && onOpenAdminModal && (
            <button
              type="button"
              onClick={onOpenAdminModal}
              aria-label={
                lang === 'bg' ? 'Отвори Админ Панел' : 'Open Admin Panel'
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 shadow-xs transition cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-900" />
              <span>
                {lang === 'bg' ? 'Админ Панел' : 'Admin Panel'}
                {typeof totalTeamOffersCount === 'number'
                  ? ` (${totalTeamOffersCount})`
                  : ''}
              </span>
            </button>
          )}

          {/* Global Tariff Table Settings (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenPricingModal}
              aria-label={T.btnPricing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
            >
              <Settings2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">{T.btnPricing}</span>
            </button>
          )}

          {/* My Saved Offers */}
          <button
            type="button"
            onClick={onOpenSavedDrawer}
            aria-label={T.btnHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
          >
            <FolderClock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              {currentUser?.role === 'agent'
                ? lang === 'bg'
                  ? 'Моите оферти'
                  : 'My Quotes'
                : T.btnHistory}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-indigo-600 text-white font-bold">
              {savedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onNewOffer}
            aria-label={T.btnNewOffer}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 transition"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>{T.btnNewOffer}</span>
          </button>

          <button
            type="button"
            onClick={onSaveOffer}
            aria-label={T.btnSaveOffer}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 transition"
          >
            <Save className="w-4 h-4" />
            <span>{T.btnSaveOffer}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            aria-label={T.btnDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-600/20 transition"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingPdf ? T.btnGeneratingPdf : T.btnDownloadPdf}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={
              darkMode
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label={
                lang === 'bg' ? 'Изход от профила (PIN)' : 'Logout (Lock PIN)'
              }
              title={
                lang === 'bg' ? 'Смяна на профил / Заключване' : 'Switch profile / Lock'
              }
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">
                {lang === 'bg' ? 'Изход' : 'Exit'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
