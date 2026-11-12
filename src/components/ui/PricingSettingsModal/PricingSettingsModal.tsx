'use client';

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import { AppLang, PricingConfig, TieredRates } from '@/types/offer';

export interface PricingSettingsModalProps {
  lang: AppLang;
  isOpen: boolean;
  pricing: PricingConfig;
  onClose: () => void;
  onSavePricing: (next: PricingConfig) => void;
  onResetDefaults: () => void;
}

export function PricingSettingsModal({
  lang,
  isOpen,
  pricing,
  onClose,
  onSavePricing,
  onResetDefaults,
}: PricingSettingsModalProps) {
  const [draft, setDraft] = useState<PricingConfig>(pricing);

  useEffect(() => {
    setDraft(pricing);
  }, [pricing, isOpen]);

  if (!isOpen) return null;

  const updateFloor1Tier = (
    systemKey: 'press_standard' | 'steel_frame' | 'reinforced_metal',
    field: keyof TieredRates,
    value: number
  ) => {
    setDraft((prev) => ({
      ...prev,
      [systemKey]: {
        ...prev[systemKey],
        floor1: {
          ...prev[systemKey].floor1,
          [field]: value,
        },
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePricing(draft);
    onClose();
  };

  const modalTitle =
    lang === 'bg'
      ? 'Настройки на единични цени (flexi-home.eu)'
      : 'Unit Price Settings (flexi-home.eu)';
  const modalSub =
    lang === 'bg'
      ? 'Тарифи с включен 20% ДДС за груб строеж „до тапа“, фундамент и пакети „До ключ“'
      : 'Default unit rates (incl. 20% VAT) for shell structure, foundation & turnkey packages';
  const closeLabel = lang === 'bg' ? 'Затвори' : 'Close';
  const resetLabel =
    lang === 'bg'
      ? 'Възстанови стандартните тарифи'
      : 'Restore Default Website Rates';
  const cancelLabel = lang === 'bg' ? 'Отказ' : 'Cancel';
  const saveLabel = lang === 'bg' ? 'Запази тарифите' : 'Save Pricing Table';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold">{modalTitle}</h2>
              <p className="text-xs text-indigo-100">{modalSub}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="p-1.5 rounded-lg hover:bg-indigo-500 transition focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-900 dark:text-zinc-100"
        >
          {/* 1. Press Panel Standard */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 space-y-3">
            <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-400">
              1. Прес панел стандарт / Standard Press Panel (16/10 cm EPS) — €/m²
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(
                [
                  ['upTo50', '≤ 50 m²'],
                  ['from51To70', '51–70 m²'],
                  ['from71To90', '71–90 m²'],
                  ['from91To120', '91–120 m²'],
                  ['over120', '> 120 m²'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    {lang === 'bg' ? `1 Етаж (${label})` : `1 Storey (${label})`}
                  </label>
                  <input
                    type="number"
                    aria-label={`Press Panel Standard ${label}`}
                    value={draft.press_standard.floor1[key]}
                    onChange={(e) =>
                      updateFloor1Tier(
                        'press_standard',
                        key,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === 'bg'
                    ? '2 Етажа Стандартна тарифа (€/m²)'
                    : '2 Storeys Standard Rate (€/m²)'}
                </label>
                <input
                  type="number"
                  aria-label="Press Panel 2 Storeys Standard"
                  value={draft.press_standard.floor2Default}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      press_standard: {
                        ...prev.press_standard,
                        floor2Default: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === 'bg'
                    ? '2 Етажа Алтернативна тарифа (515 €/m²)'
                    : '2 Storeys Alternative Rate (515 €/m²)'}
                </label>
                <input
                  type="number"
                  aria-label="Press Panel 2 Storeys Alternative"
                  value={draft.press_standard.floor2Alt}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      press_standard: {
                        ...prev.press_standard,
                        floor2Alt: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* 2. Economic + Foundation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
              <label className="block font-bold text-sm text-indigo-700 dark:text-indigo-400 mb-2">
                2. Прес панел икономичен / Economic (€/m²)
              </label>
              <input
                type="number"
                aria-label="Press Panel Economic Unit Price"
                value={draft.press_economy.flatRate}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    press_economy: { flatRate: Number(e.target.value) },
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
              />
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
              <label className="block font-bold text-sm text-amber-800 dark:text-amber-300 mb-2">
                {lang === 'bg'
                  ? 'Фундамент / Стоманобетонна основа (€/m²)'
                  : 'Foundation / Concrete Slab Default Rate (€/m²)'}
              </label>
              <input
                type="number"
                aria-label="Foundation Default Unit Price"
                value={draft.foundationRate}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    foundationRate: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 font-bold"
              />
            </div>
          </div>

          {/* 3. Steel Frame */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 space-y-3">
            <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-400">
              3. Каркас (стоманена) / Steel Frame (14/8 cm Каменна вата) — €/m²
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {(
                [
                  ['upTo50', '≤ 50 m²'],
                  ['from51To70', '51–70 m²'],
                  ['from71To90', '71–90 m²'],
                  ['from91To120', '91–120 m²'],
                  ['over120', '> 120 m²'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    aria-label={`Steel Frame ${label}`}
                    value={draft.steel_frame.floor1[key]}
                    onChange={(e) =>
                      updateFloor1Tier(
                        'steel_frame',
                        key,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
              ))}
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  2 Етажа / 2 Fl.
                </label>
                <input
                  type="number"
                  aria-label="Steel Frame 2 Storeys"
                  value={draft.steel_frame.floor2}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      steel_frame: {
                        ...prev.steel_frame,
                        floor2: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* 4. Reinforced Metal */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 space-y-3">
            <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-400">
              4. Усилена метална / Reinforced Galvanized Steel — €/m²
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {(
                [
                  ['upTo50', '≤ 50 m²'],
                  ['from51To70', '51–70 m²'],
                  ['from71To90', '71–90 m²'],
                  ['from91To120', '91–120 m²'],
                  ['over120', '> 120 m²'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    aria-label={`Reinforced Metal ${label}`}
                    value={draft.reinforced_metal.floor1[key]}
                    onChange={(e) =>
                      updateFloor1Tier(
                        'reinforced_metal',
                        key,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
              ))}
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  2 Етажа / 2 Fl.
                </label>
                <input
                  type="number"
                  aria-label="Reinforced Metal 2 Storeys"
                  value={draft.reinforced_metal.floor2}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      reinforced_metal: {
                        ...prev.reinforced_metal,
                        floor2: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* 5. Turnkey Packages */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
              {lang === 'bg'
                ? '5. Пакети „До ключ“ (отделна позиция — €/m²)'
                : '5. Turnkey Finishing Packages (separate add-on — €/m²)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ['standard', 'Стандарт / Standard (420 €/m²)'],
                  ['luxury_680', 'Луксозен / Luxury (680 €/m²)'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    aria-label={`Turnkey ${label}`}
                    value={draft.turnkeyRates[key]}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        turnkeyRates: {
                          ...prev.turnkeyRates,
                          [key]: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                onResetDefaults();
                onClose();
              }}
              aria-label={resetLabel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
            >
              <RotateCcw className="w-4 h-4" />
              {resetLabel}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label={cancelLabel}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                aria-label={saveLabel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
              >
                <Save className="w-4 h-4" />
                {saveLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
