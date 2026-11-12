import {
  COMPANY_INFO,
  CUSTOMER_RESPONSIBILITY,
} from './constants';
import { formatEur } from './pricingEngine';
import { CalculatedOffer, OfferFormState } from '@/types/offer';

async function fetchLogoBase64(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const res = await fetch(`${basePath}/flexi-home-logo.jpg`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function formatOfferFilename(form: OfferFormState): string {
  const rawName = (
    form.clientName || (form.lang === 'en' ? 'Client' : 'Klient')
  ).trim();
  const safeName = rawName
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0400-\u04FF_-]/g, '');
  const datePart = form.date || new Date().toISOString().split('T')[0];
  return `Oferta-${safeName || 'Klient'}-${datePart}.pdf`;
}

export function formatBgDate(isoDate: string, lang: 'bg' | 'en' = 'bg'): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return lang === 'en'
    ? `${parts[2]}.${parts[1]}.${parts[0]}`
    : `${parts[2]}.${parts[1]}.${parts[0]} г.`;
}

export async function generateBulgarianOfferPdf(
  form: OfferFormState,
  calc: CalculatedOffer
): Promise<void> {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMake: any = pdfMakeModule.default || pdfMakeModule;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfFonts: any = pdfFontsModule.default || pdfFontsModule;

  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && pdfFonts.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  }

  const lang = form.lang || 'bg';
  const isEn = lang === 'en';
  const logoDataUrl = await fetchLogoBase64();
  const dateFormatted = formatBgDate(form.date, lang);
  const R = calc.resolvedLabels;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildPageHeader = (pageSubtitle: string, pageBreakBefore = false): any => {
    return {
      stack: [
        {
          columns: [
            logoDataUrl
              ? {
                  image: logoDataUrl,
                  width: 44,
                  height: 44,
                  margin: [0, 0, 10, 0],
                }
              : { width: 0, text: '' },
            {
              width: '*',
              stack: [
                {
                  text: COMPANY_INFO.brand,
                  fontSize: 16,
                  bold: true,
                  color: '#1e1b4b',
                },
                {
                  text: `${COMPANY_INFO.website}  ·  ${
                    isEn ? COMPANY_INFO.legalNameEn : COMPANY_INFO.legalName
                  }`,
                  fontSize: 8.5,
                  color: '#475569',
                  margin: [0, 2, 0, 0],
                },
                {
                  text: pageSubtitle,
                  fontSize: 8,
                  color: '#1B365D',
                  bold: true,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
            {
              width: 'auto',
              alignment: 'right',
              stack: [
                {
                  text: isEn
                    ? `OFFER № ${form.offerNo}`
                    : `ОФЕРТА № ${form.offerNo}`,
                  fontSize: 13,
                  bold: true,
                  color: '#1B365D',
                },
                {
                  text: isEn
                    ? `Date: ${dateFormatted}`
                    : `Дата: ${dateFormatted}`,
                  fontSize: 8.5,
                  color: '#334155',
                  margin: [0, 2, 0, 0],
                },
                {
                  text: isEn
                    ? `Validity: ${form.validityDays} days  |  Currency: ${COMPANY_INFO.currency}`
                    : `Валидност: ${form.validityDays} дни  |  Валута: ${COMPANY_INFO.currency}`,
                  fontSize: 8,
                  color: '#64748b',
                  margin: [0, 1, 0, 0],
                },
              ],
            },
          ],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 6,
              x2: 515,
              y2: 6,
              lineWidth: 1.5,
              lineColor: '#1B365D',
            },
          ],
          margin: [0, 2, 0, 8],
        },
      ],
      ...(pageBreakBefore ? { pageBreak: 'before' } : {}),
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionTitle = (num: string, title: string): any => ({
    table: {
      widths: ['auto', '*'],
      body: [
        [
          {
            text: num,
            fillColor: '#1B365D',
            color: '#ffffff',
            bold: true,
            fontSize: 9,
            margin: [5, 3, 5, 3],
          },
          {
            text: title,
            fillColor: '#eef2ff',
            color: '#1e1b4b',
            bold: true,
            fontSize: 9.5,
            margin: [8, 3, 6, 3],
          },
        ],
      ],
    },
    layout: 'noBorders',
    margin: [0, 6, 0, 5],
  });

  // 02 ЦЕНА / PRICE rows
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceBody: any[][] = [
    [
      { text: isEn ? 'Item / Description' : 'Позиция / Описание', style: 'th' },
      {
        text: isEn ? 'Quantity' : 'Количество',
        style: 'th',
        alignment: 'right',
      },
      {
        text: isEn ? 'Unit Price' : 'Ед. цена',
        style: 'th',
        alignment: 'right',
      },
      {
        text: isEn ? 'Amount (incl. VAT)' : 'Сума (с ДДС)',
        style: 'th',
        alignment: 'right',
      },
    ],
    [
      {
        stack: [
          {
            text: isEn
              ? `1. Structure “${R.systemName}”, shell stage („до тапа“)`
              : `1. Конструкция „${R.systemName}“, етап „до тапа“`,
            bold: true,
            fontSize: 9,
            color: '#0f172a',
          },
          {
            text: isEn
              ? 'Manufacturing, delivery and on-site assembly (incl. 20% VAT)'
              : 'Производство, доставка и монтаж (с включен 20% ДДС)',
            fontSize: 7.5,
            color: '#64748b',
            margin: [0, 1, 0, 0],
          },
        ],
      },
      { text: `${form.areaRzp} m²`, alignment: 'right', fontSize: 9 },
      { text: `${calc.structureUnitRate} €/m²`, alignment: 'right', fontSize: 9 },
      {
        text: formatEur(calc.structureTotal),
        alignment: 'right',
        bold: true,
        fontSize: 9,
      },
    ],
  ];

  if (calc.extraOptionAmount > 0) {
    priceBody.push([
      {
        text:
          form.extraOptionLabel ||
          (isEn ? 'Additional option' : 'Допълнителна опция'),
        fontSize: 8.5,
      },
      { text: '1', alignment: 'right', fontSize: 8.5 },
      {
        text: formatEur(calc.extraOptionAmount),
        alignment: 'right',
        fontSize: 8.5,
      },
      {
        text: formatEur(calc.extraOptionAmount),
        alignment: 'right',
        bold: true,
        fontSize: 8.5,
      },
    ]);
  }

  if (calc.discountEur > 0) {
    priceBody.push([
      {
        text: isEn ? 'Special client discount' : 'Индивидуална отстъпка',
        fontSize: 8.5,
        color: '#15803d',
        bold: true,
      },
      { text: '—', alignment: 'right', fontSize: 8.5 },
      {
        text: `-${formatEur(calc.discountEur)}`,
        alignment: 'right',
        fontSize: 8.5,
        color: '#15803d',
      },
      {
        text: `-${formatEur(calc.discountEur)}`,
        alignment: 'right',
        bold: true,
        fontSize: 8.5,
        color: '#15803d',
      },
    ]);
  }

  priceBody.push([
    {
      text: isEn
        ? 'Contract Value for Shell Structure („до тапа“), incl. 20% VAT'
        : 'Договорна стойност за груб строеж („до тапа“) с включен 20% ДДС',
      colSpan: 3,
      bold: true,
      fontSize: 9,
      fillColor: '#f1f5f9',
      color: '#0f172a',
    },
    {},
    {},
    {
      text: formatEur(calc.contractStructureNet),
      alignment: 'right',
      bold: true,
      fontSize: 9.5,
      fillColor: '#f1f5f9',
      color: '#1e1b4b',
    },
  ]);

  if (calc.hasTurnkey) {
    priceBody.push([
      {
        stack: [
          {
            text: isEn
              ? `2. Additional Turnkey Package (separate package / extra) — ${calc.turnkeyName}`
              : `2. Допълнителен пакет „До ключ“ (отделен пакет / екстра) — ${calc.turnkeyName}`,
            bold: true,
            fontSize: 9,
            color: '#312e81',
          },
          {
            text: isEn
              ? 'Finishing works per selected material tier (quoted as a separate option)'
              : 'Довършителни работи по избрания клас материали (отделна опция към конструкцията)',
            fontSize: 7.5,
            color: '#1B365D',
            margin: [0, 1, 0, 0],
          },
        ],
      },
      { text: `${form.areaRzp} m²`, alignment: 'right', fontSize: 9 },
      { text: `+${calc.turnkeyUnitRate} €/m²`, alignment: 'right', fontSize: 9 },
      {
        text: formatEur(calc.turnkeyTotal),
        alignment: 'right',
        bold: true,
        fontSize: 9,
        color: '#312e81',
      },
    ]);
  }

  if (form.includeFoundation) {
    priceBody.push([
      {
        stack: [
          {
            text: isEn
              ? 'Foundation (Reinforced concrete sub-base)'
              : 'Фундамент (Стоманобетонна основа / плоча)',
            bold: true,
            fontSize: 8.5,
            color: '#334155',
          },
          {
            text: COMPANY_INFO.foundationDisclaimer[lang],
            fontSize: 7.5,
            italics: true,
            color: '#b45309',
            margin: [0, 1, 0, 0],
          },
        ],
      },
      {
        text: `${calc.effectiveFoundationArea} m²`,
        alignment: 'right',
        fontSize: 8.5,
        color: '#475569',
      },
      {
        text: `${calc.foundationUnitRate} €/m²`,
        alignment: 'right',
        fontSize: 8.5,
        color: '#475569',
      },
      {
        text: `≈ ${formatEur(calc.foundationTotal)}`,
        alignment: 'right',
        bold: true,
        fontSize: 8.5,
        color: '#b45309',
      },
    ]);
  }

  priceBody.push([
    {
      text: form.includeFoundation
        ? isEn
          ? 'TOTAL (Shell Structure Only + Indicative Foundation)'
          : 'ОБЩО (Само груб строеж „до тапа“ + прогнозен Фундамент)'
        : isEn
        ? 'TOTAL (Shell Structure Only — without foundation)'
        : 'ОБЩО (Само груб строеж „до тапа“ — без фундамент)',
      colSpan: 3,
      bold: true,
      fontSize: 9,
      fillColor: '#eef2ff',
      color: '#1e1b4b',
    },
    {},
    {},
    {
      text: form.includeFoundation
        ? `≈ ${formatEur(calc.structurePlusFoundationTotal)}`
        : formatEur(calc.contractStructureNet),
      alignment: 'right',
      bold: true,
      fontSize: 9.5,
      fillColor: '#eef2ff',
      color: '#1e1b4b',
    },
  ]);

  if (calc.hasTurnkey) {
    priceBody.push([
      {
        text: form.includeFoundation
          ? isEn
            ? `GRAND TOTAL INCL. TURNKEY PACKAGE (${calc.turnkeyName}) + FOUNDATION`
            : `ОБЩА СТОЙНОСТ С ПАКЕТ „ДО КЛЮЧ“ (${calc.turnkeyName}) + ФУНДАМЕНТ`
          : isEn
          ? `GRAND TOTAL INCL. TURNKEY PACKAGE (${calc.turnkeyName})`
          : `ОБЩА СТОЙНОСТ С ПАКЕТ „ДО КЛЮЧ“ (${calc.turnkeyName})`,
        colSpan: 3,
        bold: true,
        fontSize: 9.5,
        fillColor: '#312e81',
        color: '#ffffff',
      },
      {},
      {},
      {
        text: form.includeFoundation
          ? `≈ ${formatEur(calc.grandTotalWithTurnkey)}`
          : formatEur(calc.contractWithTurnkeyTotal),
        alignment: 'right',
        bold: true,
        fontSize: 10,
        fillColor: '#312e81',
        color: '#ffffff',
      },
    ]);
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 32, 40, 42],
    info: {
      title: `ОФЕРТА № ${form.offerNo} - ${form.clientName || 'Flexi Home'}`,
      author: 'FLEXI HOME („С 1 ТРЕЙД“ ЕООД)',
      subject: 'Оферта за сглобяема / метална къща',
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 9,
      color: '#1e293b',
      lineHeight: 1.22,
    },
    styles: {
      th: {
        bold: true,
        fontSize: 8.5,
        color: '#ffffff',
        fillColor: '#1e1b4b',
      },
      kvLabel: {
        fontSize: 8.5,
        color: '#475569',
        bold: true,
      },
      kvVal: {
        fontSize: 8.5,
        color: '#0f172a',
        bold: true,
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    footer: (currentPage: number, pageCount: number): any => ({
      margin: [40, 6, 40, 0],
      stack: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#cbd5e1',
            },
          ],
          margin: [0, 0, 0, 4],
        },
        {
          columns: [
            {
              width: '*',
              text: `${COMPANY_INFO.brand} · ${COMPANY_INFO.legalName} · ${COMPANY_INFO.phones.join(', ')} · ${COMPANY_INFO.website}`,
              fontSize: 7.5,
              color: '#64748b',
            },
            {
              width: 'auto',
              text: isEn
                ? `Page ${currentPage} of ${pageCount}`
                : `Страница ${currentPage} от ${pageCount}`,
              fontSize: 7.5,
              bold: true,
              color: '#475569',
            },
          ],
        },
      ],
    }),
    content: [
      // ==================== PAGE 1 ====================
      buildPageHeader(
        isEn
          ? `Price basis: ${COMPANY_INFO.priceBasis.en}  ·  System: ${R.systemName}`
          : `Ценова база: ${COMPANY_INFO.priceBasis.bg}  ·  Система: ${R.systemName}`,
        false
      ),

      sectionTitle('01', isEn ? 'CUSTOMER & PROJECT' : 'КЛИЕНТ И ОБЕКТ'),
      {
        table: {
          widths: ['34%', '66%'],
          body: [
            [
              { text: isEn ? 'Customer' : 'Клиент', style: 'kvLabel' },
              {
                text: form.clientName
                  ? `${form.clientName}${form.clientPhone ? ` (${form.clientPhone})` : ''}`
                  : '—',
                style: 'kvVal',
              },
            ],
            [
              {
                text: isEn ? 'Project location' : 'Местоположение на обекта',
                style: 'kvLabel',
              },
              { text: R.locationFull, style: 'kvVal' },
            ],
            [
              {
                text: isEn ? 'Structural system' : 'Конструктивна система',
                style: 'kvLabel',
              },
              { text: R.systemName, style: 'kvVal' },
            ],
            [
              { text: isEn ? 'Storeys & Model' : 'Етажност и модел', style: 'kvLabel' },
              { text: R.floorsLabel, style: 'kvVal' },
            ],
            [
              {
                text: isEn ? 'Built-up area (RZP)' : 'Застроена площ (РЗП)',
                style: 'kvLabel',
              },
              { text: `${form.areaRzp} m²`, style: 'kvVal' },
            ],
            [
              {
                text: isEn
                  ? 'Foundation footprint area'
                  : 'Площ на основата (фундамент)',
                style: 'kvLabel',
              },
              {
                text: form.includeFoundation
                  ? `${calc.effectiveFoundationArea} m²${
                      form.floors === 2
                        ? isEn
                          ? ' (separate ground footprint for 2-storey building)'
                          : ' (отделна площ на стъпката за двуетажна сграда)'
                        : ''
                    }`
                  : isEn
                  ? 'Not included (prepared by client)'
                  : 'Не е включен (изпълнява се от клиента)',
                style: 'kvVal',
              },
            ],
            [
              {
                text: isEn ? 'Wall & ceiling height' : 'Височина на стените и таван',
                style: 'kvLabel',
              },
              {
                text: `${R.wallHeightLabel}  |  ${R.ceilingLabel}`,
                style: 'kvVal',
              },
            ],
            [
              { text: isEn ? 'Roof' : 'Покрив', style: 'kvLabel' },
              { text: R.roofLabel, style: 'kvVal' },
            ],
            [
              {
                text: isEn ? 'Windows & Joinery' : 'Дограма и стъклопакет',
                style: 'kvLabel',
              },
              { text: R.winFullLabel, style: 'kvVal' },
            ],
            [
              { text: isEn ? 'Facade' : 'Фасада', style: 'kvLabel' },
              { text: R.facadeLabel, style: 'kvVal' },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#e2e8f0',
          vLineColor: () => '#e2e8f0',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 3.2,
          paddingBottom: () => 3.2,
        },
      },

      sectionTitle('02', isEn ? 'PRICE' : 'ЦЕНА'),
      {
        table: {
          headerRows: 1,
          widths: ['*', 62, 68, 86],
          body: priceBody,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4.2,
          paddingBottom: () => 4.2,
        },
      },
      {
        text: isEn
          ? `Note: This offer is valid for ${form.validityDays} days from issue date. All structure prices include 20% VAT, manufacturing, delivery and assembly. Foundation is indicative (confirmed after site visit and geodetic survey — not part of the contract value).`
          : `Забележка: Офертата е валидна ${form.validityDays} дни от датата на издаване. Всички цени за конструкция са с включен 20% ДДС, производство, транспорт и монтаж. Фундаментът е с прогнозна стойност (уточнява се след оглед и геодезично заснемане — не е част от договорната стойност).`,
        fontSize: 7.5,
        italics: true,
        color: '#475569',
        margin: [0, 5, 0, 0],
      },

      // ==================== PAGE 2 ====================
      buildPageHeader(
        isEn
          ? 'Sections 03 & 04: Payment Schedule, Delivery Terms & Company Bank Details'
          : 'Раздел 03 & 04: Схема на плащане, срокове за изпълнение и банкови данни',
        true
      ),

      sectionTitle('03', isEn ? 'PAYMENT & TERMS' : 'ПЛАЩАНЕ И СРОКОВЕ'),
      {
        table: {
          headerRows: 1,
          widths: ['*', 65, 95],
          body: [
            [
              {
                text: isEn
                  ? 'Payment Stage (based on Shell Structure Contract Value)'
                  : 'Етап на плащане (по Договорна стойност за груб строеж)',
                style: 'th',
              },
              { text: isEn ? 'Share' : 'Дял', style: 'th', alignment: 'right' },
              {
                text: isEn ? 'Amount (EUR)' : 'Сума (EUR)',
                style: 'th',
                alignment: 'right',
              },
            ],
            [
              {
                text: isEn
                  ? 'Stage 1: On signing the contract'
                  : 'При подписване на договора',
                fontSize: 9,
                bold: true,
              },
              { text: '50%', alignment: 'right', bold: true, fontSize: 9 },
              {
                text: formatEur(calc.paymentStages.stage1_50),
                alignment: 'right',
                bold: true,
                fontSize: 9,
              },
            ],
            [
              {
                text: isEn
                  ? 'Stage 2: On dispatch of the goods from the factory to the customer’s plot'
                  : 'При експедиция на стоката от фабриката към парцела на клиента',
                fontSize: 9,
                bold: true,
              },
              { text: '40%', alignment: 'right', bold: true, fontSize: 9 },
              {
                text: formatEur(calc.paymentStages.stage2_40),
                alignment: 'right',
                bold: true,
                fontSize: 9,
              },
            ],
            [
              {
                text: isEn
                  ? 'Stage 3: After completion of the construction and assembly works'
                  : 'След завършване на строително-монтажните работи',
                fontSize: 9,
                bold: true,
              },
              { text: '10%', alignment: 'right', bold: true, fontSize: 9 },
              {
                text: formatEur(calc.paymentStages.stage3_10),
                alignment: 'right',
                bold: true,
                fontSize: 9,
              },
            ],
            [
              {
                text: isEn
                  ? 'Total Contract Value for Shell Structure („до тапа“)'
                  : 'Общо по договор за груб строеж („до тапа“)',
                bold: true,
                fillColor: '#f1f5f9',
                fontSize: 9,
              },
              {
                text: '100%',
                alignment: 'right',
                bold: true,
                fillColor: '#f1f5f9',
                fontSize: 9,
              },
              {
                text: formatEur(calc.contractStructureNet),
                alignment: 'right',
                bold: true,
                fillColor: '#f1f5f9',
                fontSize: 9.5,
                color: '#1e1b4b',
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1',
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
      },
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    text: COMPANY_INFO.deliveryTerm[lang],
                    bold: true,
                    fontSize: 9.5,
                    color: '#1e1b4b',
                  },
                  {
                    text: isEn
                      ? 'The price covers factory manufacturing, delivery to the customer’s plot and complete assembly. Payment stages (50% / 40% / 10%) are calculated strictly on the Shell Structure Contract Value.'
                      : 'Цената включва фабрично производство, доставка до парцела на клиента и пълен монтаж. Платежните траншове (50% / 40% / 10%) са изчислени върху договорната стойност за груб строеж.',
                    fontSize: 8,
                    color: '#475569',
                    margin: [0, 2, 0, 0],
                  },
                ],
                fillColor: '#eef2ff',
                margin: [8, 6, 8, 6],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 6, 0, 8],
      },

      ...(form.customNotes
        ? [
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: isEn
                        ? `Additional Notes: ${form.customNotes}`
                        : `Допълнителни бележки към офертата: ${form.customNotes}`,
                      fontSize: 8.5,
                      fillColor: '#fffbeb',
                      color: '#92400e',
                      margin: [8, 5, 8, 5],
                    },
                  ],
                ],
              },
              layout: 'noBorders',
              margin: [0, 0, 0, 8],
            },
          ]
        : []),

      sectionTitle(
        '04',
        isEn ? 'COMPANY & BANK DETAILS' : 'ФИРМЕНИ И БАНКОВИ ДАННИ'
      ),
      {
        table: {
          widths: ['26%', '74%'],
          body: [
            [
              { text: isEn ? 'Company' : 'Дружество', style: 'kvLabel' },
              {
                text: isEn ? COMPANY_INFO.legalNameEn : COMPANY_INFO.legalName,
                style: 'kvVal',
              },
            ],
            [
              { text: isEn ? 'Company ID (ЕИК)' : 'ЕИК', style: 'kvLabel' },
              { text: COMPANY_INFO.eik, style: 'kvVal' },
            ],
            [
              { text: isEn ? 'VAT No (ДДС №)' : 'ДДС №', style: 'kvLabel' },
              { text: COMPANY_INFO.vatNo, style: 'kvVal' },
            ],
            [
              { text: isEn ? 'Bank' : 'Банка', style: 'kvLabel' },
              {
                text: isEn ? COMPANY_INFO.bankNameEn : COMPANY_INFO.bankName,
                style: 'kvVal',
              },
            ],
            [
              { text: 'IBAN', style: 'kvLabel' },
              { text: COMPANY_INFO.iban, style: 'kvVal', color: '#1B365D' },
            ],
            [
              { text: 'BIC', style: 'kvLabel' },
              { text: COMPANY_INFO.bic, style: 'kvVal' },
            ],
            [
              { text: isEn ? 'Sofia Office' : 'Офис София', style: 'kvLabel' },
              {
                text: isEn
                  ? COMPANY_INFO.addressSofiaEn
                  : COMPANY_INFO.addressSofia,
                style: 'kvVal',
              },
            ],
            [
              {
                text: isEn ? 'Burgas Office' : 'Офис Бургас',
                style: 'kvLabel',
              },
              {
                text: isEn
                  ? COMPANY_INFO.addressBurgasEn
                  : COMPANY_INFO.addressBurgas,
                style: 'kvVal',
              },
            ],
            [
              { text: isEn ? 'Phones' : 'Телефони', style: 'kvLabel' },
              { text: COMPANY_INFO.phones.join(', '), style: 'kvVal' },
            ],
            [
              { text: isEn ? 'Email & Web' : 'Имейл и Уеб', style: 'kvLabel' },
              {
                text: `${COMPANY_INFO.email}  |  ${COMPANY_INFO.website}`,
                style: 'kvVal',
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#e2e8f0',
          vLineColor: () => '#e2e8f0',
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 4.5,
          paddingBottom: () => 4.5,
        },
      },

      // ==================== PAGE 3 ====================
      buildPageHeader(
        isEn
          ? `Section 05: Technical Specification — ${R.systemName}`
          : `Раздел 05: Техническа спецификация — ${R.systemName}`,
        true
      ),

      sectionTitle(
        '05',
        isEn
          ? 'SPECIFICATION OF THE SELECTED SYSTEM'
          : 'СПЕЦИФИКАЦИЯ НА ИЗБРАНАТА СИСТЕМА'
      ),
      {
        table: {
          headerRows: 1,
          widths: ['26%', '74%'],
          body: [
            [
              { text: isEn ? 'Element' : 'Елемент', style: 'th' },
              {
                text: isEn
                  ? 'Technical Specification & Description'
                  : 'Техническа спецификация и описание',
                style: 'th',
              },
            ],
            ...calc.specRows.map((row, idx) => [
              {
                text: row.element,
                bold: true,
                fontSize: 8.5,
                color: '#1e1b4b',
                fillColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
              },
              {
                text: row.spec,
                fontSize: 8.3,
                color: '#1e293b',
                fillColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
              },
            ]),
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },

      // ==================== PAGE 4 ====================
      buildPageHeader(
        isEn
          ? 'Sections 06 & 07: Scope of Offer & Customer Responsibility'
          : 'Раздел 06 & 07: Обхват на офертата и отговорност на клиента',
        true
      ),

      sectionTitle('06', isEn ? 'SCOPE OF THE OFFER' : 'ОБХВАТ НА ОФЕРТАТА'),
      calc.hasTurnkey
        ? {
            table: {
              headerRows: 1,
              widths: ['100%'],
              body: [
                [
                  {
                    text: isEn
                      ? '✓ Included in the price (Structure + Turnkey Package)'
                      : '✓ Включено в цената (Конструкция + Пакет „До ключ“)',
                    bold: true,
                    fontSize: 9,
                    color: '#ffffff',
                    fillColor: '#15803d',
                  },
                ],
                [
                  {
                    stack: calc.includedScope.map((item) => ({
                      text: `✓  ${item}`,
                      fontSize: 8.2,
                      color: '#14532d',
                      margin: [0, 2, 0, 2],
                    })),
                    fillColor: '#f0fdf4',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#cbd5e1',
              vLineColor: () => '#cbd5e1',
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
          }
        : {
            table: {
              headerRows: 1,
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: isEn
                      ? '✓ Included in the price'
                      : '✓ Включено в цената',
                    bold: true,
                    fontSize: 9,
                    color: '#ffffff',
                    fillColor: '#15803d',
                  },
                  {
                    text: isEn
                      ? '• Excluded — customer’s responsibility'
                      : '• Не включва — за сметка на клиента',
                    bold: true,
                    fontSize: 9,
                    color: '#ffffff',
                    fillColor: '#b91c1c',
                  },
                ],
                [
                  {
                    stack: calc.includedScope.map((item) => ({
                      text: `✓  ${item}`,
                      fontSize: 8.2,
                      color: '#14532d',
                      margin: [0, 2, 0, 2],
                    })),
                    fillColor: '#f0fdf4',
                  },
                  {
                    stack: calc.excludedScope.map((item) => ({
                      text: `•  ${item}`,
                      fontSize: 8.2,
                      color: '#7f1d1d',
                      margin: [0, 2, 0, 2],
                    })),
                    fillColor: '#fef2f2',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#cbd5e1',
              vLineColor: () => '#cbd5e1',
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
          },
      {
        text: calc.hasTurnkey
          ? isEn
            ? `Active Turnkey Package (${calc.turnkeyName}): all finishing works covered by the package have been automatically moved to “Included in the price”.`
            : `Активен пакет „До ключ“ (${calc.turnkeyName}): довършителните дейности са автоматично прехвърлени в графа „Включено в цената“.`
          : isEn
          ? 'Items in the right-hand column are carried out by Flexi Home only when explicitly selected by the customer via a Turnkey package or separate agreement.'
          : 'Позициите в дясната колона се изпълняват от Flexi Home само когато са изрично избрани от клиента чрез допълнителен пакет „До ключ“ или индивидуално договаряне.',
        fontSize: 7.8,
        italics: true,
        color: '#475569',
        margin: [0, 5, 0, 10],
      },

      sectionTitle(
        '07',
        isEn ? 'CUSTOMER RESPONSIBILITY' : 'ОТГОВОРНОСТ НА КЛИЕНТА'
      ),
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: CUSTOMER_RESPONSIBILITY[lang],
                fontSize: 8.8,
                color: '#1e293b',
                fillColor: '#f8fafc',
                margin: [8, 7, 8, 7],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1',
        },
        margin: [0, 0, 0, 24],
      },

      {
        columns: [
          {
            width: '46%',
            stack: [
              {
                text: isEn
                  ? 'For the Contractor („С 1 ТРЕЙД“ ЕООД):'
                  : 'За Изпълнителя („С 1 ТРЕЙД“ ЕООД):',
                bold: true,
                fontSize: 8.5,
                color: '#334155',
              },
              {
                text: '............................................................',
                margin: [0, 22, 0, 2],
                color: '#94a3b8',
              },
              {
                text: isEn
                  ? 'Signature & Stamp / FLEXI HOME'
                  : 'Подпис и печат / FLEXI HOME',
                fontSize: 7.5,
                color: '#64748b',
              },
            ],
          },
          { width: '8%', text: '' },
          {
            width: '46%',
            stack: [
              {
                text: isEn
                  ? 'For the Customer (Client):'
                  : 'За Възложителя (Клиент):',
                bold: true,
                fontSize: 8.5,
                color: '#334155',
              },
              {
                text: '............................................................',
                margin: [0, 22, 0, 2],
                color: '#94a3b8',
              },
              {
                text:
                  form.clientName ||
                  (isEn ? 'Customer Name & Signature' : 'Име и подпис на клиента'),
                fontSize: 7.5,
                color: '#64748b',
              },
            ],
          },
        ],
      },
    ],
  };

  const filename = formatOfferFilename(form);
  pdfMake.createPdf(docDefinition).download(filename);
}
