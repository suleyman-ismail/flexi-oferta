'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATALOG_MODELS, DEFAULT_PRICING_CONFIG } from '@/lib/constants';
import { calculateOffer, generateOfferNumber } from '@/lib/pricingEngine';
import { BackupPayloadSchema } from '@/lib/schemas';
import {
  AppLang,
  OfferFormState,
  PricingConfig,
  SavedOffer,
} from '@/types/offer';

export function createInitialFormState(lang: AppLang = 'bg'): OfferFormState {
  const today = new Date().toISOString().split('T')[0];
  return {
    lang,
    offerNo: generateOfferNumber(false),
    date: today,
    validityDays: 15,
    clientName: 'Иван Петров',
    clientPhone: '+359 888 450 120',
    country: lang === 'en' ? 'Bulgaria' : 'България',
    region: lang === 'en' ? 'Sofia' : 'София',
    location: lang === 'en' ? 'Sofia, Bistritsa' : 'гр. София, с. Бистрица',
    fullAddress: '',
    permitStatus: 'has',
    catalogModelId: 'e85',
    modelCodeLabel: 'MK-1 · 85 m² (2 спални)',
    system: 'press_standard',
    floors: 1,
    pressTwoFloorVariant: '489',
    areaRzp: 85,
    includeFoundation: true,
    foundationArea: 85,
    turnkeyPackage: 'none',
    structureRateOverride: null,
    foundationRateOverride: null,
    turnkeyRateOverride: null,
    roofColorKey: 'black',
    winColorKey: 'anthracite',
    winProfileKey: 'pvc_5ch',
    winGlazingKey: 'double',
    facadeKey: 'panel_smooth',
    wallHeightKey: '250',
    ceilingInsulKey: '80',
    extraOptionLabel: '',
    extraOptionAmount: 0,
    discountEur: 0,
    customNotes: '',
  };
}

interface OfferStoreState {
  form: OfferFormState;
  pricingConfig: PricingConfig;
  savedOffers: SavedOffer[];
  activeOfferId: string | null;
  setLang: (lang: AppLang) => void;
  selectCatalogModel: (modelId: string) => void;
  updateForm: (patch: Partial<OfferFormState>) => void;
  resetNewOffer: () => void;
  updatePricingConfig: (config: PricingConfig) => void;
  resetPricingConfig: () => void;
  saveCurrentOffer: () => SavedOffer;
  loadOfferForRevision: (id: string, asCopy?: boolean) => void;
  deleteSavedOffer: (id: string) => void;
  exportBackupJson: () => string;
  importBackupJson: (rawJson: string) => { ok: boolean; message: string };
}

export const useOfferStore = create<OfferStoreState>()(
  persist(
    (set, get) => ({
      form: createInitialFormState('bg'),
      pricingConfig: DEFAULT_PRICING_CONFIG,
      savedOffers: [],
      activeOfferId: null,

      setLang: (lang) =>
        set((state) => {
          const prev = state.form;
          const nextCountry =
            prev.country === 'България' && lang === 'en'
              ? 'Bulgaria'
              : prev.country === 'Bulgaria' && lang === 'bg'
              ? 'България'
              : prev.country;

          const matchedModel = CATALOG_MODELS.find(
            (m) => m.id === prev.catalogModelId
          );
          const nextModelLabel = matchedModel
            ? `${matchedModel.code} · ${matchedModel.area} m² (${matchedModel.bedrooms} ${
                lang === 'en' ? 'bedrooms' : 'спални'
              })`
            : prev.modelCodeLabel;

          return {
            form: {
              ...prev,
              lang,
              country: nextCountry,
              modelCodeLabel: nextModelLabel,
            },
          };
        }),

      selectCatalogModel: (modelId) =>
        set((state) => {
          const found = CATALOG_MODELS.find((m) => m.id === modelId);
          if (!found) {
            return {
              form: {
                ...state.form,
                catalogModelId: 'custom',
                modelCodeLabel:
                  state.form.lang === 'en'
                    ? 'Custom Project'
                    : 'Индивидуален проект',
              },
            };
          }
          const lang = state.form.lang || 'bg';
          return {
            form: {
              ...state.form,
              catalogModelId: found.id,
              floors: found.floors,
              areaRzp: found.area,
              foundationArea: found.footprint,
              structureRateOverride: null,
              modelCodeLabel: `${found.code} · ${found.area} m² (${found.bedrooms} ${
                lang === 'en' ? 'bedrooms' : 'спални'
              })`,
            },
          };
        }),

      updateForm: (patch) =>
        set((state) => {
          const nextForm = { ...state.form, ...patch };

          if (
            patch.areaRzp !== undefined &&
            nextForm.floors === 1 &&
            state.form.foundationArea === state.form.areaRzp
          ) {
            nextForm.foundationArea = patch.areaRzp;
          }
          if (patch.floors === 1 && state.form.floors === 2) {
            nextForm.foundationArea = nextForm.areaRzp;
          }
          if (patch.floors === 2 && state.form.floors === 1) {
            if (state.form.foundationArea === state.form.areaRzp) {
              nextForm.foundationArea = Math.max(
                35,
                Math.round(nextForm.areaRzp * 0.5)
              );
            }
          }

          return { form: nextForm };
        }),

      resetNewOffer: () =>
        set((state) => ({
          form: {
            ...createInitialFormState(state.form.lang),
            offerNo: generateOfferNumber(true),
            clientName: '',
            clientPhone: '',
            location: '',
            fullAddress: '',
          },
          activeOfferId: null,
        })),

      updatePricingConfig: (config) => set({ pricingConfig: config }),

      resetPricingConfig: () =>
        set({ pricingConfig: DEFAULT_PRICING_CONFIG }),

      saveCurrentOffer: () => {
        const { form, pricingConfig, savedOffers, activeOfferId } = get();
        const calc = calculateOffer(form, pricingConfig);
        const now = new Date().toISOString();

        const existingIndex = activeOfferId
          ? savedOffers.findIndex((o) => o.id === activeOfferId)
          : -1;

        const savedRecord: SavedOffer = {
          id:
            existingIndex >= 0 && activeOfferId
              ? activeOfferId
              : `oferta-${Date.now()}`,
          createdAt:
            existingIndex >= 0
              ? savedOffers[existingIndex].createdAt
              : now,
          updatedAt: now,
          form: { ...form },
          summary: {
            structureTotal: calc.contractStructureNet,
            turnkeyTotal: calc.turnkeyTotal,
            foundationTotal: calc.foundationTotal,
            grandTotal: calc.grandTotalWithTurnkey,
          },
        };

        const nextList =
          existingIndex >= 0
            ? savedOffers.map((item, idx) =>
                idx === existingIndex ? savedRecord : item
              )
            : [savedRecord, ...savedOffers];

        set({
          savedOffers: nextList,
          activeOfferId: savedRecord.id,
        });

        return savedRecord;
      },

      loadOfferForRevision: (id, asCopy = false) => {
        const { savedOffers } = get();
        const found = savedOffers.find((o) => o.id === id);
        if (!found) return;

        if (asCopy) {
          const today = new Date().toISOString().split('T')[0];
          set({
            form: {
              ...found.form,
              offerNo: generateOfferNumber(true),
              date: today,
            },
            activeOfferId: null,
          });
        } else {
          set({
            form: { ...found.form },
            activeOfferId: found.id,
          });
        }
      },

      deleteSavedOffer: (id) =>
        set((state) => ({
          savedOffers: state.savedOffers.filter((o) => o.id !== id),
          activeOfferId:
            state.activeOfferId === id ? null : state.activeOfferId,
        })),

      exportBackupJson: () => {
        const { pricingConfig, savedOffers } = get();
        const payload = {
          version: 1 as const,
          exportedAt: new Date().toISOString(),
          pricingConfig,
          savedOffers,
        };
        return JSON.stringify(payload, null, 2);
      },

      importBackupJson: (rawJson: string) => {
        const lang = get().form.lang || 'bg';
        try {
          const parsedJson = JSON.parse(rawJson);
          const validated = BackupPayloadSchema.safeParse(parsedJson);
          if (!validated.success) {
            return {
              ok: false,
              message:
                lang === 'en'
                  ? 'Invalid backup file format. Please select a valid Flexi Home JSON backup.'
                  : 'Невалиден формат на файла. Моля, изберете валиден JSON архив на Flexi Home.',
            };
          }
          set({
            pricingConfig: validated.data.pricingConfig,
            savedOffers: validated.data.savedOffers,
          });
          return {
            ok: true,
            message:
              lang === 'en'
                ? `${validated.data.savedOffers.length} quotes and unit price settings restored.`
                : `Успешно възстановени ${validated.data.savedOffers.length} оферти и ценови тарифи.`,
          };
        } catch {
          return {
            ok: false,
            message:
              lang === 'en'
                ? 'Could not read JSON file.'
                : 'JSON файлът не може да бъде прочетен.',
          };
        }
      },
    }),
    {
      name: 'flexi-home-oferta-storage-v2',
    }
  )
);
