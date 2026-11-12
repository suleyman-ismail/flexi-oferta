import { z } from 'zod';

export const TieredRatesSchema = z.object({
  upTo50: z.number().nonnegative(),
  from51To70: z.number().nonnegative(),
  from71To90: z.number().nonnegative(),
  from91To120: z.number().nonnegative(),
  over120: z.number().nonnegative(),
});

export const PricingConfigSchema = z.object({
  press_standard: z.object({
    floor1: TieredRatesSchema,
    floor2Default: z.number().nonnegative(),
    floor2Alt: z.number().nonnegative(),
  }),
  press_economy: z.object({
    flatRate: z.number().nonnegative(),
  }),
  steel_frame: z.object({
    floor1: TieredRatesSchema,
    floor2: z.number().nonnegative(),
  }),
  reinforced_metal: z.object({
    floor1: TieredRatesSchema,
    floor2: z.number().nonnegative(),
  }),
  foundationRate: z.number().nonnegative(),
  turnkeyRates: z.object({
    economy: z.number().nonnegative(),
    mid: z.number().nonnegative(),
    standard: z.number().nonnegative(),
    luxury_660: z.number().nonnegative(),
    luxury_680: z.number().nonnegative(),
  }),
});

export const OfferFormStateSchema = z.object({
  lang: z.enum(['bg', 'en']).default('bg'),
  offerNo: z.string().min(1),
  date: z.string().min(1),
  validityDays: z.number().int().positive(),
  clientName: z.string(),
  clientPhone: z.string().default(''),
  country: z.string().default('България'),
  region: z.string().default(''),
  location: z.string(),
  fullAddress: z.string().default(''),
  permitStatus: z.enum(['has', 'process', 'none']).default('has'),
  catalogModelId: z.string().default('e85'),
  modelCodeLabel: z.string().default('MK-1 · 85 m²'),
  system: z.enum([
    'press_standard',
    'press_economy',
    'steel_frame',
    'reinforced_metal',
  ]),
  floors: z.union([z.literal(1), z.literal(2)]),
  pressTwoFloorVariant: z.enum(['489', '515']).default('489'),
  areaRzp: z.number().positive(),
  includeFoundation: z.boolean(),
  foundationArea: z.number().nonnegative(),
  turnkeyPackage: z.enum([
    'none',
    'economy',
    'mid',
    'standard',
    'luxury_660',
    'luxury_680',
    'custom',
  ]),
  structureRateOverride: z.number().nonnegative().nullable(),
  foundationRateOverride: z.number().nonnegative().nullable(),
  turnkeyRateOverride: z.number().nonnegative().nullable(),
  roofColorKey: z.enum(['black', 'red', 'green', 'white']).default('black'),
  winColorKey: z.enum(['anthracite', 'oak', 'white']).default('anthracite'),
  winProfileKey: z
    .enum(['pvc_5ch', 'pvc_6ch', 'pvc_7ch', 'alu_thermal'])
    .default('pvc_5ch'),
  winGlazingKey: z
    .enum(['double', 'triple', 'double_frosted'])
    .default('double'),
  facadeKey: z
    .enum([
      'panel_smooth',
      'wood_siding',
      'wood_decor',
      'white_plaster',
      'insul_10cm',
      'etalbond',
    ])
    .default('panel_smooth'),
  wallHeightKey: z.enum(['250', '280', '300']).default('250'),
  ceilingInsulKey: z.enum(['80', '160']).default('80'),
  extraOptionLabel: z.string().default(''),
  extraOptionAmount: z.number().nonnegative().default(0),
  discountEur: z.number().nonnegative().default(0),
  customNotes: z.string().default(''),
});

export const SavedOfferSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  form: OfferFormStateSchema,
  summary: z.object({
    structureTotal: z.number(),
    turnkeyTotal: z.number(),
    foundationTotal: z.number(),
    grandTotal: z.number(),
  }),
});

export const BackupPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  pricingConfig: PricingConfigSchema,
  savedOffers: z.array(SavedOfferSchema),
});
