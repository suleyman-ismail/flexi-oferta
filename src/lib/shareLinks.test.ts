import { describe, expect, it } from 'vitest';
import {
  buildOfferShareMessage,
  buildViberUrl,
  buildWhatsAppUrl,
  normalizePhoneForMessenger,
} from './shareLinks';
import { DEFAULT_PRICING_CONFIG } from './constants';
import { calculateOffer } from './pricingEngine';
import type { OfferFormState } from '@/types/offer';

const sampleForm: OfferFormState = {
  lang: 'bg',
  offerNo: '26-0105',
  date: '2026-11-12',
  validityDays: 15,
  clientName: 'Иван Петров',
  clientPhone: '+359 888 123 456',
  country: 'България',
  region: 'София',
  location: 'София',
  fullAddress: '',
  permitStatus: 'has',
  floors: 1,
  catalogModelId: 'e85',
  modelCodeLabel: 'Е85',
  system: 'press_standard',
  areaRzp: 85,
  pressTwoFloorVariant: '489',
  includeFoundation: false,
  foundationArea: 85,
  turnkeyPackage: 'standard',
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

describe('WhatsApp & Viber share link helpers', () => {
  it('normalizes Bulgarian, Turkish, and international phone numbers cleanly', () => {
    expect(normalizePhoneForMessenger('+359 888 123 456')).toBe('359888123456');
    expect(normalizePhoneForMessenger('00359-888-123-456')).toBe('359888123456');
    expect(normalizePhoneForMessenger('0888 123 456')).toBe('359888123456');
    expect(normalizePhoneForMessenger('+90 532 111 22 33')).toBe('905321112233');
    expect(normalizePhoneForMessenger('123')).toBeNull();
    expect(normalizePhoneForMessenger('')).toBeNull();
  });

  it('builds valid WhatsApp and Viber URLs with customer phone and quote summary', () => {
    const calc = calculateOffer(sampleForm, DEFAULT_PRICING_CONFIG);
    const msg = buildOfferShareMessage(sampleForm, calc);
    expect(msg).toContain('26-0105');
    expect(msg).toContain('Иван Петров');
    expect(msg).toContain('Е85');

    const wa = buildWhatsAppUrl(sampleForm.clientPhone, msg);
    const viber = buildViberUrl(sampleForm.clientPhone, msg);
    expect(wa).toMatch(/^https:\/\/wa\.me\/359888123456\?text=/);
    expect(viber).toMatch(/^viber:\/\/chat\?number=%2B359888123456&draft=/);

    const waNoPhone = buildWhatsAppUrl('', msg);
    const viberNoPhone = buildViberUrl('', msg);
    expect(waNoPhone).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(viberNoPhone).toMatch(/^viber:\/\/forward\?text=/);
  });
});
