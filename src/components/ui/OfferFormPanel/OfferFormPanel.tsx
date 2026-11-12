'use client';

import React from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Edit3,
  Hash,
  Home,
  Layers,
  MapPin,
  MessageCircle,
  PackagePlus,
  Paintbrush,
  Phone,
  RefreshCw,
  RotateCcw,
  Ruler,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import {
  CATALOG_MODELS,
  CEILING_INSUL_OPTIONS,
  FACADE_OPTIONS,
  PERMIT_STATUS_OPTIONS,
  ROOF_OPTIONS,
  SYSTEM_META,
  TURNKEY_META,
  UI_TEXT,
  WALL_HEIGHT_OPTIONS,
  WIN_COLOR_OPTIONS,
  WIN_GLAZING_OPTIONS,
  WIN_PROFILE_OPTIONS,
} from '@/lib/constants';
import {
  formatEur,
  generateOfferNumber,
  getBaseStructureUnitRate,
  getBaseTurnkeyUnitRate,
  getDefaultWallThicknessCm,
} from '@/lib/pricingEngine';
import {
  buildOfferShareMessage,
  buildViberUrl,
  buildWhatsAppUrl,
  normalizePhoneForMessenger,
} from '@/lib/shareLinks';
import {
  CalculatedOffer,
  CeilingInsulKey,
  FacadeKey,
  FloorCount,
  OfferFormState,
  PermitStatusKey,
  PricingConfig,
  RoofColorKey,
  SystemType,
  TurnkeyPackageType,
  WallHeightKey,
  WinColorKey,
  WinGlazingKey,
  WinProfileKey,
} from '@/types/offer';

interface OfferFormPanelProps {
  form: OfferFormState;
  pricingConfig: PricingConfig;
  calc: CalculatedOffer;
  isAdmin?: boolean;
  onUpdateForm: (patch: Partial<OfferFormState>) => void;
  onSelectCatalogModel: (modelId: string) => void;
  onOpenPricingModal: () => void;
}

export const OfferFormPanel: React.FC<OfferFormPanelProps> = ({
  form,
  pricingConfig,
  calc,
  isAdmin = true,
  onUpdateForm,
  onSelectCatalogModel,
  onOpenPricingModal,
}) => {
  const lang = form.lang || 'bg';
  const T = UI_TEXT[lang];

  const autoStructureRate = getBaseStructureUnitRate(form, pricingConfig);
  const autoTurnkeyRate = getBaseTurnkeyUnitRate(form, pricingConfig);
  const autoFoundationRate = pricingConfig.foundationRate;

  const isStructureOverridden = form.structureRateOverride !== null;
  const isFoundationOverridden = form.foundationRateOverride !== null;
  const isTurnkeyOverridden = form.turnkeyRateOverride !== null;

  const activeCatalogModel = CATALOG_MODELS.find(
    (m) => m.id === form.catalogModelId
  );
  const filteredModels = CATALOG_MODELS.filter((m) => m.floors === form.floors);

  return (
    <div className="space-y-5 pb-10">
      {/* 1. CLIENT, LOCATION & AUTO OFFER NO */}
      <section
        aria-label={T.sec1Title}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {T.sec1Title}
          </h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            № {form.offerNo}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="clientName"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.clientName}
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-2.5" />
              <input
                id="clientName"
                type="text"
                aria-label={T.clientName}
                value={form.clientName}
                onChange={(e) => onUpdateForm({ clientName: e.target.value })}
                placeholder={T.clientNamePh}
                className="w-full ps-8 pe-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="clientPhone"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.clientPhone}
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-2.5" />
              <input
                id="clientPhone"
                type="text"
                aria-label={T.clientPhone}
                value={form.clientPhone}
                onChange={(e) => onUpdateForm({ clientPhone: e.target.value })}
                placeholder={T.clientPhonePh}
                className="w-full ps-8 pe-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            {(() => {
              const shareMsg = buildOfferShareMessage(form, calc);
              const waUrl = buildWhatsAppUrl(form.clientPhone, shareMsg);
              const viberUrl = buildViberUrl(form.clientPhone, shareMsg);
              const normalized = normalizePhoneForMessenger(form.clientPhone);
              return (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      lang === 'bg'
                        ? 'Изпрати оферта по WhatsApp'
                        : 'Send offer via WhatsApp'
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                  <a
                    href={viberUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      lang === 'bg'
                        ? 'Изпрати оферта по Viber'
                        : 'Send offer via Viber'
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    Viber
                  </a>
                  {normalized ? (
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      +{normalized}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {lang === 'bg'
                        ? 'Въведете телефон за директен чат'
                        : 'Enter phone for direct chat'}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.country}
            </label>
            <input
              id="country"
              type="text"
              aria-label={T.country}
              value={form.country}
              onChange={(e) => onUpdateForm({ country: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="region"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.region}
            </label>
            <input
              id="region"
              type="text"
              aria-label={T.region}
              value={form.region}
              onChange={(e) => onUpdateForm({ region: e.target.value })}
              placeholder={lang === 'en' ? 'Sofia / Burgas / Varna' : 'София / Бургас / Варна'}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.location}
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-2.5" />
              <input
                id="location"
                type="text"
                aria-label={T.location}
                value={form.location}
                onChange={(e) => onUpdateForm({ location: e.target.value })}
                placeholder={T.locationPh}
                className="w-full ps-8 pe-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="fullAddress"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.fullAddress}
            </label>
            <input
              id="fullAddress"
              type="text"
              aria-label={T.fullAddress}
              value={form.fullAddress}
              onChange={(e) => onUpdateForm({ fullAddress: e.target.value })}
              placeholder={T.fullAddressPh}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="offerNo"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.offerNo}
            </label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-2.5" />
                <input
                  id="offerNo"
                  type="text"
                  readOnly
                  aria-label={T.offerNo}
                  value={form.offerNo}
                  className="w-full ps-8 pe-2 py-1.5 text-sm font-mono font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 cursor-not-allowed focus:outline-none"
                />
              </div>
              <button
                type="button"
                aria-label={T.nextOfferNoBtn}
                title={T.nextOfferNoBtn}
                onClick={() =>
                  onUpdateForm({ offerNo: generateOfferNumber(true) })
                }
                className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="offerDate"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                {T.date}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute start-2.5 top-2.5 pointer-events-none" />
                <input
                  id="offerDate"
                  type="date"
                  aria-label={T.date}
                  value={form.date}
                  onChange={(e) => onUpdateForm({ date: e.target.value })}
                  className="w-full ps-7 pe-2 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="validityDays"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                {T.validity}
              </label>
              <input
                id="validityDays"
                type="number"
                min={1}
                max={90}
                aria-label={T.validity}
                value={form.validityDays}
                onChange={(e) =>
                  onUpdateForm({
                    validityDays: Math.max(1, Number(e.target.value) || 15),
                  })
                }
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="permitStatus"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.permit}
            </label>
            <select
              id="permitStatus"
              aria-label={T.permit}
              value={form.permitStatus}
              onChange={(e) =>
                onUpdateForm({
                  permitStatus: e.target.value as PermitStatusKey,
                })
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {PERMIT_STATUS_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2. WEBSITE CATALOGUE MODELS, STOREYS, SYSTEM & RZP AREA */}
      <section
        aria-label={T.sec2Title}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {T.sec2Title}
          </h2>
          {isAdmin && (
            <button
              type="button"
              aria-label={T.editTariffsLink}
              onClick={onOpenPricingModal}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              {T.editTariffsLink}
            </button>
          )}
        </div>

        {/* Storeys (1 Storey MK-1 vs 2 Storeys MK-2) */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {T.floorsLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([1, 2] as FloorCount[]).map((fl) => (
              <button
                key={fl}
                type="button"
                aria-label={fl === 1 ? T.floor1Btn : T.floor2Btn}
                onClick={() => {
                  const defaultModel = fl === 1 ? 'e85' : 'd128';
                  onSelectCatalogModel(defaultModel);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  form.floors === fl
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {fl === 1 ? T.floor1Btn : T.floor2Btn}
              </button>
            ))}
          </div>
        </div>

        {/* Website Catalogue Models Grid */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {T.catalogModelsLabel}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {filteredModels.map((m) => {
              const isSelected = form.catalogModelId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-label={`${m.code} ${m.area} m²`}
                  onClick={() => onSelectCatalogModel(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all flex flex-col items-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400'
                  }`}
                >
                  <span>
                    {m.code} · {m.area} m²
                  </span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-indigo-100' : 'text-zinc-500'
                    }`}
                  >
                    {m.bedrooms} {T.bedroomsUnit}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              aria-label={T.customModelBtn}
              onClick={() => onSelectCatalogModel('custom')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                form.catalogModelId === 'custom'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {T.customModelBtn}
            </button>
          </div>
          {activeCatalogModel && (
            <div className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200">
              <strong>
                {activeCatalogModel.code} · {activeCatalogModel.area} m²:
              </strong>{' '}
              {lang === 'en'
                ? activeCatalogModel.summaryEn
                : activeCatalogModel.summaryBg}
            </div>
          )}
          <input
            type="text"
            aria-label={lang === 'bg' ? 'Име / код на модела (по избор)' : 'Custom model name / code (optional)'}
            value={form.modelCodeLabel}
            onChange={(e) => onUpdateForm({ modelCodeLabel: e.target.value })}
            placeholder={
              lang === 'bg'
                ? 'Име / код на модела (напр. Е85 или Индивидуален проект)...'
                : 'Model name / code (e.g. E85 or Custom Project)...'
            }
            className="mt-2 w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* 4 Structural Systems from Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          {(Object.keys(SYSTEM_META) as SystemType[]).map((sysKey) => {
            const meta = SYSTEM_META[sysKey];
            const selected = form.system === sysKey;
            return (
              <button
                key={sysKey}
                type="button"
                aria-label={meta.name[lang]}
                onClick={() =>
                  onUpdateForm({
                    system: sysKey,
                    structureRateOverride: null,
                  })
                }
                className={`text-start p-3 rounded-xl border transition-all ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {meta.name[lang]}
                  </span>
                  {selected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {meta.shortDesc[lang]}
                </p>
              </button>
            );
          })}
        </div>
        <div className="mb-4">
          <input
            type="text"
            aria-label={lang === 'bg' ? 'Свободен текст за конструктивна система (по избор)' : 'Custom structural system text (optional)'}
            value={form.systemCustomText ?? ''}
            onChange={(e) => onUpdateForm({ systemCustomText: e.target.value })}
            placeholder={
              lang === 'bg'
                ? 'Свободен текст за система / конструкция (оставете празно за горния избор)...'
                : 'Custom structural system text (leave empty to use selection above)...'
            }
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Total RZP Area & 2-Storey Press-Panel Rate Variant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label
              htmlFor="areaRzp"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.areaRzpLabel}
            </label>
            <div className="relative">
              <Ruler className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-2.5" />
              <input
                id="areaRzp"
                type="number"
                min={10}
                max={1000}
                aria-label={T.areaRzpLabel}
                value={form.areaRzp}
                onChange={(e) =>
                  onUpdateForm({
                    areaRzp: Math.max(1, Number(e.target.value) || 0),
                    catalogModelId: 'custom',
                  })
                }
                className="w-full ps-8 pe-12 py-1.5 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <span className="absolute end-3 top-2 text-xs text-zinc-400 font-medium">
                m²
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {T.autoTierRate}{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">
                {autoStructureRate} €/m²
              </strong>
            </p>
          </div>

          {form.system === 'press_standard' && form.floors === 2 && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {T.press2FloorTariff}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['489', '515'] as const).map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    aria-label={`${variant} EUR/m²`}
                    onClick={() =>
                      onUpdateForm({
                        pressTwoFloorVariant: variant,
                        structureRateOverride: null,
                      })
                    }
                    className={`py-1.5 px-3 text-xs rounded-lg font-bold border ${
                      form.pressTwoFloorVariant === variant
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {variant === '489'
                      ? `${pricingConfig.press_standard.floor2Default} €/m²`
                      : `${pricingConfig.press_standard.floor2Alt} €/m²`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Structure Unit Rate Override Box */}
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <span>{T.structureRateBoxTitle}</span>
              {isStructureOverridden && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-medium">
                  {T.manualOverrideBadge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {T.contractValueText}{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {formatEur(calc.contractStructureNet)}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              aria-label={T.structureRateBoxTitle}
              value={
                form.structureRateOverride !== null
                  ? form.structureRateOverride
                  : autoStructureRate
              }
              onChange={(e) => {
                const val = e.target.value;
                onUpdateForm({
                  structureRateOverride: val === '' ? null : Number(val),
                });
              }}
              className="w-24 px-2.5 py-1 text-sm font-bold text-end rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <span className="text-xs text-zinc-500 font-medium">€/m²</span>
            {isStructureOverridden && (
              <button
                type="button"
                aria-label="Reset Structure Rate"
                onClick={() => onUpdateForm({ structureRateOverride: null })}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. FOUNDATION (Фундамент) */}
      <section
        aria-label={T.sec3Title}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {T.sec3Title}
          </h2>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              aria-label={T.includeFoundationCheck}
              checked={form.includeFoundation}
              onChange={(e) =>
                onUpdateForm({ includeFoundation: e.target.checked })
              }
              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {T.includeFoundationCheck}
            </span>
          </label>
        </div>

        {form.floors === 2 && form.includeFoundation && (
          <div className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 p-2.5 text-xs text-amber-900 dark:text-amber-200">
            {T.twoFloorRuleAlert}
          </div>
        )}

        {form.includeFoundation ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="foundationArea"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                {T.foundationAreaLabel}
              </label>
              <div className="relative">
                <input
                  id="foundationArea"
                  type="number"
                  min={1}
                  max={1000}
                  aria-label={T.foundationAreaLabel}
                  value={form.foundationArea}
                  onChange={(e) =>
                    onUpdateForm({
                      foundationArea: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <span className="absolute end-3 top-2 text-xs text-zinc-400">
                  m²
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="foundationRate"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                {T.foundationRateLabel} {autoFoundationRate} €
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="foundationRate"
                  type="number"
                  min={0}
                  aria-label={T.foundationRateLabel}
                  value={
                    form.foundationRateOverride !== null
                      ? form.foundationRateOverride
                      : autoFoundationRate
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateForm({
                      foundationRateOverride: val === '' ? null : Number(val),
                    });
                  }}
                  className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {isFoundationOverridden && (
                  <button
                    type="button"
                    aria-label="Reset Foundation Rate"
                    onClick={() =>
                      onUpdateForm({ foundationRateOverride: null })
                    }
                    className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              <span>
                {T.foundationEstTotal} ({calc.effectiveFoundationArea} m² ×{' '}
                {calc.foundationUnitRate} €/m²):
              </span>
              <strong className="text-amber-700 dark:text-amber-400 text-sm">
                ≈ {formatEur(calc.foundationTotal)}
              </strong>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {T.foundationExcludedMsg}
          </p>
        )}
      </section>

      {/* 4. TURNKEY FINISHING PACKAGES (Пакет „До ключ“) */}
      <section
        aria-label={T.sec4Title}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {T.sec4Title}
          </h2>
          {calc.hasTurnkey && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {T.scopeUpdatedBadge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {(Object.keys(TURNKEY_META) as TurnkeyPackageType[]).map((pkgKey) => {
            const meta = TURNKEY_META[pkgKey];
            const selected = form.turnkeyPackage === pkgKey;
            return (
              <button
                key={pkgKey}
                type="button"
                aria-label={meta.label[lang]}
                onClick={() =>
                  onUpdateForm({
                    turnkeyPackage: pkgKey,
                    turnkeyRateOverride:
                      pkgKey === 'custom'
                        ? form.turnkeyRateOverride ?? 420
                        : null,
                  })
                }
                className={`text-start px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 font-semibold ring-1 ring-indigo-600'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                }`}
              >
                <span>{meta.label[lang]}</span>
                {selected && (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {calc.hasTurnkey && (
          <div className="rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                {T.turnkeyRateBoxTitle} ({calc.turnkeyName})
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                {T.turnkeyExtraSum} ({form.areaRzp} m² × {calc.turnkeyUnitRate}{' '}
                €/m²): <strong>{formatEur(calc.turnkeyTotal)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                aria-label={T.turnkeyRateBoxTitle}
                value={
                  form.turnkeyRateOverride !== null
                    ? form.turnkeyRateOverride
                    : autoTurnkeyRate
                }
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateForm({
                    turnkeyRateOverride: val === '' ? null : Number(val),
                  });
                }}
                className="w-24 px-2.5 py-1 text-sm font-bold text-end rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                €/m²
              </span>
              {isTurnkeyOverridden && form.turnkeyPackage !== 'custom' && (
                <button
                  type="button"
                  aria-label="Reset Turnkey Rate"
                  onClick={() => onUpdateForm({ turnkeyRateOverride: null })}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 5. WEBSITE ARCHITECTURAL & TECHNICAL OPTIONS (WINDOWS, ROOF, FACADE, CEILING) */}
      <section
        aria-label={T.sec5Title}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {T.sec5Title}
        </h2>

        {/* Window Joinery Colour Swatches (from flexi-home.eu) */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {T.winColorLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WIN_COLOR_OPTIONS.map((w) => {
              const selected = form.winColorKey === w.key;
              return (
                <button
                  key={w.key}
                  type="button"
                  aria-label={w.label[lang]}
                  onClick={() =>
                    onUpdateForm({ winColorKey: w.key as WinColorKey })
                  }
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-1 ring-indigo-600 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-zinc-400 shrink-0"
                    style={{ backgroundColor: w.colorHex }}
                  />
                  <span className="truncate">{w.label[lang]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Window Profile (5/6/7-chamber PVC, Aluminium) & Glazing (Double, Triple, Frosted) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="winProfileKey"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.winProfileLabel}
            </label>
            <select
              id="winProfileKey"
              aria-label={T.winProfileLabel}
              value={form.winProfileKey}
              onChange={(e) =>
                onUpdateForm({ winProfileKey: e.target.value as WinProfileKey })
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {WIN_PROFILE_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label[lang]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="winGlazingKey"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.winGlazingLabel}
            </label>
            <select
              id="winGlazingKey"
              aria-label={T.winGlazingLabel}
              value={form.winGlazingKey}
              onChange={(e) =>
                onUpdateForm({ winGlazingKey: e.target.value as WinGlazingKey })
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {WIN_GLAZING_OPTIONS.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label[lang]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              aria-label={lang === 'bg' ? 'Свободен текст за дограма (по избор)' : 'Custom windows & glazing text (optional)'}
              value={form.winCustomText ?? ''}
              onChange={(e) => onUpdateForm({ winCustomText: e.target.value })}
              placeholder={
                lang === 'bg'
                  ? 'Свободен текст за дограма (оставете празно за горния избор)...'
                  : 'Custom windows & glazing text (leave empty to use selections above)...'
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Roof Colour Swatches (RAL 9005, 3009, 6005, 9002) */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {T.roofColorLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROOF_OPTIONS.map((r) => {
              const selected = form.roofColorKey === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  aria-label={r.label[lang]}
                  onClick={() =>
                    onUpdateForm({ roofColorKey: r.key as RoofColorKey })
                  }
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-1 ring-indigo-600 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-zinc-400 shrink-0"
                    style={{ backgroundColor: r.colorHex }}
                  />
                  <span className="truncate">{r.docVal[lang]}</span>
                </button>
              );
            })}
          </div>
          <input
            type="text"
            aria-label={lang === 'bg' ? 'Свободен текст за покрив (по избор)' : 'Custom roof text (optional)'}
            value={form.roofCustomText ?? ''}
            onChange={(e) => onUpdateForm({ roofCustomText: e.target.value })}
            placeholder={
              lang === 'bg'
                ? 'Свободен текст за покрив (оставете празно за горния избор)...'
                : 'Custom roof description (leave empty to use selection above)...'
            }
            className="mt-2 w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Facade, Wall Height & Ceiling Insulation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <label
              htmlFor="facadeKey"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.facadeTypeLabel}
            </label>
            <select
              id="facadeKey"
              aria-label={T.facadeTypeLabel}
              value={form.facadeKey}
              onChange={(e) =>
                onUpdateForm({ facadeKey: e.target.value as FacadeKey })
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {FACADE_OPTIONS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label[lang]}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label={lang === 'bg' ? 'Свободен текст за фасада (по избор)' : 'Custom facade text (optional)'}
              value={form.facadeCustomText ?? ''}
              onChange={(e) => onUpdateForm({ facadeCustomText: e.target.value })}
              placeholder={
                lang === 'bg'
                  ? 'Свободен текст за фасада (оставете празно за горния избор)...'
                  : 'Custom facade text (leave empty to use selection above)...'
              }
              className="mt-1.5 w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="wallHeightKey"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.wallHeightLabel}
            </label>
            <select
              id="wallHeightKey"
              aria-label={T.wallHeightLabel}
              value={form.wallHeightKey}
              onChange={(e) =>
                onUpdateForm({ wallHeightKey: e.target.value as WallHeightKey })
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {WALL_HEIGHT_OPTIONS.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label[lang]}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label={lang === 'bg' ? 'Свободен текст за височина на стените (по избор)' : 'Custom wall height text (optional)'}
              value={form.wallHeightCustomText ?? ''}
              onChange={(e) =>
                onUpdateForm({ wallHeightCustomText: e.target.value })
              }
              placeholder={
                lang === 'bg'
                  ? 'Свободен текст за височина (по избор)...'
                  : 'Custom wall height (optional)...'
              }
              className="mt-1.5 w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="ceilingInsulKey"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.ceilingInsulLabel}
            </label>
            <select
              id="ceilingInsulKey"
              aria-label={T.ceilingInsulLabel}
              value={form.ceilingInsulKey}
              onChange={(e) =>
                onUpdateForm({
                  ceilingInsulKey: e.target.value as CeilingInsulKey,
                })
              }
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {CEILING_INSUL_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label[lang]}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label={lang === 'bg' ? 'Свободен текст за изолация на таван (по избор)' : 'Custom ceiling insulation text (optional)'}
              value={form.ceilingCustomText ?? ''}
              onChange={(e) =>
                onUpdateForm({ ceilingCustomText: e.target.value })
              }
              placeholder={
                lang === 'bg'
                  ? 'Свободен текст за таван / изолация (оставете празно за горния избор)...'
                  : 'Custom ceiling insulation (leave empty to use selection above)...'
              }
              className="mt-1.5 w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Custom Wall Thicknesses (cm) — dynamically updates the technical spec below */}
          <div>
            <label
              htmlFor="extWallCm"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {lang === 'bg'
                ? 'Дебелина външни стени (см)'
                : 'External wall thickness (cm)'}
            </label>
            <input
              id="extWallCm"
              type="number"
              min={1}
              max={100}
              aria-label={
                lang === 'bg'
                  ? 'Дебелина външни стени (см)'
                  : 'External wall thickness (cm)'
              }
              value={
                form.extWallCm ?? getDefaultWallThicknessCm(form.system).ext
              }
              onChange={(e) => {
                const v = Number(e.target.value);
                onUpdateForm({ extWallCm: v > 0 ? v : undefined });
              }}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="intWallCm"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {lang === 'bg'
                ? 'Дебелина вътрешни стени (см)'
                : 'Internal wall thickness (cm)'}
            </label>
            <input
              id="intWallCm"
              type="number"
              min={1}
              max={100}
              aria-label={
                lang === 'bg'
                  ? 'Дебелина вътрешни стени (см)'
                  : 'Internal wall thickness (cm)'
              }
              value={
                form.intWallCm ?? getDefaultWallThicknessCm(form.system).int
              }
              onChange={(e) => {
                const v = Number(e.target.value);
                onUpdateForm({ intWallCm: v > 0 ? v : undefined });
              }}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Collapsible full override editor for every row in the bottom technical specification table */}
        <details className="mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-indigo-700 dark:text-indigo-300 select-none flex items-center justify-between">
            <span>
              {lang === 'bg'
                ? 'Детайлна техническа спецификация — ръчна редакция на всички редове (по избор)'
                : 'Detailed Technical Specification — edit any description row (optional)'}
            </span>
            {form.specOverrides &&
              Object.values(form.specOverrides).some((v) => v?.trim()) && (
                <span className="ms-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">
                  {lang === 'bg' ? 'Редактирано' : 'Customised'}
                </span>
              )}
          </summary>
          <div className="mt-3 space-y-2.5">
            {calc.specRows.map((row, idx) => {
              const key = String(idx);
              const customVal = form.specOverrides?.[key] ?? '';
              return (
                <div key={row.element} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`specOverride-${key}`}
                      className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      {row.element}
                    </label>
                    {customVal.trim() !== '' && (
                      <button
                        type="button"
                        aria-label={`Reset ${row.element}`}
                        onClick={() => {
                          const next = { ...(form.specOverrides ?? {}) };
                          delete next[key];
                          onUpdateForm({ specOverrides: next });
                        }}
                        className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        {lang === 'bg' ? 'Върни стандартното' : 'Reset'}
                      </button>
                    )}
                  </div>
                  <textarea
                    id={`specOverride-${key}`}
                    rows={2}
                    aria-label={row.element}
                    value={customVal}
                    onChange={(e) =>
                      onUpdateForm({
                        specOverrides: {
                          ...(form.specOverrides ?? {}),
                          [key]: e.target.value,
                        },
                      })
                    }
                    placeholder={row.spec}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              );
            })}
          </div>
        </details>

        {/* Extra Option, Discount & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <label
              htmlFor="extraOptionLabel"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.extraOptionLabel}
            </label>
            <input
              id="extraOptionLabel"
              type="text"
              aria-label={T.extraOptionLabel}
              value={form.extraOptionLabel}
              onChange={(e) =>
                onUpdateForm({ extraOptionLabel: e.target.value })
              }
              placeholder={T.extraOptionPh}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="extraOptionAmount"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.extraAmountLabel}
            </label>
            <input
              id="extraOptionAmount"
              type="number"
              min={0}
              aria-label={T.extraAmountLabel}
              value={form.extraOptionAmount || ''}
              onChange={(e) =>
                onUpdateForm({
                  extraOptionAmount: Math.max(0, Number(e.target.value) || 0),
                })
              }
              placeholder="0 €"
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="discountEur"
              className="block text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1"
            >
              {T.discountLabel}
            </label>
            <input
              id="discountEur"
              type="number"
              min={0}
              aria-label={T.discountLabel}
              value={form.discountEur || ''}
              onChange={(e) =>
                onUpdateForm({
                  discountEur: Math.max(0, Number(e.target.value) || 0),
                })
              }
              placeholder="0 €"
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-950 text-emerald-700 dark:text-emerald-300"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="customNotes"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              {T.customNotesLabel}
            </label>
            <input
              id="customNotes"
              type="text"
              aria-label={T.customNotesLabel}
              value={form.customNotes}
              onChange={(e) => onUpdateForm({ customNotes: e.target.value })}
              placeholder={T.customNotesPh}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* Instant Cost Summary Card */}
      <section
        aria-label={T.summaryCardTitle}
        className="rounded-xl bg-indigo-950 text-white p-4 shadow-md space-y-2"
      >
        <div className="flex items-center justify-between text-xs text-indigo-200">
          <span>{T.sumRow1}</span>
          <strong className="text-sm text-white">
            {formatEur(calc.contractStructureNet)}
          </strong>
        </div>
        {calc.hasTurnkey && (
          <div className="flex items-center justify-between text-xs text-indigo-200">
            <span>
              {T.sumRow2} ({calc.turnkeyName}):
            </span>
            <strong className="text-sm text-emerald-300">
              +{formatEur(calc.turnkeyTotal)}
            </strong>
          </div>
        )}
        {form.includeFoundation && (
          <div className="flex items-center justify-between text-xs text-amber-200/90">
            <span>
              {T.sumRow3} ({calc.effectiveFoundationArea} m² ×{' '}
              {calc.foundationUnitRate} €):
            </span>
            <strong className="text-sm text-amber-300">
              ≈ {formatEur(calc.foundationTotal)}
            </strong>
          </div>
        )}
        <div className="border-t border-indigo-800/80 pt-2 mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-200">{T.sumShellPlusFnd}</span>
            <span className="font-bold text-white text-sm">
              ≈ {formatEur(calc.structurePlusFoundationTotal)}
            </span>
          </div>
          {calc.hasTurnkey && (
            <div className="flex items-center justify-between text-xs bg-indigo-900/80 px-2.5 py-1.5 rounded-lg">
              <span className="font-semibold text-emerald-200">
                {T.sumGrandTurnkey}
              </span>
              <span className="font-extrabold text-emerald-300 text-base">
                ≈ {formatEur(calc.grandTotalWithTurnkey)}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
