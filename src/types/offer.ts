export type AppLang = 'bg' | 'en';

export type UserRole = 'admin' | 'agent';

export interface UserProfile {
  id: string;
  name: string;
  pin: string; // 6-digit PIN e.g. "123456"
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export type SystemType =
  | 'press_standard'
  | 'press_economy'
  | 'steel_frame'
  | 'reinforced_metal';

export type FloorCount = 1 | 2;

export type TurnkeyPackageType =
  | 'none'
  | 'standard'
  | 'luxury_680'
  | 'custom';

export type RoofColorKey = 'black' | 'red' | 'green' | 'white';
export type WinColorKey = 'anthracite' | 'oak' | 'white';
export type WinProfileKey = 'pvc_5ch' | 'pvc_6ch' | 'pvc_7ch' | 'alu_thermal';
export type WinGlazingKey = 'double' | 'triple' | 'double_frosted';
export type FacadeKey =
  | 'panel_smooth'
  | 'wood_siding'
  | 'wood_decor'
  | 'white_plaster'
  | 'insul_10cm'
  | 'etalbond';
export type WallHeightKey = '250' | '280' | '300';
export type CeilingInsulKey = '80' | '160';
export type PermitStatusKey = 'has' | 'process' | 'none';

export interface TieredRates {
  upTo50: number;
  from51To70: number;
  from71To90: number;
  from91To120: number;
  over120: number;
}

export interface PricingConfig {
  press_standard: {
    floor1: TieredRates;
    floor2Default: number; // 489
    floor2Alt: number; // 515
  };
  press_economy: {
    flatRate: number; // 280
  };
  steel_frame: {
    floor1: TieredRates;
    floor2: number; // 600
  };
  reinforced_metal: {
    floor1: TieredRates;
    floor2: number; // 729
  };
  foundationRate: number; // 140
  turnkeyRates: {
    standard: number; // 420
    luxury_680: number; // 680
  };
}

export interface OfferFormState {
  lang: AppLang;
  offerNo: string; // Automatically generated sequentially e.g. "26-0101"
  date: string; // YYYY-MM-DD
  validityDays: number; // 15
  clientName: string;
  clientPhone: string;
  country: string;
  region: string;
  location: string;
  fullAddress: string;
  permitStatus: PermitStatusKey;
  catalogModelId: string; // e.g. "e72", "d128", or "custom"
  modelCodeLabel: string; // e.g. "MK-1 · 72 m²"
  system: SystemType;
  floors: FloorCount;
  pressTwoFloorVariant: '489' | '515';
  areaRzp: number; // РЗП m²
  includeFoundation: boolean;
  foundationArea: number; // Площ на основата (фундамент) m²
  turnkeyPackage: TurnkeyPackageType;
  // Manual overrides (both admin and agents can enter custom unit rates)
  structureRateOverride: number | null;
  foundationRateOverride: number | null;
  turnkeyRateOverride: number | null;
  // Website Architectural & Technical Selections
  roofColorKey: RoofColorKey;
  winColorKey: WinColorKey;
  winProfileKey: WinProfileKey;
  winGlazingKey: WinGlazingKey;
  facadeKey: FacadeKey;
  wallHeightKey: WallHeightKey;
  ceilingInsulKey: CeilingInsulKey;
  // Optional free-text overrides for any technical/architectural field
  systemCustomText?: string;
  roofCustomText?: string;
  winCustomText?: string;
  facadeCustomText?: string;
  wallHeightCustomText?: string;
  ceilingCustomText?: string;
  extraOptionLabel: string;
  extraOptionAmount: number;
  discountEur: number;
  customNotes: string;
}

export interface CalculatedOffer {
  structureUnitRate: number;
  structureTotal: number; // Base structure total
  extraOptionAmount: number;
  discountEur: number;
  contractStructureNet: number; // Договорна стойност (Kaba Yapı Sözleşme Bedeli - KDV dahil)
  hasTurnkey: boolean;
  turnkeyName: string;
  turnkeyUnitRate: number;
  turnkeyTotal: number;
  contractWithTurnkeyTotal: number; // Kaba Yapı + Anahtar Teslim
  effectiveFoundationArea: number;
  foundationUnitRate: number;
  foundationTotal: number;
  structurePlusFoundationTotal: number; // Yalnızca Kaba Yapı + Temel Toplamı
  grandTotalWithTurnkey: number; // Anahtar Teslim Paketi Dahil Genel Toplam
  paymentStages: {
    stage1_50: number;
    stage2_40: number;
    stage3_10: number;
  };
  resolvedLabels: {
    systemName: string;
    floorsLabel: string;
    roofLabel: string;
    winColorLabel: string;
    winFullLabel: string;
    facadeLabel: string;
    wallHeightLabel: string;
    ceilingLabel: string;
    permitLabel: string;
    locationFull: string;
  };
  includedScope: string[];
  excludedScope: string[];
  specRows: Array<{ element: string; spec: string }>;
}

export interface SavedOffer {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  createdByName?: string;
  createdByRole?: UserRole;
  isCustomPrice?: boolean;
  form: OfferFormState;
  summary: {
    structureTotal: number;
    turnkeyTotal: number;
    foundationTotal: number;
    grandTotal: number;
  };
}
