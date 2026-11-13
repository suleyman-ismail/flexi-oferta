import {
  ALWAYS_EXCLUDED_ITEMS,
  CEILING_INSUL_OPTIONS,
  FACADE_OPTIONS,
  PERMIT_STATUS_OPTIONS,
  ROOF_OPTIONS,
  SYSTEM_META,
  TURNKEY_FINISHING_ITEMS,
  TURNKEY_META,
  WALL_HEIGHT_OPTIONS,
  WIN_COLOR_OPTIONS,
  WIN_GLAZING_OPTIONS,
  WIN_PROFILE_OPTIONS,
} from './constants';
import {
  CalculatedOffer,
  OfferFormState,
  PricingConfig,
  TieredRates,
} from '@/types/offer';

export function getTieredRate(area: number, tiers: TieredRates): number {
  if (area <= 50) return tiers.upTo50;
  if (area <= 70) return tiers.from51To70;
  if (area <= 90) return tiers.from71To90;
  if (area <= 120) return tiers.from91To120;
  return tiers.over120;
}

export function getBaseStructureUnitRate(
  form: Pick<
    OfferFormState,
    'system' | 'floors' | 'areaRzp' | 'pressTwoFloorVariant'
  >,
  config: PricingConfig
): number {
  const { system, floors, areaRzp, pressTwoFloorVariant } = form;

  if (system === 'press_economy') {
    return config.press_economy.flatRate;
  }

  if (system === 'press_standard') {
    if (floors === 2) {
      return pressTwoFloorVariant === '515'
        ? config.press_standard.floor2Alt
        : config.press_standard.floor2Default;
    }
    return getTieredRate(areaRzp, config.press_standard.floor1);
  }

  if (system === 'steel_frame') {
    if (floors === 2) {
      return config.steel_frame.floor2;
    }
    return getTieredRate(areaRzp, config.steel_frame.floor1);
  }

  // reinforced_metal
  if (floors === 2) {
    return config.reinforced_metal.floor2;
  }
  return getTieredRate(areaRzp, config.reinforced_metal.floor1);
}

export function getBaseTurnkeyUnitRate(
  form: Pick<OfferFormState, 'turnkeyPackage'>,
  config: PricingConfig
): number {
  switch (form.turnkeyPackage) {
    case 'none':
      return 0;
    case 'standard':
      return config.turnkeyRates.standard;
    case 'luxury_680':
      return config.turnkeyRates.luxury_680;
    case 'custom':
      return 420;
  }
}

export function resolveOptionLabels(form: OfferFormState) {
  const lang = form.lang || 'bg';
  const sysMeta = SYSTEM_META[form.system];
  const roofObj =
    ROOF_OPTIONS.find((r) => r.key === form.roofColorKey) || ROOF_OPTIONS[0];
  const winColorObj =
    WIN_COLOR_OPTIONS.find((w) => w.key === form.winColorKey) ||
    WIN_COLOR_OPTIONS[0];
  const winProfObj =
    WIN_PROFILE_OPTIONS.find((p) => p.key === form.winProfileKey) ||
    WIN_PROFILE_OPTIONS[0];
  const winGlazeObj =
    WIN_GLAZING_OPTIONS.find((g) => g.key === form.winGlazingKey) ||
    WIN_GLAZING_OPTIONS[0];
  const facadeObj =
    FACADE_OPTIONS.find((f) => f.key === form.facadeKey) || FACADE_OPTIONS[0];
  const wallHObj =
    WALL_HEIGHT_OPTIONS.find((h) => h.key === form.wallHeightKey) ||
    WALL_HEIGHT_OPTIONS[0];
  const ceilingObj =
    CEILING_INSUL_OPTIONS.find((c) => c.key === form.ceilingInsulKey) ||
    CEILING_INSUL_OPTIONS[0];
  const permitObj =
    PERMIT_STATUS_OPTIONS.find((p) => p.key === form.permitStatus) ||
    PERMIT_STATUS_OPTIONS[0];

  const baseFloors =
    form.floors === 2
      ? lang === 'en'
        ? 'Two-Storey (2 storeys)'
        : 'Двуетажна (2 етажа)'
      : lang === 'en'
      ? 'Single-Storey (1 storey)'
      : 'Едноетажна (1 етаж)';

  const floorsLabel = form.modelCodeLabel
    ? `${baseFloors} · ${form.modelCodeLabel}`
    : baseFloors;

  const locParts = [
    form.location,
    form.region,
    form.country,
    form.fullAddress ? `(${form.fullAddress})` : '',
  ]
    .map((s) => (s || '').trim())
    .filter(Boolean);

  return {
    systemName: form.systemCustomText?.trim() || sysMeta.name[lang],
    floorsLabel,
    roofLabel: form.roofCustomText?.trim() || roofObj.docVal[lang],
    winColorLabel: winColorObj.docVal[lang],
    winFullLabel:
      form.winCustomText?.trim() ||
      `${winColorObj.docVal[lang]} · ${winProfObj.label[lang]} · ${winGlazeObj.label[lang]}`,
    facadeLabel: form.facadeCustomText?.trim() || facadeObj.docVal[lang],
    wallHeightLabel: (() => {
      const raw = form.wallHeightCustomText?.trim();
      if (!raw) return wallHObj.docVal[lang];
      return /^\d+([.,]\d+)?$/.test(raw)
        ? `${raw} ${lang === 'bg' ? 'см' : 'cm'}`
        : raw;
    })(),
    ceilingLabel:
      form.ceilingCustomText?.trim() || ceilingObj.docVal[lang],
    permitLabel: permitObj.label[lang],
    locationFull: locParts.join(', ') || '—',
  };
}

export function getDefaultWallThicknessCm(system: OfferFormState['system']): {
  ext: number;
  int: number;
} {
  return system === 'press_standard' || system === 'press_economy'
    ? { ext: 16, int: 10 }
    : { ext: 14, int: 8 };
}

function buildDynamicWallSpec(
  form: OfferFormState,
  lang: 'bg' | 'en'
): string {
  const defaults = getDefaultWallThicknessCm(form.system);
  const extCm =
    form.extWallCm && form.extWallCm > 0 ? form.extWallCm : defaults.ext;
  const intCm =
    form.intWallCm && form.intWallCm > 0 ? form.intWallCm : defaults.int;
  const extMm = Math.round(extCm * 10);
  const intMm = Math.round(intCm * 10);

  if (lang === 'en') {
    if (form.system === 'press_standard') {
      const extCore = extMm > 20 ? ` (10 mm fibre-cement + ${extMm - 20} mm EPS + 10 mm fibre-cement)` : '';
      const intCore = intMm > 20 ? ` (10 mm fibre-cement + ${intMm - 20} mm EPS + 10 mm fibre-cement)` : '';
      return `Double-faced fibre-cement panels + EPS insulation — External walls: ${extCm} cm (${extMm} mm)${extCore}; Internal walls: ${intCm} cm (${intMm} mm)${intCore}`;
    }
    if (form.system === 'press_economy') {
      return `Economy series double-faced fibre-cement panels with EPS insulation — External walls: ${extCm} cm (${extMm} mm); Internal partition walls: ${intCm} cm (${intMm} mm)`;
    }
    if (form.system === 'steel_frame') {
      return `Steel frame structure with double-faced fibre-cement panels and rock wool — External wall thickness: ${extCm} cm; Internal wall thickness: ${intCm} cm`;
    }
    return `Reinforced galvanised steel structure, thermally & acoustically insulated with rock wool (fibre-cement exterior, plasterboard interior) — External walls: ${extCm} cm; Internal walls: ${intCm} cm`;
  }

  if (form.system === 'press_standard') {
    const extCore = extMm > 20 ? ` (10 мм фиброцимент + ${extMm - 20} мм EPS + 10 мм фиброцимент)` : '';
    const intCore = intMm > 20 ? ` (10 мм фиброцимент + ${intMm - 20} мм EPS + 10 мм фиброцимент)` : '';
    return `Двулицеви фиброциментови панели + EPS изолация — Външни стени: ${extCm} см (${extMm} мм)${extCore}; Преградни стени: ${intCm} см (${intMm} мм)${intCore}`;
  }
  if (form.system === 'press_economy') {
    return `Икономична серия двулицеви фиброциментови панели с EPS изолация — Външни стени: ${extCm} см (${extMm} мм); Вътрешни преградни стени: ${intCm} см (${intMm} мм)`;
  }
  if (form.system === 'steel_frame') {
    return `Стоманена каркасна конструкция с двулицеви фиброциментови панели и каменна вата — Дебелина на външните стени: ${extCm} см; Дебелина на вътрешните стени: ${intCm} см`;
  }
  return `Усилена поцинкована метална конструкция, топло- и шумоизолирана с каменна вата (отвън фиброциментови плоскости, отвътре гипсокартон) — Външни стени: ${extCm} см; Вътрешни стени: ${intCm} см`;
}

export function buildSpecificationRows(
  form: OfferFormState,
  foundationUnitRate: number,
  hasTurnkey: boolean,
  turnkeyDocName: string,
  resolved: ReturnType<typeof resolveOptionLabels>
): Array<{ element: string; spec: string }> {
  const lang = form.lang || 'bg';
  const isPress =
    form.system === 'press_standard' || form.system === 'press_economy';
  const wallSpec = buildDynamicWallSpec(form, lang);
  const hasCustomRoof = Boolean(form.roofCustomText?.trim());
  const hasCustomWin = Boolean(form.winCustomText?.trim());

  const applyOverrides = (rows: Array<{ element: string; spec: string }>) =>
    rows.map((row, idx) => {
      const custom = form.specOverrides?.[String(idx)]?.trim();
      return custom ? { ...row, spec: custom } : row;
    });

  if (lang === 'en') {
    const termEn = isPress
      ? 'Production ~3 weeks from advance payment and 5–10 days of on-site assembly (30–40 days after approved designs and building permit). Full assistance with project documentation.'
      : 'After approved projects and building permit — 30–40 days to completed assembly. We provide full assistance with preparing the documentation.';

    return applyOverrides([
      {
        element: 'Construction & foundation',
        spec: `Built on a reinforced concrete strip or pad foundation, as well as a metal structure with galvanised elements and ground-anchor screws. Indicative average foundation price: ~${foundationUnitRate} €/m² (exact price confirmed after a site visit and geodetic survey of the plot).`,
      },
      {
        element: 'Walls',
        spec: `${wallSpec}. Wall height: ${resolved.wallHeightLabel}. Facade finish: ${resolved.facadeLabel}${
          hasTurnkey
            ? ' (painted and finished under the Turnkey package).'
            : ' (delivered unpainted at shell stage; painting is included only in Turnkey packages).'
        }`,
      },
      {
        element: 'Roof',
        spec: hasCustomRoof
          ? resolved.roofLabel
          : `Galvanised steel trusses, OSB boards with vapour membrane, metal roof tiles (Colour: ${resolved.roofLabel}) and complete metal gutter system.`,
      },
      {
        element: 'Ceiling',
        spec: resolved.ceilingLabel,
      },
      {
        element: 'Doors',
        spec: 'External armoured metal door (scratch- and impact-resistant, with thermal and sound insulation) + Internal MDF doors with wooden frame.',
      },
      {
        element: 'Windows',
        spec: hasCustomWin
          ? resolved.winFullLabel
          : `${resolved.winFullLabel}. Opening: turn-and-tilt (standard). Standard sizes: 60/40, 120/60, 120/100, 120/160, 160/160, 180/180 cm (custom sizes and frosted glass available per project).`,
      },
      {
        element: 'Electrical installation',
        spec: hasTurnkey
          ? 'Concealed wiring in corrugated conduits, installed electrical breaker panel + complete final fitting of CE-certified sockets, switches and light fixtures (included in Turnkey package).'
          : 'Concealed wiring in corrugated conduits and electrical panel installed by our team. CE-certified sockets, switches and ceiling lights supplied as materials (final fitting is part of finishing works).',
      },
      {
        element: 'Plumbing (ВиК)',
        spec: hasTurnkey
          ? 'Complete water supply and sewage installation + fully finished bathroom and toilet with sanitary ware included (shower tray, sink, toilet and accessories).'
          : 'Plumbing and sewage installation included in the price (completed to shell stage).',
      },
      {
        element: 'Lighting',
        spec: hasTurnkey
          ? 'Interior and exterior ceiling lights — supplied and fitted.'
          : 'Interior and exterior ceiling lights — supplied as materials.',
      },
      {
        element: 'Painting',
        spec: hasTurnkey
          ? 'Exterior silicone and interior latex paint — supplied and applied (included in Turnkey package).'
          : 'Not included in shell stage — wall and facade claddings are delivered unpainted. Exterior and interior painting are included only in Turnkey packages.',
      },
      {
        element: 'Additional options',
        spec: hasTurnkey
          ? `Active Turnkey Package (${turnkeyDocName}): includes external thermal insulation, wall plasterboard & skim coat, floor screed, laminate/tiles/ceramics, painting, kitchen cabinets and equipped bathroom.`
          : 'Screed and underfloor heating, plasterboard, skim coat, wallpaper, floor coverings, wall and floor tiles, furniture per project. For the facade: silicone plaster, 10 cm external thermal insulation or Etalbond curtain wall.',
      },
      {
        element: 'Delivery & assembly time',
        spec: termEn,
      },
    ]);
  }

  // Bulgarian ('bg')
  const termBg = isPress
    ? 'Производство ~3 седмици от авансовото плащане и 5–10 дни монтаж на място (30–40 дни след одобрени проекти и разрешение за строеж). Оказваме пълно съдействие при подготовката на документацията.'
    : 'След одобрени проекти и разрешение за строеж — 30–40 дни до завършен монтаж. Оказваме пълно съдействие при подготовката на документацията.';

  return applyOverrides([
    {
      element: 'Конструкция и основа',
      spec: `Изгражда се върху бетонова, ивична или стъпкова основа, както и метална конструкция с поцинковани елементи и земно-анкерни винтове. Ориентировъчна средна цена на фундамента: ~${foundationUnitRate} €/м² (точната цена се определя след оглед и геодезично заснемане на терена).`,
    },
    {
      element: 'Стени',
      spec: `${wallSpec}. Височина на стените: ${resolved.wallHeightLabel}. Фасада: ${resolved.facadeLabel}${
        hasTurnkey
          ? ' (боядисани и завършени по пакета „До ключ“).'
          : ' (доставят се без боядисване на етап „до тапа“; боядисването е включено само в пакетите „До ключ“).'
      }`,
    },
    {
      element: 'Покрив',
      spec: hasCustomRoof
        ? resolved.roofLabel
        : `Метални ферми от поцинкована стомана, OSB плоскости с паромембрана, метални керемиди (Цвят: ${resolved.roofLabel}) и метални улуци.`,
    },
    {
      element: 'Таван',
      spec: resolved.ceilingLabel,
    },
    {
      element: 'Врати',
      spec: 'Външна блиндирана метална врата (устойчива на удар и надраскване, с топло- и шумоизолация) + Вътрешни MDF врати с дървена каса.',
    },
    {
      element: 'Прозорци',
      spec: hasCustomWin
        ? resolved.winFullLabel
        : `${resolved.winFullLabel}. Отваряне: двойно и ножично (стандарт). Стандартни размери: 60/40, 120/60, 120/100, 120/160, 160/160, 180/180 см (възможни са и индивидуални размери и матирано стъкло по проект).`,
    },
    {
      element: 'Електрическа инсталация',
      spec: hasTurnkey
        ? 'Скрит монтаж и ел. табло + пълен финален монтаж на CE сертифицирани контакти, ключове и осветителни тела (включено в пакета „До ключ“).'
        : 'Скрит монтаж и ел. табло, изпълнени от наш екип по предварителен ел. проект. CE сертифицирани контакти, ключове и плафони — доставени като материал (финалният монтаж е част от довършителните работи).',
    },
    {
      element: 'ВиК',
      spec: hasTurnkey
        ? 'ВиК инсталация + напълно завършени баня и тоалетна с включена санитария (душ корито, мивка, тоалетна и аксесоари).'
        : 'ВиК инсталация — включена в цената (изведена до тапа).',
    },
    {
      element: 'Осветление',
      spec: hasTurnkey
        ? 'Вътрешни и външни плафони — доставени и монтирани.'
        : 'Вътрешни и външни плафони — доставени като материал.',
    },
    {
      element: 'Боядисване',
      spec: hasTurnkey
        ? 'Външна силиконова и вътрешна латексова боя — доставени и положени (включено в пакета „До ключ“).'
        : 'Не е включено в етап „до тапа“ — стенните и фасадните облицовки се доставят без боядисване. Външното и вътрешното боядисване се изпълняват само при избран пакет „До ключ“.',
    },
    {
      element: 'Допълнителни опции',
      spec: hasTurnkey
        ? `Активиран допълнителен пакет „До ключ“ (${turnkeyDocName}): включва външна топлоизолация, гипсокартон и шпакловка, замазка на пода, ламинат/теракот/фаянс, боядисване, кухненско оборудване и санитария.`
        : 'Замазка и подово отопление, гипсокартон, шпакловка, тапети, подови настилки, фаянс, теракота, обзавеждане по проект. За фасада: силиконова мазилка, външна топлоизолация 10 см или окачена фасада от еталбонд.',
    },
    {
      element: 'Срок за изпълнение',
      spec: termBg,
    },
  ]);
}

export function calculateOffer(
  form: OfferFormState,
  config: PricingConfig
): CalculatedOffer {
  const lang = form.lang || 'bg';
  const baseStructureRate = getBaseStructureUnitRate(form, config);
  const structureUnitRate =
    form.structureRateOverride !== null && form.structureRateOverride >= 0
      ? form.structureRateOverride
      : baseStructureRate;

  const area = Math.max(0, form.areaRzp || 0);
  const structureTotal = Math.round(area * structureUnitRate);

  const extraOptionAmount = Math.max(0, Math.round(form.extraOptionAmount || 0));
  const discountEur = Math.max(0, Math.round(form.discountEur || 0));

  // Net contract value for structure (Договорна стойност)
  const contractStructureNet = Math.max(
    0,
    structureTotal + extraOptionAmount - discountEur
  );

  const hasTurnkey = form.turnkeyPackage !== 'none';
  const baseTurnkeyRate = getBaseTurnkeyUnitRate(form, config);
  const turnkeyUnitRate = hasTurnkey
    ? form.turnkeyRateOverride !== null && form.turnkeyRateOverride >= 0
      ? form.turnkeyRateOverride
      : baseTurnkeyRate
    : 0;

  const turnkeyTotal = hasTurnkey ? Math.round(area * turnkeyUnitRate) : 0;
  const contractWithTurnkeyTotal = contractStructureNet + turnkeyTotal;

  // Critical Two-Storey Rule:
  const effectiveFoundationArea = form.includeFoundation
    ? Math.max(0, form.foundationArea || 0)
    : 0;

  const foundationUnitRate =
    form.foundationRateOverride !== null && form.foundationRateOverride >= 0
      ? form.foundationRateOverride
      : config.foundationRate;

  const foundationTotal = form.includeFoundation
    ? Math.round(effectiveFoundationArea * foundationUnitRate)
    : 0;

  const structurePlusFoundationTotal = contractStructureNet + foundationTotal;
  const grandTotalWithTurnkey =
    contractStructureNet + turnkeyTotal + foundationTotal;

  // Payment stages (50% / 40% / 10%) strictly calculated on Kaba Yapı Sözleşme Bedeli (Договорна стойност = contractStructureNet)
  const stage1_50 = Math.round(contractStructureNet * 0.5);
  const stage2_40 = Math.round(contractStructureNet * 0.4);
  const stage3_10 = contractStructureNet - stage1_50 - stage2_40;

  // Dynamic Scope Rule (Section 2.5):
  const tkSuffix =
    lang === 'en' ? '(incl. in Turnkey package)' : '(вкл. в пакет „До ключ“)';

  const turnkeyMeta = TURNKEY_META[form.turnkeyPackage] ?? TURNKEY_META.none;
  const resolvedLabels = resolveOptionLabels(form);
  const wallDefaults = getDefaultWallThicknessCm(form.system);
  const extCm =
    form.extWallCm && form.extWallCm > 0 ? form.extWallCm : wallDefaults.ext;
  const intCm =
    form.intWallCm && form.intWallCm > 0 ? form.intWallCm : wallDefaults.int;

  const dynamicBaseScope =
    lang === 'en'
      ? [
          'Factory manufacturing of the structure',
          'Delivery to the customer’s plot',
          'On-site assembly by Flexi Home team',
          `Wall system (${extCm} cm external / ${intCm} cm internal)`,
          form.roofCustomText?.trim()
            ? `Roof: ${resolvedLabels.roofLabel}`
            : `Roof system with galvanised trusses, OSB, vapour membrane, metal tiles (${resolvedLabels.roofLabel}) and gutters`,
          `Ceiling: ${resolvedLabels.ceilingLabel}`,
          `Windows & glazing: ${resolvedLabels.winFullLabel}`,
          'Armoured metal entrance door and interior MDF doors with wooden frame',
          'Electrical installation (concealed wiring and breaker panel)',
          'Plumbing installation (completed to shell stage)',
          ...(form.includeFoundation
            ? [`Foundation per project (${effectiveFoundationArea} m²)`]
            : []),
        ]
      : [
          'Производство на конструкцията във фабрика',
          'Доставка до парцела на клиента',
          'Монтаж на място от специализиран екип',
          `Стенна система (${extCm} см външни / ${intCm} см вътрешни стени)`,
          form.roofCustomText?.trim()
            ? `Покрив: ${resolvedLabels.roofLabel}`
            : `Покривна система с метални ферми, OSB, паромембрана, метални керемиди (${resolvedLabels.roofLabel}) и улуци`,
          `Таван: ${resolvedLabels.ceilingLabel}`,
          `Дограма и стъклопакет: ${resolvedLabels.winFullLabel}`,
          'Външна блиндирана метална и вътрешни MDF врати с дървена каса',
          'Електрическа инсталация (скрит монтаж и ел. табло)',
          'ВиК инсталация (напълно монтирана до тапа)',
          ...(form.includeFoundation
            ? [`Фундамент по проект (${effectiveFoundationArea} м²)`]
            : []),
        ];

  const includedScope = hasTurnkey
    ? [
        ...dynamicBaseScope,
        ...TURNKEY_FINISHING_ITEMS[lang].map((item) => `${item} ${tkSuffix}`),
      ]
    : dynamicBaseScope;

  const alwaysExcl = ALWAYS_EXCLUDED_ITEMS[lang];
  // When a Turnkey package is selected, the "Not Included" section is hidden completely.
  const excludedScope = hasTurnkey
    ? []
    : [
        alwaysExcl[0],
        ...(form.includeFoundation ? [] : [alwaysExcl[1]]),
        ...TURNKEY_FINISHING_ITEMS[lang],
        alwaysExcl[3],
        alwaysExcl[2],
        alwaysExcl[4],
      ];

  const specRows = buildSpecificationRows(
    form,
    foundationUnitRate,
    hasTurnkey,
    turnkeyMeta.docName[lang],
    resolvedLabels
  );

  return {
    structureUnitRate,
    structureTotal,
    extraOptionAmount,
    discountEur,
    contractStructureNet,
    hasTurnkey,
    turnkeyName: turnkeyMeta.docName[lang],
    turnkeyUnitRate,
    turnkeyTotal,
    contractWithTurnkeyTotal,
    effectiveFoundationArea,
    foundationUnitRate,
    foundationTotal,
    structurePlusFoundationTotal,
    grandTotalWithTurnkey,
    paymentStages: {
      stage1_50,
      stage2_40,
      stage3_10,
    },
    resolvedLabels,
    includedScope,
    excludedScope,
    specRows,
  };
}

export function formatEur(amount: number): string {
  return `${amount.toLocaleString('bg-BG').replace(/\u00A0/g, ' ')} €`;
}

export function formatValidUntilDate(
  dateIso: string,
  validityDays: number
): string {
  const safeDays = Math.max(1, Math.round(validityDays || 30));
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((dateIso || '').trim());
  const baseMs = match
    ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : Date.now();
  const target = new Date(baseMs + safeDays * 86_400_000);
  const dd = String(target.getUTCDate()).padStart(2, '0');
  const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = target.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const COUNTER_KEY = 'flexi_home_offer_seq_counter_v1';

export function getOfferSequenceValue(): number {
  if (typeof window === 'undefined') return 101;
  try {
    const raw = window.localStorage.getItem(COUNTER_KEY);
    const parsed = raw ? parseInt(raw, 10) : 101;
    return !Number.isNaN(parsed) && parsed >= 1 ? parsed : 101;
  } catch {
    return 101;
  }
}

export function setOfferSequenceValue(nextSeq: number): string {
  const safe = Math.max(1, Math.round(nextSeq || 101));
  const yy = String(new Date().getFullYear()).slice(-2);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COUNTER_KEY, String(safe));
    } catch {
      // ignore
    }
  }
  return `${yy}-${String(safe).padStart(4, '0')}`;
}

/**
 * Automatically generates a sequential offer number (e.g., "26-0101", "26-0102")
 * persisted in localStorage so every new offer automatically receives the next unique number.
 */
export function generateOfferNumber(increment = true): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  let seq = 101;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(COUNTER_KEY);
      const parsed = raw ? parseInt(raw, 10) : 100;
      if (!Number.isNaN(parsed) && parsed >= 1) {
        seq = increment ? parsed + 1 : parsed;
      }
      if (increment || !raw) {
        window.localStorage.setItem(COUNTER_KEY, String(seq));
      }
    } catch {
      seq = Math.floor(1000 + Math.random() * 9000);
    }
  }
  return `${yy}-${String(seq).padStart(4, '0')}`;
}
