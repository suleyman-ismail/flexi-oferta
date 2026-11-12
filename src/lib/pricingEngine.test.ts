import { describe, expect, it } from 'vitest';
import { DEFAULT_PRICING_CONFIG } from './constants';
import { calculateOffer, getBaseStructureUnitRate } from './pricingEngine';
import { OfferFormState } from '@/types/offer';

const baseForm: OfferFormState = {
  lang: 'bg',
  offerNo: '26-0101',
  date: '2026-11-12',
  validityDays: 15,
  clientName: 'Иван Петров',
  clientPhone: '+359 888 123 456',
  country: 'България',
  region: 'София',
  location: 'гр. София, кв. Бояна',
  fullAddress: '',
  permitStatus: 'has',
  catalogModelId: 'e85',
  modelCodeLabel: 'MK-1 · 85 m²',
  system: 'press_standard',
  floors: 1,
  pressTwoFloorVariant: '489',
  areaRzp: 80,
  includeFoundation: true,
  foundationArea: 80,
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

describe('flexi-home.eu Pricing Engine (BG & EN)', () => {
  it('calculates tiered 1-storey rates accurately across all 4 systems', () => {
    expect(
      getBaseStructureUnitRate(
        { system: 'press_standard', floors: 1, areaRzp: 45, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(420);
    expect(
      getBaseStructureUnitRate(
        { system: 'press_standard', floors: 1, areaRzp: 65, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(400);
    expect(
      getBaseStructureUnitRate(
        { system: 'press_standard', floors: 1, areaRzp: 85, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(380);
    expect(
      getBaseStructureUnitRate(
        { system: 'press_standard', floors: 1, areaRzp: 110, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(360);

    expect(
      getBaseStructureUnitRate(
        { system: 'press_economy', floors: 1, areaRzp: 90, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(280);

    expect(
      getBaseStructureUnitRate(
        { system: 'steel_frame', floors: 1, areaRzp: 100, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(506);

    expect(
      getBaseStructureUnitRate(
        { system: 'reinforced_metal', floors: 1, areaRzp: 100, pressTwoFloorVariant: '489' },
        DEFAULT_PRICING_CONFIG
      )
    ).toBe(643);
  });

  it('applies 2-storey rule where foundation uses separate footprint area instead of total RZP', () => {
    const twoStoreyForm: OfferFormState = {
      ...baseForm,
      system: 'steel_frame',
      floors: 2,
      areaRzp: 128,
      foundationArea: 70,
      turnkeyPackage: 'standard',
    };

    const result = calculateOffer(twoStoreyForm, DEFAULT_PRICING_CONFIG);
    expect(result.structureUnitRate).toBe(600);
    expect(result.structureTotal).toBe(76800);

    expect(result.effectiveFoundationArea).toBe(70);
    expect(result.foundationTotal).toBe(9800);

    expect(result.turnkeyUnitRate).toBe(420);
    expect(result.turnkeyTotal).toBe(53760);

    expect(result.structurePlusFoundationTotal).toBe(76800 + 9800);
    expect(result.grandTotalWithTurnkey).toBe(76800 + 53760 + 9800);

    expect(result.paymentStages.stage1_50).toBe(38400);
    expect(result.paymentStages.stage2_40).toBe(30720);
    expect(result.paymentStages.stage3_10).toBe(7680);
  });

  it('hides excluded scope and updates painting specs when turnkey is selected in both BG and EN', () => {
    const withoutTurnkey = calculateOffer(baseForm, DEFAULT_PRICING_CONFIG);
    expect(withoutTurnkey.excludedScope).toContain('Външна топлоизолация');
    expect(withoutTurnkey.excludedScope).toContain('Замазка на пода');
    const bgWallsShell = withoutTurnkey.specRows.find(
      (r) => r.element === 'Стени'
    );
    const bgPaintingShell = withoutTurnkey.specRows.find(
      (r) => r.element === 'Боядисване'
    );
    expect(bgWallsShell?.spec).toContain('без боядисване');
    expect(bgPaintingShell?.spec).toContain('Не е включено');

    const withTurnkeyBg = calculateOffer(
      { ...baseForm, turnkeyPackage: 'standard' },
      DEFAULT_PRICING_CONFIG
    );
    expect(withTurnkeyBg.excludedScope).toEqual([]);
    const bgPaintingTurnkey = withTurnkeyBg.specRows.find(
      (r) => r.element === 'Боядисване'
    );
    expect(bgPaintingTurnkey?.spec).toContain('включено в пакета');

    const withTurnkeyEn = calculateOffer(
      { ...baseForm, lang: 'en', turnkeyPackage: 'luxury_680' },
      DEFAULT_PRICING_CONFIG
    );
    expect(withTurnkeyEn.excludedScope).toEqual([]);
    const enPaintingTurnkey = withTurnkeyEn.specRows.find(
      (r) => r.element === 'Painting'
    );
    expect(enPaintingTurnkey?.spec).toContain('included in Turnkey');
  });
});
