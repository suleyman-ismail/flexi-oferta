'use client';

import React, { useState } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Building2,
  Landmark,
  MapPin,
  Phone,
  Globe,
  Mail,
} from 'lucide-react';
import { CalculatedOffer, OfferFormState } from '@/types/offer';
import {
  COMPANY_INFO,
  SYSTEM_META,
  TURNKEY_META,
  CUSTOMER_RESPONSIBILITY,
  UI_TEXT,
} from '@/lib/constants';
import { formatEur } from '@/lib/pricingEngine';
import { formatBgDate } from '@/lib/pdfGenerator';

export interface BulgarianPdfPreviewProps {
  form: OfferFormState;
  calc: CalculatedOffer;
}

export function BulgarianPdfPreview({ form, calc }: BulgarianPdfPreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const lang = form.lang || 'bg';
  const t = UI_TEXT[lang];
  const sys = SYSTEM_META[form.system] ?? SYSTEM_META.press_standard;
  const tk = TURNKEY_META[form.turnkeyPackage] ?? TURNKEY_META.none;
  const respText = CUSTOMER_RESPONSIBILITY[lang];

  const handleZoomOut = () => setZoom((z) => Math.max(75, z - 10));
  const handleZoomIn = () => setZoom((z) => Math.min(115, z + 10));

  const showPage = (pageNum: 1 | 2 | 3 | 4) =>
    activeTab === 'all' || activeTab === pageNum;

  return (
    <section
      aria-label={t.previewBarTitle}
      className="flex flex-col h-full bg-zinc-200/80 dark:bg-zinc-950 overflow-y-auto"
    >
      {/* Sticky Preview Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <FileText className="w-3.5 h-3.5" />
            {t.previewBarTitle}
          </span>
        </div>

        {/* Page Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px] font-semibold">
          {(
            [
              ['all', t.tabAll],
              [1, t.tabP1],
              [2, t.tabP2],
              [3, t.tabP3],
              [4, t.tabP4],
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={String(tabKey)}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              aria-label={`Page tab ${label}`}
              className={`px-2 py-1 rounded-md transition ${
                activeTab === tabKey
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label={lang === 'bg' ? 'Намали мащаба' : 'Zoom out'}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 min-w-[3rem] text-center">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label={lang === 'bg' ? 'Увеличи мащаба' : 'Zoom in'}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col items-center gap-8">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
          className="w-full max-w-[794px] space-y-8 transition-transform duration-150"
        >
          {/* ============================================================== */}
          {/* PAGE 1: 01 CLIENT & SITE + 02 PRICE                            */}
          {/* ============================================================== */}
          {showPage(1) && (
            <article
              aria-label={
                lang === 'bg'
                  ? 'Страница 1: Клиент и Цена'
                  : 'Page 1: Client & Price'
              }
              className="bg-white text-zinc-900 rounded-sm shadow-xl border border-zinc-300 p-7 sm:p-9 flex flex-col justify-between min-h-[1040px]"
            >
              <div>
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-indigo-600">
                  <div className="flex items-start gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/flexi-home-logo.jpg`}
                      alt="Flexi Home Logo"
                      className="w-16 h-12 object-contain rounded border border-zinc-200 bg-white p-0.5 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-indigo-600">
                          {COMPANY_INFO.brand}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {COMPANY_INFO.website}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-800 mt-1">
                        {lang === 'bg'
                          ? COMPANY_INFO.legalName
                          : COMPANY_INFO.legalNameEn}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {lang === 'bg'
                          ? `Ценова база: ${COMPANY_INFO.priceBasis.bg} • Валута: ${COMPANY_INFO.currency}`
                          : `Price basis: ${COMPANY_INFO.priceBasis.en} • Currency: ${COMPANY_INFO.currency}`}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2">
                    <p className="text-sm font-black text-zinc-900">
                      {lang === 'bg'
                        ? `ОФЕРТА № ${form.offerNo || '26-0101'}`
                        : `OFFER No. ${form.offerNo || '26-0101'}`}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {lang === 'bg' ? 'Дата' : 'Date'}:{' '}
                      <span className="font-semibold">
                        {formatBgDate(form.date, lang)}
                      </span>{' '}
                      | {lang === 'bg' ? 'Валидност' : 'Validity'}:{' '}
                      <span className="font-semibold">
                        {form.validityDays} {lang === 'bg' ? 'дни' : 'days'}
                      </span>
                    </p>
                    <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                      {calc.resolvedLabels.systemName}
                    </p>
                  </div>
                </div>

                {/* 01 CLIENT & SITE */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                      01
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                      {lang === 'bg'
                        ? 'КЛИЕНТ И ОБЕКТ'
                        : 'CLIENT & PROJECT SITE'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 border border-zinc-200 rounded-lg overflow-hidden text-xs">
                    <div className="p-2.5 border-b border-r border-zinc-200 bg-zinc-50/60">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg' ? 'Клиент' : 'Client'}
                      </span>
                      <span className="font-bold text-zinc-900">
                        {form.clientName ||
                          (lang === 'bg' ? 'Не е посочено' : 'Not specified')}
                        {form.clientPhone ? ` (${form.clientPhone})` : ''}
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-zinc-200 bg-zinc-50/60">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Местоположение на обекта'
                          : 'Site Location'}
                      </span>
                      <span className="font-bold text-zinc-900">
                        {calc.resolvedLabels.locationFull}
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-r border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Етажност и Модел'
                          : 'Storeys & Model'}
                      </span>
                      <span className="font-bold text-zinc-900">
                        {calc.resolvedLabels.floorsLabel}
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Разрешение за строеж'
                          : 'Building Permit'}
                      </span>
                      <span className="font-bold text-zinc-900">
                        {calc.resolvedLabels.permitLabel}
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-r border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Застроена площ (РЗП)'
                          : 'Total Built-up Area (RZP)'}
                      </span>
                      <span className="font-bold text-indigo-700">
                        {form.areaRzp} m²
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Площ на основата (фундамент)'
                          : 'Foundation Footprint Area'}
                      </span>
                      <span className="font-bold text-amber-800">
                        {form.includeFoundation
                          ? `${calc.effectiveFoundationArea} m²`
                          : lang === 'bg'
                          ? 'От клиента'
                          : 'By client'}
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-r border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg' ? 'Покрив и Фасада' : 'Roof & Facade'}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {calc.resolvedLabels.roofLabel} |{' '}
                        {calc.resolvedLabels.facadeLabel}
                      </span>
                    </div>
                    <div className="p-2.5 border-b border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg' ? 'Дограма' : 'Windows & Joinery'}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {calc.resolvedLabels.winFullLabel}
                      </span>
                    </div>
                    <div className="p-2.5 border-r border-zinc-200">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Височина на стените / Таван'
                          : 'Wall Height / Ceiling Insulation'}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {calc.resolvedLabels.wallHeightLabel} /{' '}
                        {calc.resolvedLabels.ceilingLabel}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        {lang === 'bg'
                          ? 'Конструктивна система'
                          : 'Structural System'}
                      </span>
                      <span className="font-bold text-indigo-700">
                        {calc.resolvedLabels.systemName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 02 PRICE */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                      02
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                      {lang === 'bg'
                        ? 'ЦЕНА И ФИНАНСОВА СПЕЦИФИКАЦИЯ (С ВКЛ. 20% ДДС)'
                        : 'PRICE & FINANCIAL SPECIFICATION (INCL. 20% VAT)'}
                    </h3>
                  </div>

                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200">
                          <th className="py-2 px-3 text-left font-bold">
                            {lang === 'bg'
                              ? 'Позиция и описание'
                              : 'Item & Description'}
                          </th>
                          <th className="py-2 px-2 text-right font-bold">
                            {lang === 'bg' ? 'Площ' : 'Area'}
                          </th>
                          <th className="py-2 px-2 text-right font-bold">
                            {lang === 'bg' ? 'Ед. цена' : 'Unit Price'}
                          </th>
                          <th className="py-2 px-3 text-right font-bold">
                            {lang === 'bg' ? 'Обща сума' : 'Total'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {/* 1. Base Structure (до тапа) */}
                        <tr>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-zinc-900">
                              {lang === 'bg'
                                ? `1. Основна конструкция (етап „до тапа“) — ${sys.name.bg}`
                                : `1. Base Structure ("Rough-in / Shell" stage) — ${sys.name.en}`}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {sys.wallSpec[lang]} •{' '}
                              {lang === 'bg'
                                ? 'Производство, транспорт, монтаж и 20% ДДС'
                                : 'Manufacturing, transport, assembly & 20% VAT'}
                            </p>
                          </td>
                          <td className="py-2.5 px-2 text-right font-semibold whitespace-nowrap">
                            {form.areaRzp} m²
                          </td>
                          <td className="py-2.5 px-2 text-right font-semibold whitespace-nowrap">
                            {formatEur(calc.structureUnitRate)}/m²
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-zinc-900 whitespace-nowrap">
                            {formatEur(calc.structureTotal)}
                          </td>
                        </tr>

                        {/* Extra Option Row */}
                        {calc.extraOptionAmount > 0 && (
                          <tr>
                            <td className="py-2 px-3">
                              <p className="font-bold text-zinc-800">
                                {lang === 'bg'
                                  ? `Допълнителна опция: ${
                                      form.extraOptionLabel ||
                                      'Индивидуална опция'
                                    }`
                                  : `Extra Option: ${
                                      form.extraOptionLabel || 'Custom option'
                                    }`}
                              </p>
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-500">
                              —
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-500">
                              —
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-zinc-900 whitespace-nowrap">
                              + {formatEur(calc.extraOptionAmount)}
                            </td>
                          </tr>
                        )}

                        {/* Discount Row */}
                        {calc.discountEur > 0 && (
                          <tr className="bg-emerald-50/50">
                            <td className="py-2 px-3">
                              <p className="font-bold text-emerald-800">
                                {lang === 'bg'
                                  ? 'Търговска отстъпка (Промо пакет)'
                                  : 'Commercial Discount (Promo package)'}
                              </p>
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-700">
                              —
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-700">
                              —
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">
                              - {formatEur(calc.discountEur)}
                            </td>
                          </tr>
                        )}

                        {/* Contract Value Subtotal */}
                        <tr className="bg-indigo-50/90">
                          <td
                            colSpan={3}
                            className="py-2.5 px-3 font-extrabold text-indigo-950"
                          >
                            {lang === 'bg'
                              ? 'ДОГОВОРНА СТОЙНОСТ ЗА КОНСТРУКЦИЯ (до тапа, с вкл. 20% ДДС)'
                              : 'CONTRACT VALUE FOR BASE STRUCTURE (incl. 20% VAT)'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-sm text-indigo-700 whitespace-nowrap">
                            {formatEur(calc.contractStructureNet)}
                          </td>
                        </tr>

                        {/* 2. Separate Turnkey Package */}
                        {calc.hasTurnkey ? (
                          <tr className="bg-emerald-50/50">
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-emerald-950">
                                {lang === 'bg'
                                  ? `2. Допълнителен пакет „До ключ“ (отделен пакет / екстра) — ${tk.docName.bg}`
                                  : `2. Optional Turnkey Finishing Package (separate add-on) — ${tk.docName.en}`}
                              </p>
                              <p className="text-[11px] text-emerald-800 mt-0.5">
                                {lang === 'bg'
                                  ? 'Външна топлоизолация, гипсокартон и шпакловка, замазка, ламинат/фаянс, контакти/ключове, боядисване, кухня и санитария'
                                  : 'External thermal insulation, plasterboard & skim coat, floor screed, laminate/tiles, sockets/switches, painting, kitchen & sanitary ware'}
                              </p>
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-emerald-900 whitespace-nowrap">
                              {form.areaRzp} m²
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-emerald-900 whitespace-nowrap">
                              + {formatEur(calc.turnkeyUnitRate)}/m²
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-emerald-900 whitespace-nowrap">
                              {formatEur(calc.turnkeyTotal)}
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td className="py-2 px-3 text-zinc-500">
                              {lang === 'bg'
                                ? '2. Допълнителен пакет „До ключ“ (отделен пакет / екстра) — Не е избран'
                                : '2. Optional Turnkey Finishing Package (separate add-on) — Not selected'}
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-400">
                              —
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-400">
                              —
                            </td>
                            <td className="py-2 px-3 text-right text-zinc-400">
                              0 €
                            </td>
                          </tr>
                        )}

                        {/* 3. Separate Foundation (Provisional) */}
                        {form.includeFoundation ? (
                          <tr className="bg-amber-50/70">
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-amber-950">
                                {lang === 'bg'
                                  ? '3. Фундамент / Стоманобетонна основа (отделна позиция)'
                                  : '3. Foundation / Reinforced Concrete Slab (separate item)'}
                              </p>
                              <p className="text-[10px] font-medium text-amber-800 mt-0.5">
                                * {COMPANY_INFO.foundationDisclaimer[lang]}
                              </p>
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-amber-950 whitespace-nowrap">
                              {calc.effectiveFoundationArea} m²
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold text-amber-950 whitespace-nowrap">
                              {formatEur(calc.foundationUnitRate)}/m²
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-amber-950 whitespace-nowrap">
                              ≈ {formatEur(calc.foundationTotal)}
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td className="py-2 px-3 text-zinc-500">
                              {lang === 'bg'
                                ? '3. Фундамент (Стоманобетонна основа) — Изпълнява се от клиента'
                                : '3. Foundation (Reinforced Concrete Slab) — Executed by the client'}
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-400">
                              —
                            </td>
                            <td className="py-2 px-2 text-right text-zinc-400">
                              —
                            </td>
                            <td className="py-2 px-3 text-right text-zinc-400">
                              0 €
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Clear Totals Breakdown Box */}
                  <div
                    className={`mt-3 grid grid-cols-1 ${
                      calc.hasTurnkey ? 'sm:grid-cols-2' : ''
                    } gap-2.5`}
                  >
                    {calc.hasTurnkey && (
                      <div className="p-3 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                            {lang === 'bg'
                              ? 'Вариант А (Базов)'
                              : 'Option A (Base)'}
                          </span>
                          <span className="text-xs font-bold text-zinc-800">
                            {form.includeFoundation
                              ? lang === 'bg'
                                ? 'Само Конструкция (до тапа) + прогнозен Фундамент'
                                : 'Shell Structure + Indicative Foundation Only'
                              : lang === 'bg'
                              ? 'Само Конструкция (до тапа) — без фундамент'
                              : 'Shell Structure Only — without foundation'}
                          </span>
                        </div>
                        <span className="text-sm font-black text-zinc-900 whitespace-nowrap ml-2">
                          {form.includeFoundation
                            ? `≈ ${formatEur(calc.structurePlusFoundationTotal)}`
                            : formatEur(calc.contractStructureNet)}
                        </span>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-indigo-600 text-white flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-200 block">
                          {calc.hasTurnkey
                            ? lang === 'bg'
                              ? `Включен пакет „До ключ“ (${tk.docName.bg})`
                              : `Includes Turnkey Package (${tk.docName.en})`
                            : lang === 'bg'
                            ? 'Крайно обобщение'
                            : 'Final Summary'}
                        </span>
                        <span className="text-xs font-bold">
                          {calc.hasTurnkey
                            ? form.includeFoundation
                              ? lang === 'bg'
                                ? 'ОБЩА СТОЙНОСТ С ПАКЕТ „ДО КЛЮЧ“ И ФУНДАМЕНТ'
                                : 'GRAND TOTAL WITH TURNKEY & FOUNDATION'
                              : lang === 'bg'
                              ? 'ОБЩА СТОЙНОСТ С ПАКЕТ „ДО КЛЮЧ“'
                              : 'GRAND TOTAL WITH TURNKEY PACKAGE'
                            : form.includeFoundation
                            ? lang === 'bg'
                              ? 'ОБЩА ПРОГНОЗНА СТОЙНОСТ (КОНСТРУКЦИЯ + ФУНДАМЕНТ)'
                              : 'TOTAL ESTIMATED VALUE (STRUCTURE + FOUNDATION)'
                            : lang === 'bg'
                            ? 'ОБЩА ДОГОВОРНА СТОЙНОСТ (САМО КОНСТРУКЦИЯ)'
                            : 'TOTAL CONTRACT VALUE (SHELL STRUCTURE ONLY)'}
                        </span>
                      </div>
                      <span className="text-base font-black whitespace-nowrap ml-2">
                        {calc.hasTurnkey
                          ? form.includeFoundation
                            ? `≈ ${formatEur(calc.grandTotalWithTurnkey)}`
                            : formatEur(calc.contractWithTurnkeyTotal)
                          : form.includeFoundation
                          ? `≈ ${formatEur(calc.structurePlusFoundationTotal)}`
                          : formatEur(calc.contractStructureNet)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 1 Footer */}
              <div className="pt-4 mt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>
                  {COMPANY_INFO.brand} •{' '}
                  {lang === 'bg'
                    ? COMPANY_INFO.legalName
                    : COMPANY_INFO.legalNameEn}{' '}
                  • {COMPANY_INFO.website}
                </span>
                <span className="font-semibold">
                  {lang === 'bg' ? 'Страница 1 от 4' : 'Page 1 of 4'}
                </span>
              </div>
            </article>
          )}

          {/* ============================================================== */}
          {/* PAGE 2: 03 PAYMENT & TIMELINE + 04 COMPANY & BANK DETAILS      */}
          {/* ============================================================== */}
          {showPage(2) && (
            <article
              aria-label={
                lang === 'bg'
                  ? 'Страница 2: Плащане и Фирмени данни'
                  : 'Page 2: Payment & Company Details'
              }
              className="bg-white text-zinc-900 rounded-sm shadow-xl border border-zinc-300 p-7 sm:p-9 flex flex-col justify-between min-h-[1040px]"
            >
              <div>
                {/* Compact Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs">
                  <span className="font-extrabold text-indigo-600">
                    {COMPANY_INFO.brand} —{' '}
                    {lang === 'bg'
                      ? `ОФЕРТА № ${form.offerNo}`
                      : `OFFER No. ${form.offerNo}`}
                  </span>
                  <span className="text-zinc-500">
                    {lang === 'bg' ? 'Клиент' : 'Client'}:{' '}
                    <strong className="text-zinc-800">{form.clientName}</strong>
                  </span>
                </div>

                {/* 03 PAYMENT & TIMELINE */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                      03
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                      {lang === 'bg'
                        ? 'ПЛАЩАНЕ И СРОКОВЕ (БАЗА: ДОГОВОРНА СТОЙНОСТ НА КОНСТРУКЦИЯТА)'
                        : 'PAYMENT SCHEDULE & TIMELINE (BASIS: STRUCTURE CONTRACT VALUE)'}
                    </h3>
                  </div>

                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200">
                          <th className="py-2 px-3 text-left font-bold">
                            {lang === 'bg'
                              ? 'Етап на плащане'
                              : 'Payment Stage'}
                          </th>
                          <th className="py-2 px-2 text-center font-bold">
                            {lang === 'bg' ? 'Дял' : 'Share'}
                          </th>
                          <th className="py-2 px-3 text-right font-bold">
                            {lang === 'bg'
                              ? 'Сума (с ДДС)'
                              : 'Amount (incl. VAT)'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        <tr>
                          <td className="py-3 px-3 font-medium text-zinc-800">
                            {lang === 'bg'
                              ? 'Етап 1 — При подписване на договора'
                              : 'Stage 1 — Upon signing the contract'}
                          </td>
                          <td className="py-3 px-2 text-center font-extrabold text-indigo-700">
                            50%
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-zinc-900">
                            {formatEur(calc.paymentStages.stage1_50)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium text-zinc-800">
                            {lang === 'bg'
                              ? 'Етап 2 — При експедиция на стоката от фабриката към парцела на клиента'
                              : "Stage 2 — Upon dispatch of the structure from the factory to the client's plot"}
                          </td>
                          <td className="py-3 px-2 text-center font-extrabold text-indigo-700">
                            40%
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-zinc-900">
                            {formatEur(calc.paymentStages.stage2_40)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium text-zinc-800">
                            {lang === 'bg'
                              ? 'Етап 3 — След завършване на строително-монтажните работи'
                              : 'Stage 3 — Upon completion of construction and assembly works'}
                          </td>
                          <td className="py-3 px-2 text-center font-extrabold text-indigo-700">
                            10%
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-zinc-900">
                            {formatEur(calc.paymentStages.stage3_10)}
                          </td>
                        </tr>
                        <tr className="bg-indigo-50/70">
                          <td className="py-2.5 px-3 font-extrabold text-indigo-950">
                            {lang === 'bg'
                              ? 'ОБЩО ДОГОВОРНА СТОЙНОСТ ЗА КОНСТРУКЦИЯ (100%)'
                              : 'TOTAL STRUCTURE CONTRACT VALUE (100%)'}
                          </td>
                          <td className="py-2.5 px-2 text-center font-extrabold text-indigo-900">
                            100%
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-indigo-700">
                            {formatEur(calc.contractStructureNet)}
                          </td>
                        </tr>
                        {calc.hasTurnkey && (
                          <tr className="bg-emerald-50/50">
                            <td className="py-2.5 px-3 font-bold text-emerald-950">
                              {lang === 'bg'
                                ? `+ Пакет „До ключ“ (${calc.turnkeyName}) — по график за довършителни работи`
                                : `+ Turnkey Package (${calc.turnkeyName}) — finishing works schedule`}
                            </td>
                            <td className="py-2.5 px-2 text-center font-semibold text-emerald-700">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-emerald-800 whitespace-nowrap">
                              +{formatEur(calc.turnkeyTotal)}
                            </td>
                          </tr>
                        )}
                        {form.includeFoundation && (
                          <tr className="bg-amber-50/60">
                            <td className="py-2.5 px-3 font-bold text-amber-950">
                              {lang === 'bg'
                                ? '+ Фундамент (Стоманобетонна основа) — при изпълнение на основата'
                                : '+ Foundation (Concrete Base) — upon base execution'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-semibold text-amber-700">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-amber-900 whitespace-nowrap">
                              ≈ +{formatEur(calc.foundationTotal)}
                            </td>
                          </tr>
                        )}
                        {(calc.hasTurnkey || form.includeFoundation) && (
                          <tr className="bg-indigo-600 text-white">
                            <td className="py-3 px-3 font-extrabold uppercase tracking-wide">
                              {lang === 'bg'
                                ? 'ОБЩА СТОЙНОСТ НА ПРОЕКТА (ВСИЧКО ВКЛЮЧЕНО)'
                                : 'TOTAL PROJECT VALUE (ALL SELECTED ITEMS)'}
                            </td>
                            <td className="py-3 px-2 text-center font-bold text-indigo-200">
                              {lang === 'bg' ? 'Общо' : 'Total'}
                            </td>
                            <td className="py-3 px-3 text-right font-black text-sm whitespace-nowrap">
                              {form.includeFoundation ? '≈ ' : ''}
                              {formatEur(calc.grandTotalWithTurnkey)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <p className="font-bold text-zinc-900">
                      ⏱ {COMPANY_INFO.deliveryTerm[lang]}
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      *{' '}
                      {lang === 'bg'
                        ? 'Посочените по-горе 50% / 40% / 10% вноски се изчисляват само върху договорната стойност на конструкцията („до тапа“).'
                        : 'The 50% / 40% / 10% installments above are calculated strictly on the Base Structure ("Rough-in / Shell") contract value.'}
                    </p>
                    {calc.hasTurnkey && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        *{' '}
                        {lang === 'bg'
                          ? `Избраният отделен пакет „До ключ“ (${formatEur(
                              calc.turnkeyTotal
                            )}) се заплаща по допълнителен погасителен план съгласно етапите на довършителните работи.`
                          : `The selected optional Turnkey Package (${formatEur(
                              calc.turnkeyTotal
                            )}) is paid according to a separate schedule aligned with finishing work milestones.`}
                      </p>
                    )}
                    {form.includeFoundation && (
                      <p className="text-[11px] text-amber-800 font-medium">
                        *{' '}
                        {lang === 'bg'
                          ? `Фундаментът (${formatEur(
                              calc.foundationTotal
                            )}) се заплаща отделно при изпълнение на основата.`
                          : `The Foundation (${formatEur(
                              calc.foundationTotal
                            )}) is billed separately upon base execution.`}
                      </p>
                    )}
                  </div>

                  {/* Bank Financing / Credit Intermediation Notice (Postbank & UniCredit) */}
                  <div className="mt-3 p-3.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 shadow-sm text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-extrabold uppercase tracking-wide text-emerald-900">
                        {lang === 'bg'
                          ? 'БАНКОВО ФИНАНСИРАНЕ И СЪДЕЙСТВИЕ ЗА КРЕДИТ'
                          : 'BANK FINANCING & CREDIT ASSISTANCE'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                        {lang === 'bg' ? 'ПАРТНЬОРСКИ БАНКИ' : 'PARTNER BANKS'}
                      </span>
                    </div>
                    <p className="text-[11.5px] font-semibold text-zinc-900 leading-relaxed">
                      {lang === 'bg' ? (
                        <>
                          „С 1 ТРЕЙД“ ЕООД (Flexi Home) има сключени партньорски договори за кредитиране с{' '}
                          <span className="font-extrabold text-emerald-800 underline decoration-emerald-500/60">Postbank</span> и{' '}
                          <span className="font-extrabold text-emerald-800 underline decoration-emerald-500/60">UniCredit Bulbank</span>. Оказваме пълно съдействие и кредитно посредничество за финансиране на Вашия дом при преференциални условия.
                        </>
                      ) : (
                        <>
                          „S 1 TRADE“ EOOD (Flexi Home) has active financing partnerships with{' '}
                          <span className="font-extrabold text-emerald-800 underline decoration-emerald-500/60">Postbank</span> and{' '}
                          <span className="font-extrabold text-emerald-800 underline decoration-emerald-500/60">UniCredit Bulbank</span>. We provide full credit intermediation and assistance to finance your home under preferential terms.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* 04 COMPANY & BANK DETAILS */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                      04
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                      {lang === 'bg'
                        ? 'ФИРМЕНИ И БАНКОВИ ДАННИ'
                        : 'COMPANY & BANK DETAILS'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        {lang === 'bg' ? 'Юридическо лице' : 'Legal Entity'}
                      </div>
                      <p>
                        <span className="text-zinc-500">
                          {lang === 'bg' ? 'Дружество:' : 'Company:'}
                        </span>{' '}
                        <strong>
                          {lang === 'bg'
                            ? COMPANY_INFO.legalName
                            : COMPANY_INFO.legalNameEn}
                        </strong>
                      </p>
                      <p>
                        <span className="text-zinc-500">
                          {lang === 'bg' ? 'ЕИК:' : 'UIC:'}
                        </span>{' '}
                        <strong>{COMPANY_INFO.eik}</strong>
                      </p>
                      <p>
                        <span className="text-zinc-500">
                          {lang === 'bg' ? 'ДДС №:' : 'VAT No.:'}
                        </span>{' '}
                        <strong>{COMPANY_INFO.vatNo}</strong>
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                        <Landmark className="w-4 h-4 text-indigo-600" />
                        {lang === 'bg' ? 'Банкова сметка' : 'Bank Account'}
                      </div>
                      <p>
                        <span className="text-zinc-500">
                          {lang === 'bg' ? 'Банка:' : 'Bank:'}
                        </span>{' '}
                        <strong>
                          {lang === 'bg'
                            ? COMPANY_INFO.bankName
                            : COMPANY_INFO.bankNameEn}
                        </strong>
                      </p>
                      <p>
                        <span className="text-zinc-500">IBAN:</span>{' '}
                        <strong className="font-mono text-indigo-900">
                          {COMPANY_INFO.iban}
                        </strong>
                      </p>
                      <p>
                        <span className="text-zinc-500">BIC:</span>{' '}
                        <strong className="font-mono">
                          {COMPANY_INFO.bic}
                        </strong>
                      </p>
                    </div>

                    <div className="sm:col-span-2 p-3.5 rounded-lg border border-zinc-200 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-900">
                            {lang === 'bg' ? 'Офис София:' : 'Sofia Office:'}
                          </span>{' '}
                          <span className="text-zinc-700">
                            {lang === 'bg'
                              ? COMPANY_INFO.addressSofia
                              : COMPANY_INFO.addressSofiaEn}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-900">
                            {lang === 'bg' ? 'Офис Бургас:' : 'Burgas Office:'}
                          </span>{' '}
                          <span className="text-zinc-700">
                            {lang === 'bg'
                              ? COMPANY_INFO.addressBurgas
                              : COMPANY_INFO.addressBurgasEn}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-4 text-[11px] text-zinc-700">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                          {COMPANY_INFO.phones.join(' | ')}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          {COMPANY_INFO.email}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700">
                          <Globe className="w-3.5 h-3.5 text-indigo-600" />
                          {COMPANY_INFO.website}
                        </span>
                      </div>
                    </div>
                  </div>

                  {form.customNotes.trim() && (
                    <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs">
                      <span className="font-bold text-amber-950 block mb-0.5">
                        {lang === 'bg'
                          ? 'Допълнителни бележки и специални условия:'
                          : 'Additional Notes & Special Conditions:'}
                      </span>
                      <p className="text-zinc-800 whitespace-pre-line">
                        {form.customNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Page 2 Footer */}
              <div className="pt-4 mt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>
                  {COMPANY_INFO.brand} •{' '}
                  {lang === 'bg'
                    ? COMPANY_INFO.legalName
                    : COMPANY_INFO.legalNameEn}{' '}
                  • {COMPANY_INFO.website}
                </span>
                <span className="font-semibold">
                  {lang === 'bg' ? 'Страница 2 от 4' : 'Page 2 of 4'}
                </span>
              </div>
            </article>
          )}

          {/* ============================================================== */}
          {/* PAGE 3: 05 SPECIFICATION OF THE SELECTED SYSTEM                */}
          {/* ============================================================== */}
          {showPage(3) && (
            <article
              aria-label={
                lang === 'bg'
                  ? 'Страница 3: Спецификация на избраната система'
                  : 'Page 3: Specification of the Selected System'
              }
              className="bg-white text-zinc-900 rounded-sm shadow-xl border border-zinc-300 p-7 sm:p-9 flex flex-col justify-between min-h-[1040px]"
            >
              <div>
                {/* Compact Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs">
                  <span className="font-extrabold text-indigo-600">
                    {COMPANY_INFO.brand} —{' '}
                    {lang === 'bg'
                      ? `ОФЕРТА № ${form.offerNo}`
                      : `OFFER No. ${form.offerNo}`}
                  </span>
                  <span className="text-zinc-500">
                    {lang === 'bg' ? 'Система' : 'System'}:{' '}
                    <strong className="text-zinc-800">
                      {calc.resolvedLabels.systemName}
                    </strong>
                  </span>
                </div>

                {/* 05 SPECIFICATION */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                      05
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                      {lang === 'bg'
                        ? `СПЕЦИФИКАЦИЯ НА ИЗБРАНАТА СИСТЕМА (${sys.name.bg})`
                        : `SPECIFICATION OF THE SELECTED SYSTEM (${sys.name.en})`}
                    </h3>
                  </div>

                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200">
                          <th className="py-2 px-3 text-left font-bold w-1/3">
                            {lang === 'bg'
                              ? 'Компонент / Система'
                              : 'Component / System'}
                          </th>
                          <th className="py-2 px-3 text-left font-bold">
                            {lang === 'bg'
                              ? 'Техническо описание и параметри'
                              : 'Technical Description & Parameters'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {calc.specRows.map((row, idx) => (
                          <tr
                            key={row.element}
                            className={
                              idx % 2 === 1 ? 'bg-zinc-50/70' : 'bg-white'
                            }
                          >
                            <td className="py-2.5 px-3 font-bold text-indigo-950 align-top">
                              {row.element}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-700 leading-relaxed">
                              {row.spec}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Page 3 Footer */}
              <div className="pt-4 mt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>
                  {COMPANY_INFO.brand} •{' '}
                  {lang === 'bg'
                    ? COMPANY_INFO.legalName
                    : COMPANY_INFO.legalNameEn}{' '}
                  • {COMPANY_INFO.website}
                </span>
                <span className="font-semibold">
                  {lang === 'bg' ? 'Страница 3 от 4' : 'Page 3 of 4'}
                </span>
              </div>
            </article>
          )}

          {/* ============================================================== */}
          {/* PAGE 4: 06 SCOPE OF OFFER + 07 CLIENT RESPONSIBILITIES         */}
          {/* ============================================================== */}
          {showPage(4) && (
            <article
              aria-label={
                lang === 'bg'
                  ? 'Страница 4: Обхват и Отговорност на клиента'
                  : 'Page 4: Scope & Client Responsibilities'
              }
              className="bg-white text-zinc-900 rounded-sm shadow-xl border border-zinc-300 p-7 sm:p-9 flex flex-col justify-between min-h-[1040px]"
            >
              <div>
                {/* Compact Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs">
                  <span className="font-extrabold text-indigo-600">
                    {COMPANY_INFO.brand} —{' '}
                    {lang === 'bg'
                      ? `ОФЕРТА № ${form.offerNo}`
                      : `OFFER No. ${form.offerNo}`}
                  </span>
                  <span className="text-zinc-500">
                    {calc.hasTurnkey
                      ? lang === 'bg'
                        ? `Режим: Конструкция + Пакет „До ключ“ (${tk.docName.bg})`
                        : `Mode: Structure + Turnkey Package (${tk.docName.en})`
                      : lang === 'bg'
                      ? 'Режим: Основна конструкция (до тапа)'
                      : 'Mode: Base Structure (Rough-in / Shell)'}
                  </span>
                </div>

                {/* 06 SCOPE OF OFFER */}
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                        06
                      </span>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                        {lang === 'bg'
                          ? 'ОБХВАТ НА ОФЕРТАТА'
                          : 'SCOPE OF OFFER'}
                      </h3>
                    </div>
                    {calc.hasTurnkey && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {lang === 'bg'
                          ? 'Довършителните работи са прехвърлени във „Включено в цената“'
                          : 'Finishing works automatically moved to "Included in Price"'}
                      </span>
                    )}
                  </div>

                  <div
                    className={`grid grid-cols-1 ${
                      calc.hasTurnkey ? '' : 'sm:grid-cols-2'
                    } gap-3`}
                  >
                    {/* Left Column: Included */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs text-emerald-950 pb-2 mb-2 border-b border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        {lang === 'bg'
                          ? 'Включено в цената'
                          : 'Included in the Price'}
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-zinc-800">
                        {calc.includedScope.map((item) => (
                          <li key={item} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Excluded (Hidden when a Turnkey package is active) */}
                    {!calc.hasTurnkey && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
                        <div className="flex items-center gap-1.5 font-extrabold text-xs text-rose-950 pb-2 mb-2 border-b border-rose-200">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          {lang === 'bg'
                            ? 'Не включва — за сметка на клиента'
                            : "Not Included — Client's Expense"}
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-zinc-800">
                          {calc.excludedScope.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold mt-0.5">
                                ✕
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 07 CLIENT RESPONSIBILITIES */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-indigo-600 text-white">
                      07
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                      {lang === 'bg'
                        ? 'ОТГОВОРНОСТ НА КЛИЕНТА'
                        : 'CLIENT RESPONSIBILITIES'}
                    </h3>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
                    <div className="flex items-start gap-2 text-[11px] text-zinc-700 leading-relaxed">
                      <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <p>{respText}</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="mt-10 grid grid-cols-2 gap-8 pt-4">
                    <div className="border-t border-zinc-300 pt-2">
                      <p className="text-xs font-bold text-zinc-900">
                        {lang === 'bg'
                          ? 'ЗА ИЗПЪЛНИТЕЛЯ:'
                          : 'FOR THE CONTRACTOR:'}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {lang === 'bg'
                          ? COMPANY_INFO.legalName
                          : COMPANY_INFO.legalNameEn}{' '}
                        ({COMPANY_INFO.brand})
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-6">
                        {lang === 'bg' ? 'Подпис и печат' : 'Signature & Stamp'}
                      </p>
                    </div>
                    <div className="border-t border-zinc-300 pt-2">
                      <p className="text-xs font-bold text-zinc-900">
                        {lang === 'bg' ? 'ЗА ВЪЗЛОЖИТЕЛЯ:' : 'FOR THE CLIENT:'}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {form.clientName || '................................'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-6">
                        {lang === 'bg' ? 'Подпис и дата' : 'Signature & Date'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 4 Footer */}
              <div className="pt-4 mt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>
                  {COMPANY_INFO.brand} •{' '}
                  {lang === 'bg'
                    ? COMPANY_INFO.legalName
                    : COMPANY_INFO.legalNameEn}{' '}
                  • {COMPANY_INFO.website}
                </span>
                <span className="font-semibold">
                  {lang === 'bg' ? 'Страница 4 от 4' : 'Page 4 of 4'}
                </span>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
