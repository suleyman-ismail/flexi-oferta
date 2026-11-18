import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  CATALOG_MODELS,
  DEFAULT_PRICING_CONFIG,
  FACADE_OPTIONS,
  PERMIT_STATUS_OPTIONS,
  ROOF_OPTIONS,
  SYSTEM_META,
  TURNKEY_META,
  WALL_HEIGHT_OPTIONS,
  WIN_COLOR_OPTIONS,
  WIN_GLAZING_OPTIONS,
  WIN_PROFILE_OPTIONS,
} from '@/lib/constants';
import { calculateOffer, generateOfferNumber } from '@/lib/pricingEngine';
import {
  buildBulgarianOfferDocDefinition,
  formatOfferFilename,
} from '@/lib/pdfGenerator';
import { buildOfferShareMessage } from '@/lib/shareLinks';
import { CalculatedOffer, OfferFormState } from '@/types/offer';

export function buildOfferFormFromInput(
  input: Partial<OfferFormState> = {}
): OfferFormState {
  const lang = input.lang === 'en' ? 'en' : 'bg';
  const today = new Date().toISOString().split('T')[0];

  const catalogModel = input.catalogModelId
    ? CATALOG_MODELS.find((m) => m.id === input.catalogModelId)
    : undefined;

  const baseFloors = input.floors ?? catalogModel?.floors ?? 1;
  const baseArea = input.areaRzp ?? catalogModel?.area ?? 85;
  const baseFootprint =
    catalogModel?.footprint ??
    (baseFloors === 2 ? Math.round(baseArea / 2) : baseArea);

  return {
    lang,
    offerNo: input.offerNo || generateOfferNumber(false),
    date: input.date || today,
    validityDays: input.validityDays ?? 30,
    clientName: input.clientName || (lang === 'en' ? 'Client' : 'Клиент'),
    clientPhone: input.clientPhone || '',
    country: input.country || (lang === 'en' ? 'Bulgaria' : 'България'),
    region: input.region || '',
    location: input.location || (lang === 'en' ? 'Sofia' : 'гр. София'),
    fullAddress: input.fullAddress || '',
    permitStatus: input.permitStatus || 'unknown',
    catalogModelId: input.catalogModelId || 'custom',
    modelCodeLabel:
      input.modelCodeLabel ?? (catalogModel ? catalogModel.code : ''),
    system: input.system || 'press_standard',
    floors: baseFloors,
    pressTwoFloorVariant: input.pressTwoFloorVariant || '489',
    areaRzp: baseArea,
    includeFoundation: input.includeFoundation ?? true,
    foundationArea: input.foundationArea ?? baseFootprint,
    turnkeyPackage: input.turnkeyPackage || 'none',
    structureRateOverride: input.structureRateOverride ?? null,
    foundationRateOverride: input.foundationRateOverride ?? null,
    turnkeyRateOverride: input.turnkeyRateOverride ?? null,
    roofColorKey: input.roofColorKey || 'unknown',
    winColorKey: input.winColorKey || 'unknown',
    winProfileKey: input.winProfileKey || 'pvc_5ch',
    winGlazingKey: input.winGlazingKey || 'double',
    facadeKey: input.facadeKey || 'panel_smooth',
    wallHeightKey: input.wallHeightKey || '250',
    ceilingInsulKey: input.ceilingInsulKey || '80',
    extWallCm: input.extWallCm,
    intWallCm: input.intWallCm,
    systemCustomText: input.systemCustomText,
    roofCustomText: input.roofCustomText,
    winCustomText: input.winCustomText,
    facadeCustomText: input.facadeCustomText,
    wallHeightCustomText: input.wallHeightCustomText,
    ceilingCustomText: input.ceilingCustomText,
    extraOptionLabel: input.extraOptionLabel || '',
    extraOptionAmount: input.extraOptionAmount || 0,
    discountEur: input.discountEur || 0,
    customNotes: input.customNotes || '',
  };
}

export function computeOfferResult(input: Partial<OfferFormState> = {}): {
  form: OfferFormState;
  calculation: CalculatedOffer;
  shareText: string;
  suggestedPdfFilename: string;
} {
  const form = buildOfferFormFromInput(input);
  const calculation = calculateOffer(form, DEFAULT_PRICING_CONFIG);
  const shareText = buildOfferShareMessage(form, calculation);
  const suggestedPdfFilename = formatOfferFilename(form);
  return { form, calculation, shareText, suggestedPdfFilename };
}

function readLocalLogoDataUrl(): string | null {
  try {
    const candidates = [
      path.resolve(process.cwd(), 'public/flexi-home-logo.jpg'),
      path.resolve(__dirname, '../public/flexi-home-logo.jpg'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const b64 = fs.readFileSync(p).toString('base64');
        return `data:image/jpeg;base64,${b64}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateOfferPdfBuffer(
  input: Partial<OfferFormState> = {}
): Promise<{
  buffer: Buffer;
  filename: string;
  form: OfferFormState;
  calculation: CalculatedOffer;
}> {
  const { form, calculation, suggestedPdfFilename } = computeOfferResult(input);
  const req = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake: any = req('pdfmake/build/pdfmake.js');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfFonts: any = req('pdfmake/build/vfs_fonts.js');

  if (pdfFonts?.pdfMake?.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts?.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  }

  const logoDataUrl = readLocalLogoDataUrl();
  const docDefinition = buildBulgarianOfferDocDefinition(
    form,
    calculation,
    logoDataUrl
  );

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buf: Uint8Array) => {
        resolve(Buffer.from(buf));
      });
    } catch (err) {
      reject(err);
    }
  });

  return {
    buffer,
    filename: suggestedPdfFilename,
    form,
    calculation,
  };
}

export function getCatalogPayload() {
  return {
    models: CATALOG_MODELS.map((m) => ({
      id: m.id,
      code: m.code,
      floors: m.floors,
      area: m.area,
      footprint: m.footprint,
      bedrooms: m.bedrooms,
      summaryBg: m.summaryBg,
      summaryEn: m.summaryEn,
    })),
    systems: Object.entries(SYSTEM_META)
      .filter(([key]) => key !== 'press_economy')
      .map(([key, meta]) => ({
        key,
        name: meta.name,
        shortDesc: meta.shortDesc,
      })),
    turnkeyPackages: Object.entries(TURNKEY_META).map(([key, meta]) => ({
      key,
      label: meta.label,
      docName: meta.docName,
    })),
    roofColors: ROOF_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    windowColors: WIN_COLOR_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    windowProfiles: WIN_PROFILE_OPTIONS,
    windowGlazings: WIN_GLAZING_OPTIONS,
    facades: FACADE_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    wallHeights: WALL_HEIGHT_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    permitStatuses: PERMIT_STATUS_OPTIONS,
    defaultPricingConfig: DEFAULT_PRICING_CONFIG,
  };
}
