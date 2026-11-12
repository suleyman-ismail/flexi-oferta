import {
  AppLang,
  CeilingInsulKey,
  FacadeKey,
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

export const COMPANY_INFO = {
  brand: 'FLEXI HOME',
  website: 'flexi-home.eu',
  legalName: '„С 1 ТРЕЙД“ ЕООД',
  legalNameEn: '“S 1 TRADE” EOOD («С 1 ТРЕЙД» ЕООД)',
  eik: '208574942',
  vatNo: 'BG208574942',
  bankName: 'Пощенска банка',
  bankNameEn: 'Postbank (Пощенска банка)',
  iban: 'BG46BPB179421429170001',
  bic: 'BPBIBGSF',
  addressSofia:
    'бул. Александър Стамболийски 84, сграда Urban Model, ет. 10, офис 53, София 1303',
  addressSofiaEn:
    '84 Aleksandar Stamboliyski Blvd, Urban Model Bldg, fl. 10, office 53, Sofia 1303',
  addressBurgas: 'ул. Васил Априлов 16, ет. 2, офис 8, Бургас',
  addressBurgasEn: '16 Vasil Aprilov Str., fl. 2, office 8, Burgas',
  phones: ['+359 899 890085', '+359 887 604 360'],
  email: 'flexihome@abv.bg',
  currency: 'EUR',
  priceBasis: {
    bg: 'Производство, доставка и монтаж',
    en: 'Manufacturing, delivery and on-site assembly',
  },
  deliveryTerm: {
    bg: 'Срок за изпълнение: 30-40 дни след одобрени проекти и разрешение за строеж',
    en: 'Delivery & assembly time: 30-40 days after approved designs and building permit',
  },
  foundationDisclaimer: {
    bg: 'прогнозна стойност, уточнява се след оглед и геодезично заснемане — не е част от договорната стойност',
    en: 'indicative value, confirmed after site visit and geodetic survey — not part of the contract value',
  },
} as const;

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  press_standard: {
    floor1: {
      upTo50: 420,
      from51To70: 400,
      from71To90: 380,
      from91To120: 360,
      over120: 360,
    },
    floor2Default: 489,
    floor2Alt: 515,
  },
  press_economy: {
    flatRate: 280,
  },
  steel_frame: {
    floor1: {
      upTo50: 590,
      from51To70: 562,
      from71To90: 534,
      from91To120: 506,
      over120: 506,
    },
    floor2: 600,
  },
  reinforced_metal: {
    floor1: {
      upTo50: 750,
      from51To70: 714,
      from71To90: 679,
      from91To120: 643,
      over120: 643,
    },
    floor2: 729,
  },
  foundationRate: 140,
  turnkeyRates: {
    economy: 317,
    mid: 356,
    standard: 420,
    luxury_660: 660,
    luxury_680: 680,
  },
};

export interface CatalogModel {
  id: string;
  code: 'MK-1' | 'MK-2';
  area: number;
  floors: 1 | 2;
  bedrooms: number;
  footprint: number;
  summaryBg: string;
  summaryEn: string;
}

export const CATALOG_MODELS: CatalogModel[] = [
  // Single-Storey (Едноетажни MK-1)
  {
    id: 'e40',
    code: 'MK-1',
    area: 40,
    floors: 1,
    bedrooms: 1,
    footprint: 40,
    summaryBg: 'Дневна+кухня 19м², 1 спалня (10м²), баня+WC 4м², антре 2м², веранда 5м²',
    summaryEn: 'Living+kitchen 19m², 1 bedroom (10m²), bath+WC 4m², hall 2m², veranda 5m²',
  },
  {
    id: 'e49',
    code: 'MK-1',
    area: 49,
    floors: 1,
    bedrooms: 2,
    footprint: 49,
    summaryBg: 'Дневна+кухня 17м², 2 спални (2×10м²), баня+WC 5м², антре 2м², веранда 5м²',
    summaryEn: 'Living+kitchen 17m², 2 bedrooms (2×10m²), bath+WC 5m², hall 2m², veranda 5m²',
  },
  {
    id: 'e52',
    code: 'MK-1',
    area: 52,
    floors: 1,
    bedrooms: 2,
    footprint: 52,
    summaryBg: 'Дневна+кухня 20м², 2 спални (2×10м²), баня+WC 4м², антре 6м², веранда 2м²',
    summaryEn: 'Living+kitchen 20m², 2 bedrooms (2×10m²), bath+WC 4m², hall 6m², veranda 2m²',
  },
  {
    id: 'e62',
    code: 'MK-1',
    area: 62,
    floors: 1,
    bedrooms: 2,
    footprint: 62,
    summaryBg: 'Дневна 18м², кухня 7м², 2 спални (12+10м²), баня+WC 5м², антре 3м², веранда 7м²',
    summaryEn: 'Living 18m², kitchen 7m², 2 bedrooms (12+10m²), bath+WC 5m², hall 3m², veranda 7m²',
  },
  {
    id: 'e72',
    code: 'MK-1',
    area: 72,
    floors: 1,
    bedrooms: 2,
    footprint: 72,
    summaryBg: 'Дневна 17м², кухня 12м², 2 спални (12+15м²), баня+WC 5м², антре 7м², веранда 4м²',
    summaryEn: 'Living 17m², kitchen 12m², 2 bedrooms (12+15m²), bath+WC 5m², hall 7m², veranda 4m²',
  },
  {
    id: 'e81',
    code: 'MK-1',
    area: 81,
    floors: 1,
    bedrooms: 3,
    footprint: 81,
    summaryBg: 'Дневна 17м², кухня 6м², 3 спални (12+15+10м²), баня+WC 5м², антре 12м², веранда 4м²',
    summaryEn: 'Living 17m², kitchen 6m², 3 bedrooms (12+15+10m²), bath+WC 5m², hall 12m², veranda 4m²',
  },
  {
    id: 'e85',
    code: 'MK-1',
    area: 85,
    floors: 1,
    bedrooms: 2,
    footprint: 85,
    summaryBg: 'Дневна 19м², кухня 10м², 2 спални (10+15м²), баня+WC 6м², антре 11м², веранда 14м²',
    summaryEn: 'Living 19m², kitchen 10m², 2 bedrooms (10+15m²), bath+WC 6m², hall 11m², veranda 14m²',
  },
  {
    id: 'e92',
    code: 'MK-1',
    area: 92,
    floors: 1,
    bedrooms: 3,
    footprint: 92,
    summaryBg: 'Дневна 19м², кухня 10м², 3 спални (10+11+15м²), баня+WC 5м², антре 11м², 2 веранди',
    summaryEn: 'Living 19m², kitchen 10m², 3 bedrooms (10+11+15m²), bath+WC 5m², hall 11m², 2 verandas',
  },
  {
    id: 'e100',
    code: 'MK-1',
    area: 100,
    floors: 1,
    bedrooms: 2,
    footprint: 100,
    summaryBg: 'Дневна 29м², кухня 10м², 2 спални (2×15м²), баня+WC 5м², антре 10м², веранда 15м²',
    summaryEn: 'Living 29m², kitchen 10m², 2 bedrooms (2×15m²), bath+WC 5m², hall 10m², veranda 15m²',
  },
  {
    id: 'e103',
    code: 'MK-1',
    area: 103,
    floors: 1,
    bedrooms: 3,
    footprint: 103,
    summaryBg: 'Дневна 24м², кухня 12м², 3 спални (15+10+10м²), баня+WC 5м², антре 13м², веранда 14м²',
    summaryEn: 'Living 24m², kitchen 12m², 3 bedrooms (15+10+10m²), bath+WC 5m², hall 13m², veranda 14m²',
  },
  {
    id: 'e114',
    code: 'MK-1',
    area: 114,
    floors: 1,
    bedrooms: 3,
    footprint: 114,
    summaryBg: 'Дневна 25м², кухня 12м², 3 спални (15+17+14м²), баня+WC 6м², антре 11м², веранда 13м²',
    summaryEn: 'Living 25m², kitchen 12m², 3 bedrooms (15+17+14m²), bath+WC 6m², hall 11m², veranda 13m²',
  },
  {
    id: 'e131',
    code: 'MK-1',
    area: 131,
    floors: 1,
    bedrooms: 4,
    footprint: 131,
    summaryBg: 'Дневна 27м², кухня 12м², 4 спални (17+14+12+20м²), баня+WC 8м², отд. WC 3м², антре 18м²',
    summaryEn: 'Living 27m², kitchen 12m², 4 bedrooms (17+14+12+20m²), bath+WC 8m², WC 3m², hall 18m²',
  },
  {
    id: 'e149',
    code: 'MK-1',
    area: 149,
    floors: 1,
    bedrooms: 4,
    footprint: 149,
    summaryBg: 'Дневна 34м², кухня 12м², 4 спални (10+12+14+18м²), баня+WC 5м², WC 4м², веранда 22м²',
    summaryEn: 'Living 34m², kitchen 12m², 4 bedrooms (10+12+14+18m²), bath+WC 5m², WC 4m², veranda 22m²',
  },
  // Two-Storey (Двуетажни MK-2)
  {
    id: 'd90',
    code: 'MK-2',
    area: 90,
    floors: 2,
    bedrooms: 2,
    footprint: 45,
    summaryBg: 'Ет.1: Дневна+кухня 30м², антре, веранда | Ет.2: 2 спални (2×17м²), баня+WC, тераса',
    summaryEn: 'Fl.1: Living+kitchen 30m², hall, veranda | Fl.2: 2 bedrooms (2×17m²), bath+WC, terrace',
  },
  {
    id: 'd100',
    code: 'MK-2',
    area: 100,
    floors: 2,
    bedrooms: 2,
    footprint: 50,
    summaryBg: 'Ет.1: Дневна+кухня 32м², WC, веранда 7м² | Ет.2: 2 спални (2×15м²), баня+WC, тераса',
    summaryEn: 'Fl.1: Living+kitchen 32m², WC, veranda 7m² | Fl.2: 2 bedrooms (2×15m²), bath+WC, terrace',
  },
  {
    id: 'd101',
    code: 'MK-2',
    area: 101,
    floors: 2,
    bedrooms: 3,
    footprint: 51,
    summaryBg: 'Ет.1: Дневна 20м², кухня 6м², 1 спалня, WC, веранда 15м² | Ет.2: 2 спални (10+20м²), баня+WC',
    summaryEn: 'Fl.1: Living 20m², kitchen 6m², 1 bedroom, WC, veranda 15m² | Fl.2: 2 bedrooms (10+20m²), bath+WC',
  },
  {
    id: 'd128',
    code: 'MK-2',
    area: 128,
    floors: 2,
    bedrooms: 2,
    footprint: 64,
    summaryBg: 'Ет.1: Дневна 24м², кухня 15м², баня+WC, веранда 10м² | Ет.2: 2 спални (2×15м²), баня+WC, тераса 10м²',
    summaryEn: 'Fl.1: Living 24m², kitchen 15m², bath+WC, veranda 10m² | Fl.2: 2 bedrooms (2×15m²), bath+WC, terrace 10m²',
  },
  {
    id: 'd136',
    code: 'MK-2',
    area: 136,
    floors: 2,
    bedrooms: 3,
    footprint: 68,
    summaryBg: 'Ет.1: Дневна 28м², кухня 15м², баня+WC, веранда 9м² | Ет.2: 3 спални (12+18+13м²), баня+WC, тераса',
    summaryEn: 'Fl.1: Living 28m², kitchen 15m², bath+WC, veranda 9m² | Fl.2: 3 bedrooms (12+18+13m²), bath+WC, terrace',
  },
  {
    id: 'd145',
    code: 'MK-2',
    area: 145,
    floors: 2,
    bedrooms: 3,
    footprint: 73,
    summaryBg: 'Ет.1: Дневна+кухня 38м², 1 спалня 15м², баня+WC, веранда 9м² | Ет.2: 2 спални (12+20м²), баня+WC, WC, тераса',
    summaryEn: 'Fl.1: Living+kitchen 38m², 1 bedroom 15m², bath+WC, veranda 9m² | Fl.2: 2 bedrooms (12+20m²), bath+WC, WC, terrace',
  },
];

export const SYSTEM_META: Record<
  SystemType,
  {
    name: Record<AppLang, string>;
    shortDesc: Record<AppLang, string>;
    wallSpec: Record<AppLang, string>;
  }
> = {
  press_standard: {
    name: {
      bg: 'Прес панел стандарт',
      en: 'Press-Panel Standard (Прес панел стандарт)',
    },
    shortDesc: {
      bg: '16 см външни / 10 см вътрешни стени, EPS изолация, двулицев фиброцимент',
      en: '16 cm ext. / 10 cm int. walls, EPS insulation, double-faced fibre-cement',
    },
    wallSpec: {
      bg: 'Двулицеви фиброциментови панели + EPS изолация — Външни стени: 160 мм (10 мм фиброцимент + 140 мм EPS + 10 мм фиброцимент); Преградни стени: 100 мм (10 мм фиброцимент + 80 мм EPS + 10 мм фиброцимент)',
      en: 'Double-faced fibre-cement panels + EPS insulation — External walls: 160 mm (10 mm fibre-cement + 140 mm EPS + 10 mm fibre-cement); Internal walls: 100 mm (10 mm fibre-cement + 80 mm EPS + 10 mm fibre-cement)',
    },
  },
  press_economy: {
    name: {
      bg: 'Прес панел икономичен',
      en: 'Press-Panel Economy (Прес панел икономичен)',
    },
    shortDesc: {
      bg: 'Икономична серия прес панел (16 см външни / 10 см вътрешни, EPS)',
      en: 'Economy series press-panel system (16 cm ext. / 10 cm int. walls, EPS)',
    },
    wallSpec: {
      bg: 'Икономична серия двулицеви фиброциментови панели с EPS изолация — Външни стени: 160 мм; Вътрешни преградни стени: 100 мм',
      en: 'Economy series double-faced fibre-cement panels with EPS insulation — External walls: 160 mm; Internal partition walls: 100 mm',
    },
  },
  steel_frame: {
    name: {
      bg: 'Каркас (стоманена)',
      en: 'Steel Frame — Каркас (стоманена)',
    },
    shortDesc: {
      bg: '14 см външни / 8 см вътрешни стени, каменна вата, стоманен каркас',
      en: '14 cm ext. / 8 cm int. walls, rock wool insulation, steel frame structure',
    },
    wallSpec: {
      bg: 'Стоманена каркасна конструкция с двулицеви фиброциментови панели и каменна вата — Дебелина на външните стени: 14 см; Дебелина на вътрешните стени: 8 см',
      en: 'Steel frame structure with double-faced fibre-cement panels and rock wool — External wall thickness: 14 cm; Internal wall thickness: 8 cm',
    },
  },
  reinforced_metal: {
    name: {
      bg: 'Усилена метална',
      en: 'Reinforced Metal — Усилена метална',
    },
    shortDesc: {
      bg: '14 см външни / 8 см вътрешни стени, каменна вата, усилена поцинкована стомана',
      en: '14 cm ext. / 8 cm int. walls, rock wool, reinforced galvanised steel',
    },
    wallSpec: {
      bg: 'Усилена поцинкована метална конструкция, топло- и шумоизолирана с каменна вата (отвън фиброциментови плоскости, отвътре гипсокартон) — Външни стени: 14 см; Вътрешни стени: 8 см',
      en: 'Reinforced galvanised steel structure, thermally & acoustically insulated with rock wool (fibre-cement exterior, plasterboard interior) — External walls: 14 cm; Internal walls: 8 cm',
    },
  },
};

export const TURNKEY_META: Record<
  TurnkeyPackageType,
  {
    label: Record<AppLang, string>;
    docName: Record<AppLang, string>;
  }
> = {
  none: {
    label: {
      bg: 'Без пакет „До ключ“ (само етап „до тапа“)',
      en: 'None — Shell Stage Only („до тапа“)',
    },
    docName: {
      bg: 'Без пакет „До ключ“',
      en: 'None (Shell Stage)',
    },
  },
  economy: {
    label: {
      bg: 'Икономичен (+317 €/m²)',
      en: 'Economy / Икономичен (+317 €/m²)',
    },
    docName: {
      bg: 'Икономичен',
      en: 'Economy (Икономичен)',
    },
  },
  mid: {
    label: {
      bg: 'Среден клас (+356 €/m²)',
      en: 'Mid-Range / Среден клас (+356 €/m²)',
    },
    docName: {
      bg: 'Среден клас',
      en: 'Mid-Range (Среден клас)',
    },
  },
  standard: {
    label: {
      bg: 'Стандарт (+420 €/m²)',
      en: 'Standard / Стандарт (+420 €/m²)',
    },
    docName: {
      bg: 'Стандарт',
      en: 'Standard (Стандарт)',
    },
  },
  luxury_660: {
    label: {
      bg: 'Луксозен (+660 €/m²)',
      en: 'Luxury / Луксозен (+660 €/m²)',
    },
    docName: {
      bg: 'Луксозен',
      en: 'Luxury (Луксозен)',
    },
  },
  luxury_680: {
    label: {
      bg: 'Луксозен Плюс (+680 €/m²)',
      en: 'Luxury Plus / Луксозен (+680 €/m²)',
    },
    docName: {
      bg: 'Луксозен',
      en: 'Luxury Plus (Луксозен)',
    },
  },
  custom: {
    label: {
      bg: 'Индивидуален пакет (€/m²)',
      en: 'Custom Turnkey Rate (€/m²)',
    },
    docName: {
      bg: 'Индивидуален пакет',
      en: 'Custom Package',
    },
  },
};

export const ROOF_OPTIONS: Array<{
  key: RoofColorKey;
  colorHex: string;
  ral: string;
  label: Record<AppLang, string>;
  docVal: Record<AppLang, string>;
}> = [
  {
    key: 'black',
    colorHex: '#33373b',
    ral: 'RAL 9005',
    label: {
      bg: 'Антрацитно черен (Черен · RAL 9005)',
      en: 'Anthracite Black (Черен · RAL 9005)',
    },
    docVal: {
      bg: 'Черен (Антрацитно черен · RAL 9005)',
      en: 'Black (Anthracite Black · RAL 9005)',
    },
  },
  {
    key: 'red',
    colorHex: '#8d4136',
    ral: 'RAL 3009',
    label: {
      bg: 'Керемидено червен (Червен · RAL 3009)',
      en: 'Tile Red (Червен · RAL 3009)',
    },
    docVal: {
      bg: 'Червен (Керемидено червен · RAL 3009)',
      en: 'Red (Tile Red · RAL 3009)',
    },
  },
  {
    key: 'green',
    colorHex: '#2f5843',
    ral: 'RAL 6005',
    label: {
      bg: 'Горско зелен (Зелен · RAL 6005)',
      en: 'Forest Green (Зелен · RAL 6005)',
    },
    docVal: {
      bg: 'Зелен (Горско зелен · RAL 6005)',
      en: 'Green (Forest Green · RAL 6005)',
    },
  },
  {
    key: 'white',
    colorHex: '#e9eae8',
    ral: 'RAL 9002',
    label: {
      bg: 'Сиво-бял (Бял · RAL 9002)',
      en: 'Grey-White (Бял · RAL 9002)',
    },
    docVal: {
      bg: 'Бял (Сиво-бял · RAL 9002)',
      en: 'White (Grey-White · RAL 9002)',
    },
  },
];

export const WIN_COLOR_OPTIONS: Array<{
  key: WinColorKey;
  colorHex: string;
  ral: string;
  label: Record<AppLang, string>;
  docVal: Record<AppLang, string>;
}> = [
  {
    key: 'anthracite',
    colorHex: '#3a3f43',
    ral: 'RAL 7016',
    label: {
      bg: 'Антрацит (RAL 7016)',
      en: 'Anthracite Grey (Антрацит · RAL 7016)',
    },
    docVal: {
      bg: 'Антрацит (RAL 7016)',
      en: 'Anthracite (RAL 7016)',
    },
  },
  {
    key: 'oak',
    colorHex: '#96683f',
    ral: 'Golden Oak',
    label: {
      bg: 'Златен дъб (Дъб)',
      en: 'Golden Oak (Златен дъб)',
    },
    docVal: {
      bg: 'Дъб (Златен дъб)',
      en: 'Golden Oak (Дъб)',
    },
  },
  {
    key: 'white',
    colorHex: '#f5f4f1',
    ral: 'RAL 9016',
    label: {
      bg: 'Бял (RAL 9016)',
      en: 'Pure White (Бял · RAL 9016)',
    },
    docVal: {
      bg: 'Бял (RAL 9016)',
      en: 'White (RAL 9016)',
    },
  },
];

export const WIN_PROFILE_OPTIONS: Array<{
  key: WinProfileKey;
  label: Record<AppLang, string>;
}> = [
  {
    key: 'pvc_5ch',
    label: {
      bg: '5-камерна PVC дограма, 4 сезона (стандарт)',
      en: '5-chamber PVC joinery, 4-season (standard)',
    },
  },
  {
    key: 'pvc_6ch',
    label: {
      bg: '6-камерна PVC дограма, 4 сезона (по избор)',
      en: '6-chamber PVC joinery, 4-season (optional)',
    },
  },
  {
    key: 'pvc_7ch',
    label: {
      bg: '7-камерна PVC дограма, 4 сезона (по избор)',
      en: '7-chamber PVC joinery, 4-season (optional)',
    },
  },
  {
    key: 'alu_thermal',
    label: {
      bg: 'Алуминиева термоизолирана дограма (по избор)',
      en: 'Thermal-break aluminium joinery (optional)',
    },
  },
];

export const WIN_GLAZING_OPTIONS: Array<{
  key: WinGlazingKey;
  label: Record<AppLang, string>;
}> = [
  {
    key: 'double',
    label: {
      bg: 'Двоен стъклопакет (стандарт, 4 сезона)',
      en: 'Double glazing (standard, 4-season)',
    },
  },
  {
    key: 'triple',
    label: {
      bg: 'Троен стъклопакет (по избор, високоенергиен)',
      en: 'Triple glazing (optional, high-efficiency)',
    },
  },
  {
    key: 'double_frosted',
    label: {
      bg: 'Двоен стъклопакет + матирано стъкло по проект',
      en: 'Double glazing + frosted glass per project',
    },
  },
];

export const FACADE_OPTIONS: Array<{
  key: FacadeKey;
  label: Record<AppLang, string>;
  docVal: Record<AppLang, string>;
}> = [
  {
    key: 'panel_smooth',
    label: {
      bg: 'Фиброциментови панели — гладък (боядисан)',
      en: 'Fibre-cement panels — smooth (painted)',
    },
    docVal: {
      bg: 'Фиброциментови панели (гладък / боядисан)',
      en: 'Fibre-cement panels (smooth / painted)',
    },
  },
  {
    key: 'wood_siding',
    label: {
      bg: 'Дървесен сайдинг (формован във фиброцимента)',
      en: 'Wood siding (formed in fibre-cement)',
    },
    docVal: {
      bg: 'Дървесен сайдинг',
      en: 'Wood siding (Дървесен сайдинг)',
    },
  },
  {
    key: 'wood_decor',
    label: {
      bg: 'Дървесен декор (формован във фиброцимента)',
      en: 'Wood grain decor (formed in fibre-cement)',
    },
    docVal: {
      bg: 'Дървесен декор',
      en: 'Wood grain decor (Дървесен декор)',
    },
  },
  {
    key: 'white_plaster',
    label: {
      bg: 'Бяла мазилка — релеф',
      en: 'White render — textured relief',
    },
    docVal: {
      bg: 'Бяла мазилка',
      en: 'White render (Бяла мазилка)',
    },
  },
  {
    key: 'insul_10cm',
    label: {
      bg: 'Външна топлоизолация 10 см + силиконова мазилка (по избор)',
      en: '10 cm external thermal insulation + silicone plaster (optional)',
    },
    docVal: {
      bg: 'Външна топлоизолация 10 см със силиконова мазилка',
      en: '10 cm external thermal insulation with silicone plaster',
    },
  },
  {
    key: 'etalbond',
    label: {
      bg: 'Окачена фасада от еталбонд (по избор)',
      en: 'Etalbond / Alucobond curtain wall (optional)',
    },
    docVal: {
      bg: 'Окачена фасада от еталбонд',
      en: 'Etalbond curtain wall',
    },
  },
];

export const WALL_HEIGHT_OPTIONS: Array<{
  key: WallHeightKey;
  label: Record<AppLang, string>;
  docVal: Record<AppLang, string>;
}> = [
  {
    key: '250',
    label: {
      bg: '250 см (стандарт)',
      en: '250 cm (standard)',
    },
    docVal: { bg: '250 см (стандарт)', en: '250 cm (standard)' },
  },
  {
    key: '280',
    label: {
      bg: '280 см (по избор)',
      en: '280 cm (optional)',
    },
    docVal: { bg: '280 см (по избор)', en: '280 cm (optional)' },
  },
  {
    key: '300',
    label: {
      bg: '300 см (по избор)',
      en: '300 cm (optional)',
    },
    docVal: { bg: '300 см (по избор)', en: '300 cm (optional)' },
  },
];

export const CEILING_INSUL_OPTIONS: Array<{
  key: CeilingInsulKey;
  label: Record<AppLang, string>;
  docVal: Record<AppLang, string>;
}> = [
  {
    key: '80',
    label: {
      bg: '12 мм гипсокартон + 80 мм каменна вата (стандарт)',
      en: '12 mm plasterboard + 80 mm rock wool (standard)',
    },
    docVal: {
      bg: '12 мм гипсокартон + 80 мм каменна вата (стандарт)',
      en: '12 mm plasterboard + 80 mm rock wool (standard)',
    },
  },
  {
    key: '160',
    label: {
      bg: '12 мм гипсокартон + 160 мм каменна вата (по избор)',
      en: '12 mm plasterboard + 160 mm rock wool (optional)',
    },
    docVal: {
      bg: '12 мм гипсокартон + 160 мм каменна вата (по избор)',
      en: '12 mm plasterboard + 160 mm rock wool (optional)',
    },
  },
];

export const PERMIT_STATUS_OPTIONS: Array<{
  key: PermitStatusKey;
  label: Record<AppLang, string>;
}> = [
  {
    key: 'has',
    label: {
      bg: 'Имам разрешение за строеж',
      en: 'Building permit available',
    },
  },
  {
    key: 'process',
    label: {
      bg: 'В процес на издаване',
      en: 'Permit in progress',
    },
  },
  {
    key: 'none',
    label: {
      bg: 'Все още нямам (съдействие от Flexi Home)',
      en: 'Not yet (assistance from Flexi Home)',
    },
  },
];

export const BASE_INCLUDED_SCOPE: Record<AppLang, string[]> = {
  bg: [
    'Производство на конструкцията във фабрика',
    'Доставка до парцела на клиента',
    'Монтаж на място от специализиран екип',
    'Стенна система по избраната спецификация',
    'Покривна система с метални ферми, OSB, паромембрана, метални керемиди и улуци',
    'Таван с 12 мм гипсокартон и каменна вата',
    'PVC дограма (4 сезона)',
    'Външна блиндирана метална и вътрешни MDF врати с дървена каса',
    'Електрическа инсталация (скрит монтаж и ел. табло)',
    'ВиК инсталация (напълно монтирана до тапа)',
  ],
  en: [
    'Factory manufacturing of the structure',
    'Delivery to the customer’s plot',
    'On-site assembly by Flexi Home team',
    'Wall system as specified',
    'Roof system with galvanised trusses, OSB, vapour membrane, metal tiles and gutters',
    'Ceiling with 12 mm plasterboard and rock wool insulation',
    'PVC joinery (4-season)',
    'Armoured metal entrance door and interior MDF doors with wooden frame',
    'Electrical installation (concealed wiring and breaker panel)',
    'Plumbing installation (completed to shell stage)',
  ],
};

export const TURNKEY_FINISHING_ITEMS: Record<AppLang, string[]> = {
  bg: [
    'Външна топлоизолация',
    'Гипсокартон по стени и шпакловка',
    'Замазка на пода',
    'Настилки — ламинат, теракот, фаянс',
    'Финален монтаж на контакти, ключове и осветителни тела',
    'Вътрешно и външно боядисване',
    'Кухненско оборудване и санитария',
  ],
  en: [
    'External thermal insulation',
    'Wall plasterboard and skim coat',
    'Floor screed',
    'Floor and wall coverings — laminate, tiles, ceramics',
    'Final fitting of sockets, switches and light fixtures',
    'Interior and exterior painting',
    'Kitchen equipment and sanitary ware',
  ],
};

export const ALWAYS_EXCLUDED_ITEMS: Record<AppLang, string[]> = {
  bg: [
    'Проектна документация и разрешение за строеж',
    'Фундамент, изкопни работи и вертикална планировка',
    'Външни връзки към ел. мрежа, водопровод и канализация',
    'Подово отопление, слънчеви панели и други допълнителни работи по желание',
    'Отопление и климатизация',
  ],
  en: [
    'Design documentation and building permit',
    'Foundation, excavation and site levelling',
    'External connections to power grid, water supply and sewage',
    'Underfloor heating, solar panels and other optional works upon request',
    'Heating and air conditioning',
  ],
};

export const CUSTOMER_RESPONSIBILITY: Record<AppLang, string> = {
  bg: 'Клиентът осигурява подготвен и достъпен за тежкотоварен транспорт и кран парцел, фундамент, изпълнен по предоставената от изпълнителя схема, външните връзки към електрическата мрежа, водопровода и канализацията, както и необходимите разрешителни. Забавяне поради непреодолима сила или поради причини извън контрола на изпълнителя удължава срока за доставка и монтаж със съответното време.',
  en: 'The Customer provides a prepared plot accessible for heavy transport and a crane, a foundation built according to the layout scheme provided by the Contractor, external connections to the electricity grid, water supply and sewage, as well as the required permits. Any delay due to force majeure or reasons beyond the Contractor’s control extends the delivery and assembly period accordingly.',
};

export const UI_TEXT = {
  bg: {
    appSub: 'flexi-home.eu · „С 1 ТРЕЙД“ ЕООД — Официален генератор на оферти (4 стр. A4 PDF)',
    btnPricing: 'Ценови тарифи',
    btnHistory: 'Архив оферти',
    btnNewOffer: 'Нова оферта',
    btnSaveOffer: 'Запази офертата',
    btnDownloadPdf: 'Изтегли PDF (4 стр.)',
    btnGeneratingPdf: 'Генериране на PDF...',
    sec1Title: '1. Клиент, обект и автоматичен № (01 КЛИЕНТ И ОБЕКТ)',
    clientName: 'Име и фамилия на клиента',
    clientNamePh: 'напр. Иван Петров',
    clientPhone: 'Телефон на клиента',
    clientPhonePh: '+359 888 ...',
    country: 'Държава',
    region: 'Област / Община',
    location: 'Град / Село',
    locationPh: 'напр. гр. София, с. Бистрица',
    fullAddress: 'Точен адрес / УПИ парцел (по избор)',
    fullAddressPh: 'ул. ..., УПИ IV-120',
    offerNo: 'Оферта № (Автоматичен)',
    nextOfferNoBtn: 'Генерирай следващ №',
    date: 'Дата на издаване',
    validity: 'Валидност (дни)',
    permit: 'Разрешение за строеж',
    sec2Title: '2. Модел от сайта, Етажност, Система и Площ РЗП (До тапа)',
    editTariffsLink: 'Редакция на тарифите',
    floorsLabel: 'Етажност на сградата',
    floor1Btn: '1 Етаж (Едноетажна · MK-1)',
    floor2Btn: '2 Етажа (Двуетажна · MK-2)',
    catalogModelsLabel: 'Модели от каталога flexi-home.eu (кликнете за зареждане):',
    customModelBtn: 'Индивидуален проект (по размер)',
    bedroomsUnit: 'спални',
    areaRzpLabel: 'Обща застроена площ — РЗП (m²)',
    autoTierRate: 'Автоматична тарифна цена:',
    structureRateBoxTitle: 'Единична цена за груб строеж „до тапа“ (€/m²)',
    manualOverrideBadge: 'Ръчна цена',
    contractValueText: 'Договорна стойност (с вкл. 20% ДДС):',
    press2FloorTariff: 'Тарифа за 2 етажа Прес панел:',
    sec3Title: '3. Субасман / Фундамент (Фундамент — прогнозна стойност)',
    includeFoundationCheck: 'Включи фундамент',
    twoFloorRuleAlert:
      'Активно правило за 2 етажа: Площта на фундамента не се умножава по общото РЗП, а по отделно въведената „Площ на основата (m²)“ по-долу.',
    foundationAreaLabel: 'Площ на основата / стъпка на фундамента (m²)',
    foundationRateLabel: 'Ед. цена за фундамент (€/m²) — Стандарт:',
    foundationEstTotal: 'Прогнозна сума за фундамент',
    foundationExcludedMsg: 'Фундаментът е изключен от калкулацията (изпълнява се от клиента).',
    sec4Title: '4. Допълнителен пакет „До ключ“ (По избор)',
    scopeUpdatedBadge: 'Стр. 4 Обхват е обновен автоматично',
    turnkeyRateBoxTitle: 'Допълнителен пакет „До ключ“',
    turnkeyExtraSum: 'Сума за пакета',
    sec5Title: '5. Архитектурни детайли от уебсайта (Прозорци, Покрив, Фасада, Таван)',
    roofColorLabel: 'Цвят на покрива (Метални керемиди RAL)',
    winColorLabel: 'Цвят на дограмата (Прозорци)',
    winProfileLabel: 'Профил на дограмата (Камери / Материал)',
    winGlazingLabel: 'Стъклопакет',
    facadeTypeLabel: 'Фасада и външна облицовка',
    wallHeightLabel: 'Височина на стените',
    ceilingInsulLabel: 'Таван и изолация',
    extraOptionLabel: 'Допълнителна опция / Транспорт / Веранда (по избор)',
    extraOptionPh: 'напр. Веранда / Допълнителна опция',
    extraAmountLabel: 'Сума за опция (€)',
    discountLabel: 'Индивидуална отстъпка (€)',
    customNotesLabel: 'Допълнителни бележки към офертата (показва се на Стр. 2)',
    customNotesPh: 'напр. Включено пълно съдействие за документация...',
    summaryCardTitle: 'Обобщение на цената',
    sumRow1: '1. Договорна стойност (груб строеж „до тапа“):',
    sumRow2: '2. Допълнителен пакет „До ключ“:',
    sumRow3: '3. Прогнозен фундамент:',
    sumShellPlusFnd: 'Общо (Само груб строеж „до тапа“ + Фундамент):',
    sumGrandTurnkey: 'Обща сума с пакет „До ключ“ + Фундамент:',
    previewBarTitle: 'Преглед на официалната оферта (4 страници A4)',
    tabAll: 'Всички (1–4)',
    tabP1: 'Стр. 1 (01–02)',
    tabP2: 'Стр. 2 (03–04)',
    tabP3: 'Стр. 3 (05)',
    tabP4: 'Стр. 4 (06–07)',
  },
  en: {
    appSub: 'flexi-home.eu · “S 1 TRADE” EOOD — Official Quote & 4-Page A4 PDF Studio',
    btnPricing: 'Unit Price Settings',
    btnHistory: 'Saved Quotes',
    btnNewOffer: 'New Quote',
    btnSaveOffer: 'Save Quote',
    btnDownloadPdf: 'Download PDF (4 Pages)',
    btnGeneratingPdf: 'Generating PDF...',
    sec1Title: '1. Client, Project Location & Auto Quote No (01 CLIENT & PROJECT)',
    clientName: 'Client Full Name',
    clientNamePh: 'e.g. Ivan Petrov / John Smith',
    clientPhone: 'Client Phone',
    clientPhonePh: '+359 888 ...',
    country: 'Country',
    region: 'Region / Municipality',
    location: 'City / Town / Village',
    locationPh: 'e.g. Sofia, Bistritsa / Burgas',
    fullAddress: 'Exact Plot Address / Cadastre ID (optional)',
    fullAddressPh: 'Street, Plot UPI IV-120',
    offerNo: 'Offer No (Auto-Generated)',
    nextOfferNoBtn: 'Generate Next No',
    date: 'Issue Date',
    validity: 'Validity (days)',
    permit: 'Building Permit Status',
    sec2Title: '2. Website Catalogue Model, Storeys, System & Built Area RZP',
    editTariffsLink: 'Edit Tariff Table',
    floorsLabel: 'Number of Storeys',
    floor1Btn: '1 Storey (Single-Storey · MK-1)',
    floor2Btn: '2 Storeys (Two-Storey · MK-2)',
    catalogModelsLabel: 'flexi-home.eu Catalogue Models (click to load):',
    customModelBtn: 'Custom Project (Manual Area)',
    bedroomsUnit: 'bedrooms',
    areaRzpLabel: 'Total Built-up Area — RZP (m²)',
    autoTierRate: 'Automatic tier rate:',
    structureRateBoxTitle: 'Shell Structure Unit Price (€/m²)',
    manualOverrideBadge: 'Manual Override',
    contractValueText: 'Contract Value (incl. 20% VAT):',
    press2FloorTariff: '2-Storey Press-Panel Rate:',
    sec3Title: '3. Sub-base / Foundation (Indicative Value)',
    includeFoundationCheck: 'Include Foundation',
    twoFloorRuleAlert:
      '2-Storey Rule Active: Foundation area is multiplied by the separate “Foundation Footprint Area (m²)” below rather than total RZP.',
    foundationAreaLabel: 'Foundation Footprint Area (m²)',
    foundationRateLabel: 'Foundation Unit Rate (€/m²) — Default:',
    foundationEstTotal: 'Indicative Foundation Total',
    foundationExcludedMsg: 'Foundation is excluded from the quote (built by the client).',
    sec4Title: '4. Separate Turnkey Finishing Package (Optional)',
    scopeUpdatedBadge: 'Page 4 Scope Auto-Updated',
    turnkeyRateBoxTitle: 'Additional Turnkey Package',
    turnkeyExtraSum: 'Package Amount',
    sec5Title: '5. Website Architectural Options (Windows, Roof, Facade, Ceiling)',
    roofColorLabel: 'Roof Tile Colour (Metal Tiles RAL)',
    winColorLabel: 'Window / Joinery Colour',
    winProfileLabel: 'Window Joinery Profile (Chambers / Material)',
    winGlazingLabel: 'Window Glazing',
    facadeTypeLabel: 'Facade & Exterior Finish',
    wallHeightLabel: 'Wall Height',
    ceilingInsulLabel: 'Ceiling & Rock Wool Insulation',
    extraOptionLabel: 'Additional Option / Veranda / Transport (optional)',
    extraOptionPh: 'e.g. Veranda / Custom option',
    extraAmountLabel: 'Extra Amount (€)',
    discountLabel: 'Special Client Discount (€)',
    customNotesLabel: 'Additional Offer Notes (displayed on Page 2)',
    customNotesPh: 'e.g. Includes full assistance with project documentation...',
    summaryCardTitle: 'Price Summary',
    sumRow1: '1. Shell Structure Contract Value:',
    sumRow2: '2. Separate Turnkey Package:',
    sumRow3: '3. Indicative Foundation:',
    sumShellPlusFnd: 'Total (Shell Structure + Foundation Only):',
    sumGrandTurnkey: 'Grand Total incl. Turnkey Package + Foundation:',
    previewBarTitle: 'Live 4-Page A4 Official Document Preview',
    tabAll: 'All Pages (1–4)',
    tabP1: 'Page 1 (01–02)',
    tabP2: 'Page 2 (03–04)',
    tabP3: 'Page 3 (05)',
    tabP4: 'Page 4 (06–07)',
  },
} as const;
