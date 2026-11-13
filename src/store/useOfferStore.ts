'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATALOG_MODELS, DEFAULT_PRICING_CONFIG } from '@/lib/constants';
import {
  calculateOffer,
  generateOfferNumber,
  getOfferSequenceValue,
  setOfferSequenceValue,
} from '@/lib/pricingEngine';
import { BackupPayloadSchema } from '@/lib/schemas';
import {
  AppLang,
  OfferFormState,
  PricingConfig,
  SavedOffer,
  UserProfile,
} from '@/types/offer';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'admin-suleyman',
    name: 'Сюлейман Исмаил',
    pin: '123456',
    role: 'admin',
    phone: '+359 899 890085',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'agent-hasan',
    name: 'Хасан (Агент)',
    pin: '111111',
    role: 'agent',
    phone: '+359 887 604 360',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'agent-2',
    name: 'Търговски агент 2',
    pin: '222222',
    role: 'agent',
    phone: '',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export function createInitialFormState(lang: AppLang = 'bg'): OfferFormState {
  const today = new Date().toISOString().split('T')[0];
  return {
    lang,
    offerNo: generateOfferNumber(false),
    date: today,
    validityDays: 30,
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
  users: UserProfile[];
  currentUserId: string | null;
  setLang: (lang: AppLang) => void;
  loginWithPin: (pin: string) => {
    ok: boolean;
    user?: UserProfile;
    errorBg?: string;
    errorEn?: string;
  };
  logout: () => void;
  addOrUpdateUser: (
    user: Omit<UserProfile, 'id' | 'createdAt'> & { id?: string }
  ) => { ok: boolean; errorBg?: string; errorEn?: string };
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
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
      users: DEFAULT_USERS,
      currentUserId: null,

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

      loginWithPin: (pin) => {
        const cleanPin = (pin || '').trim();
        const { users } = get();
        const found = users.find((u) => u.pin === cleanPin);
        if (!found) {
          return {
            ok: false,
            errorBg: 'Невалиден 6-цифрен PIN код',
            errorEn: 'Invalid 6-digit PIN code',
          };
        }
        if (!found.active) {
          return {
            ok: false,
            errorBg: 'Този профил е деактивиран от администратора',
            errorEn: 'This profile has been deactivated by the administrator',
          };
        }
        set({ currentUserId: found.id });
        return { ok: true, user: found };
      },

      logout: () => set({ currentUserId: null }),

      addOrUpdateUser: (payload) => {
        const cleanPin = (payload.pin || '').trim();
        if (!/^\d{6}$/.test(cleanPin)) {
          return {
            ok: false,
            errorBg: 'PIN кодът трябва да бъде точно 6 цифри.',
            errorEn: 'PIN code must be exactly 6 digits.',
          };
        }
        const cleanName = (payload.name || '').trim();
        if (!cleanName) {
          return {
            ok: false,
            errorBg: 'Моля, въведете име на потребителя.',
            errorEn: 'Please enter a user name.',
          };
        }

        const { users } = get();
        const duplicatePin = users.find(
          (u) => u.pin === cleanPin && u.id !== payload.id
        );
        if (duplicatePin) {
          return {
            ok: false,
            errorBg: `Този PIN код вече се използва от ${duplicatePin.name}.`,
            errorEn: `This PIN code is already used by ${duplicatePin.name}.`,
          };
        }

        if (payload.id) {
          set({
            users: users.map((u) =>
              u.id === payload.id
                ? {
                    ...u,
                    name: cleanName,
                    pin: cleanPin,
                    role: payload.role,
                    phone: payload.phone || '',
                    active: payload.active,
                  }
                : u
            ),
          });
        } else {
          const newUser: UserProfile = {
            id: `user-${Date.now()}`,
            name: cleanName,
            pin: cleanPin,
            role: payload.role,
            phone: payload.phone || '',
            active: payload.active,
            createdAt: new Date().toISOString(),
          };
          set({ users: [...users, newUser] });
        }

        return { ok: true };
      },

      deleteUser: (id) =>
        set((state) => {
          const remaining = state.users.filter((u) => u.id !== id);
          // Always ensure at least one admin exists
          if (!remaining.some((u) => u.role === 'admin' && u.active)) {
            return state;
          }
          return {
            users: remaining,
            currentUserId:
              state.currentUserId === id ? null : state.currentUserId,
          };
        }),

      toggleUserActive: (id) =>
        set((state) => {
          const target = state.users.find((u) => u.id === id);
          if (!target) return state;
          // Prevent deactivating the last active admin
          if (target.role === 'admin' && target.active) {
            const otherActiveAdmins = state.users.filter(
              (u) => u.id !== id && u.role === 'admin' && u.active
            );
            if (otherActiveAdmins.length === 0) return state;
          }
          return {
            users: state.users.map((u) =>
              u.id === id ? { ...u, active: !u.active } : u
            ),
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
        const {
          form,
          pricingConfig,
          savedOffers,
          activeOfferId,
          users,
          currentUserId,
        } = get();
        const currentUser =
          users.find((u) => u.id === currentUserId) || users[0];

        const existingIndex = activeOfferId
          ? savedOffers.findIndex((o) => o.id === activeOfferId)
          : -1;

        // Ensure sequential offer number does not collide with an existing saved offer
        let finalOfferNo = form.offerNo;
        if (existingIndex < 0) {
          const duplicateNo = savedOffers.some(
            (o) => o.form.offerNo === finalOfferNo
          );
          if (duplicateNo) {
            finalOfferNo = generateOfferNumber(true);
          }
        }

        const finalForm: OfferFormState = {
          ...form,
          offerNo: finalOfferNo,
        };

        const calc = calculateOffer(finalForm, pricingConfig);
        const now = new Date().toISOString();

        const isCustomPrice =
          finalForm.structureRateOverride !== null ||
          finalForm.foundationRateOverride !== null ||
          finalForm.turnkeyRateOverride !== null ||
          finalForm.discountEur > 0 ||
          finalForm.extraOptionAmount > 0;

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
          createdByUserId:
            existingIndex >= 0 && savedOffers[existingIndex].createdByUserId
              ? savedOffers[existingIndex].createdByUserId
              : currentUser?.id || 'admin-suleyman',
          createdByName:
            existingIndex >= 0 && savedOffers[existingIndex].createdByName
              ? savedOffers[existingIndex].createdByName
              : currentUser?.name || 'Сюлейман Исмаил',
          createdByRole:
            existingIndex >= 0 && savedOffers[existingIndex].createdByRole
              ? savedOffers[existingIndex].createdByRole
              : currentUser?.role || 'admin',
          isCustomPrice,
          form: finalForm,
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
          form: finalForm,
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
        const { pricingConfig, savedOffers, users } = get();
        const payload = {
          version: 1 as const,
          exportedAt: new Date().toISOString(),
          pricingConfig,
          savedOffers,
          users,
          lastOfferSeq: getOfferSequenceValue(),
        };
        return JSON.stringify(payload, null, 2);
      },

      importBackupJson: (rawJson) => {
        const lang = get().form.lang || 'bg';
        try {
          const parsed = JSON.parse(rawJson);
          const validated = BackupPayloadSchema.safeParse(parsed);
          if (!validated.success) {
            return {
              ok: false,
              message:
                lang === 'en'
                  ? 'Invalid JSON backup format.'
                  : 'Невалиден формат на JSON резервно копие.',
            };
          }

          if (validated.data.lastOfferSeq) {
            setOfferSequenceValue(validated.data.lastOfferSeq);
          }

          set((state) => ({
            pricingConfig: validated.data.pricingConfig,
            savedOffers: validated.data.savedOffers,
            users: validated.data.users?.length
              ? validated.data.users
              : state.users,
          }));

          return {
            ok: true,
            message:
              lang === 'en'
                ? `Successfully restored ${validated.data.savedOffers.length} quotes, users and pricing tables.`
                : `Успешно възстановени ${validated.data.savedOffers.length} оферти, профили и ценови тарифи.`,
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
      name: 'flexi-home-oferta-storage-v3',
    }
  )
);
