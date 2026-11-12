'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Delete, ShieldCheck, Lock } from 'lucide-react';
import { AppLang, UserProfile } from '@/types/offer';

export interface PinLoginScreenProps {
  lang: AppLang;
  onSetLang: (lang: AppLang) => void;
  onLoginWithPin: (pin: string) => {
    ok: boolean;
    user?: UserProfile;
    errorBg?: string;
    errorEn?: string;
  };
}

export const PinLoginScreen: React.FC<PinLoginScreenProps> = ({
  lang,
  onSetLang,
  onLoginWithPin,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const pinRef = useRef('');

  const submitPin = useCallback(
    (code: string) => {
      const res = onLoginWithPin(code);
      if (!res.ok) {
        pinRef.current = '';
        setPin('');
        setErrorMsg(
          lang === 'en'
            ? res.errorEn || 'Invalid PIN code'
            : res.errorBg || 'Невалиден PIN код'
        );
      } else {
        setErrorMsg('');
      }
    },
    [lang, onLoginWithPin]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (pinRef.current.length >= 6) return;
      const next = pinRef.current + digit;
      pinRef.current = next;
      setPin(next);
      setErrorMsg('');
      if (next.length === 6) {
        submitPin(next);
      }
    },
    [submitPin]
  );

  const handleBackspace = useCallback(() => {
    pinRef.current = pinRef.current.slice(0, -1);
    setPin(pinRef.current);
    setErrorMsg('');
  }, []);

  const handleClear = useCallback(() => {
    pinRef.current = '';
    setPin('');
    setErrorMsg('');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDigit, handleBackspace, handleClear]);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div
      aria-label={
        lang === 'bg' ? 'Вход с 6-цифрен PIN код' : '6-Digit PIN Login'
      }
      className="min-h-dvh flex flex-col items-center justify-between bg-gradient-to-br from-zinc-950 via-indigo-950 to-slate-950 text-white p-6 select-none"
    >
      {/* Top Bar: Language Toggle */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-indigo-200">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>flexi-home.eu · „С 1 ТРЕЙД“ ЕООД</span>
        </div>

        <div
          className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5"
          role="group"
          aria-label="Language switcher"
        >
          <button
            type="button"
            onClick={() => onSetLang('bg')}
            aria-label="Превключи на Български език"
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              lang === 'bg'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            🇧🇬 Български
          </button>
          <button
            type="button"
            onClick={() => onSetLang('en')}
            aria-label="Switch to English language"
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              lang === 'en'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Center PIN Card */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto py-6">
        <div className="w-20 h-20 rounded-3xl bg-white p-1.5 shadow-2xl mb-4 border-2 border-indigo-400/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/flexi-home-logo.jpg`}
            alt="Flexi Home Logo"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-center">
          Flexi Home ОФЕРТА
        </h1>
        <p className="text-xs text-indigo-200 mt-1 mb-6 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          {lang === 'bg'
            ? 'Въведете своя личен 6-цифрен PIN код'
            : 'Enter your personal 6-digit PIN code'}
        </p>

        {/* 6 PIN Dots */}
        <div
          className="flex gap-3.5 mb-6"
          aria-label={
            lang === 'bg'
              ? `Въведени цифри: ${pin.length} от 6`
              : `Entered digits: ${pin.length} of 6`
          }
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > i
                  ? 'bg-indigo-400 border-indigo-300 scale-110 shadow-[0_0_12px_rgba(129,140,248,0.8)]'
                  : 'bg-transparent border-white/40'
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3.5 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              aria-label={`Digit ${d}`}
              className="h-16 rounded-2xl bg-white/10 hover:bg-indigo-600/50 active:bg-indigo-500 border border-white/10 text-2xl font-bold tabular-nums transition shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            aria-label={lang === 'bg' ? 'Изчисти PIN' : 'Clear PIN'}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 transition cursor-pointer"
          >
            {lang === 'bg' ? 'Изчисти' : 'Clear'}
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            aria-label="Digit 0"
            className="h-16 rounded-2xl bg-white/10 hover:bg-indigo-600/50 active:bg-indigo-500 border border-white/10 text-2xl font-bold tabular-nums transition shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label={lang === 'bg' ? 'Изтрий цифра' : 'Delete digit'}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition cursor-pointer"
          >
            <Delete className="w-6 h-6 text-zinc-200" />
          </button>
        </div>

        {/* Error Feedback */}
        <div
          role="alert"
          className="min-h-6 mt-5 text-xs font-bold text-rose-300 text-center"
        >
          {errorMsg}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-zinc-400 max-w-xs leading-relaxed">
        {lang === 'bg'
          ? 'Всеки търговски агент вижда само своите оферти. Администраторът управлява всички оферти и PIN кодове.'
          : 'Each sales agent views only their own quotes. The Administrator manages all team quotes and PIN codes.'}
      </div>
    </div>
  );
};
