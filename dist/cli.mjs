#!/usr/bin/env node

// src/cli/index.ts
import fs3 from "node:fs";
import path3 from "node:path";
import readline from "node:readline";

// src/cli/offerService.ts
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// src/lib/constants.ts
var COMPANY_INFO = {
  brand: "FLEXI HOME",
  website: "flexi-home.eu",
  legalName: "\u201E\u0421 1 \u0422\u0420\u0415\u0419\u0414\u201C \u0415\u041E\u041E\u0414",
  legalNameEn: "\u201CS 1 TRADE\u201D EOOD (\xAB\u0421 1 \u0422\u0420\u0415\u0419\u0414\xBB \u0415\u041E\u041E\u0414)",
  eik: "208574942",
  vatNo: "BG208574942",
  bankName: "\u041F\u043E\u0449\u0435\u043D\u0441\u043A\u0430 \u0431\u0430\u043D\u043A\u0430",
  bankNameEn: "Postbank (\u041F\u043E\u0449\u0435\u043D\u0441\u043A\u0430 \u0431\u0430\u043D\u043A\u0430)",
  iban: "BG46BPB179421429170001",
  bic: "BPBIBGSF",
  addressSofia: "\u0431\u0443\u043B. \u0410\u043B\u0435\u043A\u0441\u0430\u043D\u0434\u044A\u0440 \u0421\u0442\u0430\u043C\u0431\u043E\u043B\u0438\u0439\u0441\u043A\u0438 84, \u0441\u0433\u0440\u0430\u0434\u0430 Urban Model, \u0435\u0442. 10, \u043E\u0444\u0438\u0441 53, \u0421\u043E\u0444\u0438\u044F 1303",
  addressSofiaEn: "84 Aleksandar Stamboliyski Blvd, Urban Model Bldg, fl. 10, office 53, Sofia 1303",
  addressBurgas: "\u0443\u043B. \u0412\u0430\u0441\u0438\u043B \u0410\u043F\u0440\u0438\u043B\u043E\u0432 16, \u0435\u0442. 2, \u043E\u0444\u0438\u0441 8, \u0411\u0443\u0440\u0433\u0430\u0441",
  addressBurgasEn: "16 Vasil Aprilov Str., fl. 2, office 8, Burgas",
  phones: ["+359 899 890085", "+359 887 604 360"],
  email: "flexihome@abv.bg",
  currency: "EUR",
  priceBasis: {
    bg: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E, \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438 \u043C\u043E\u043D\u0442\u0430\u0436",
    en: "Manufacturing, delivery and on-site assembly"
  },
  deliveryTerm: {
    bg: "\u0421\u0440\u043E\u043A \u0437\u0430 \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D\u0438\u0435: 30-40 \u0434\u043D\u0438 \u0441\u043B\u0435\u0434 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438 \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0437\u0430 \u0441\u0442\u0440\u043E\u0435\u0436",
    en: "Delivery & assembly time: 30-40 days after approved designs and building permit"
  },
  foundationDisclaimer: {
    bg: "\u043F\u0440\u043E\u0433\u043D\u043E\u0437\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442, \u0443\u0442\u043E\u0447\u043D\u044F\u0432\u0430 \u0441\u0435 \u0441\u043B\u0435\u0434 \u043E\u0433\u043B\u0435\u0434 \u0438 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u043D\u043E \u0437\u0430\u0441\u043D\u0435\u043C\u0430\u043D\u0435 \u2014 \u043D\u0435 \u0435 \u0447\u0430\u0441\u0442 \u043E\u0442 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u043D\u0430\u0442\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442",
    en: "indicative value, confirmed after site visit and geodetic survey \u2014 not part of the contract value"
  }
};
var DEFAULT_PRICING_CONFIG = {
  press_standard: {
    floor1: {
      upTo50: 420,
      from51To70: 400,
      from71To90: 380,
      from91To120: 360,
      over120: 360
    },
    floor2Default: 489,
    floor2Alt: 515
  },
  press_economy: {
    flatRate: 280
  },
  steel_frame: {
    floor1: {
      upTo50: 590,
      from51To70: 562,
      from71To90: 534,
      from91To120: 506,
      over120: 506
    },
    floor2: 600
  },
  reinforced_metal: {
    floor1: {
      upTo50: 750,
      from51To70: 714,
      from71To90: 679,
      from91To120: 643,
      over120: 643
    },
    floor2: 729
  },
  foundationRate: 140,
  turnkeyRates: {
    standard: 420,
    luxury_680: 680
  }
};
var CATALOG_MODELS = [
  // Single-Storey (Едноетажни MK-1)
  {
    id: "e40",
    code: "MK-1",
    area: 40,
    floors: 1,
    bedrooms: 1,
    footprint: 40,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430+\u043A\u0443\u0445\u043D\u044F 19\u043C\xB2, 1 \u0441\u043F\u0430\u043B\u043D\u044F (10\u043C\xB2), \u0431\u0430\u043D\u044F+WC 4\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 2\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 5\u043C\xB2",
    summaryEn: "Living+kitchen 19m\xB2, 1 bedroom (10m\xB2), bath+WC 4m\xB2, hall 2m\xB2, veranda 5m\xB2"
  },
  {
    id: "e49",
    code: "MK-1",
    area: 49,
    floors: 1,
    bedrooms: 2,
    footprint: 49,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430+\u043A\u0443\u0445\u043D\u044F 17\u043C\xB2, 2 \u0441\u043F\u0430\u043B\u043D\u0438 (2\xD710\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 2\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 5\u043C\xB2",
    summaryEn: "Living+kitchen 17m\xB2, 2 bedrooms (2\xD710m\xB2), bath+WC 5m\xB2, hall 2m\xB2, veranda 5m\xB2"
  },
  {
    id: "e52",
    code: "MK-1",
    area: 52,
    floors: 1,
    bedrooms: 2,
    footprint: 52,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430+\u043A\u0443\u0445\u043D\u044F 20\u043C\xB2, 2 \u0441\u043F\u0430\u043B\u043D\u0438 (2\xD710\u043C\xB2), \u0431\u0430\u043D\u044F+WC 4\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 6\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 2\u043C\xB2",
    summaryEn: "Living+kitchen 20m\xB2, 2 bedrooms (2\xD710m\xB2), bath+WC 4m\xB2, hall 6m\xB2, veranda 2m\xB2"
  },
  {
    id: "e62",
    code: "MK-1",
    area: 62,
    floors: 1,
    bedrooms: 2,
    footprint: 62,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 18\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 7\u043C\xB2, 2 \u0441\u043F\u0430\u043B\u043D\u0438 (12+10\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 3\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 7\u043C\xB2",
    summaryEn: "Living 18m\xB2, kitchen 7m\xB2, 2 bedrooms (12+10m\xB2), bath+WC 5m\xB2, hall 3m\xB2, veranda 7m\xB2"
  },
  {
    id: "e72",
    code: "MK-1",
    area: 72,
    floors: 1,
    bedrooms: 2,
    footprint: 72,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 17\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 12\u043C\xB2, 2 \u0441\u043F\u0430\u043B\u043D\u0438 (12+15\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 7\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 4\u043C\xB2",
    summaryEn: "Living 17m\xB2, kitchen 12m\xB2, 2 bedrooms (12+15m\xB2), bath+WC 5m\xB2, hall 7m\xB2, veranda 4m\xB2"
  },
  {
    id: "e81",
    code: "MK-1",
    area: 81,
    floors: 1,
    bedrooms: 3,
    footprint: 81,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 17\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 6\u043C\xB2, 3 \u0441\u043F\u0430\u043B\u043D\u0438 (12+15+10\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 12\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 4\u043C\xB2",
    summaryEn: "Living 17m\xB2, kitchen 6m\xB2, 3 bedrooms (12+15+10m\xB2), bath+WC 5m\xB2, hall 12m\xB2, veranda 4m\xB2"
  },
  {
    id: "e85",
    code: "MK-1",
    area: 85,
    floors: 1,
    bedrooms: 2,
    footprint: 85,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 19\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 10\u043C\xB2, 2 \u0441\u043F\u0430\u043B\u043D\u0438 (10+15\u043C\xB2), \u0431\u0430\u043D\u044F+WC 6\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 11\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 14\u043C\xB2",
    summaryEn: "Living 19m\xB2, kitchen 10m\xB2, 2 bedrooms (10+15m\xB2), bath+WC 6m\xB2, hall 11m\xB2, veranda 14m\xB2"
  },
  {
    id: "e92",
    code: "MK-1",
    area: 92,
    floors: 1,
    bedrooms: 3,
    footprint: 92,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 19\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 10\u043C\xB2, 3 \u0441\u043F\u0430\u043B\u043D\u0438 (10+11+15\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 11\u043C\xB2, 2 \u0432\u0435\u0440\u0430\u043D\u0434\u0438",
    summaryEn: "Living 19m\xB2, kitchen 10m\xB2, 3 bedrooms (10+11+15m\xB2), bath+WC 5m\xB2, hall 11m\xB2, 2 verandas"
  },
  {
    id: "e100",
    code: "MK-1",
    area: 100,
    floors: 1,
    bedrooms: 2,
    footprint: 100,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 29\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 10\u043C\xB2, 2 \u0441\u043F\u0430\u043B\u043D\u0438 (2\xD715\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 10\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 15\u043C\xB2",
    summaryEn: "Living 29m\xB2, kitchen 10m\xB2, 2 bedrooms (2\xD715m\xB2), bath+WC 5m\xB2, hall 10m\xB2, veranda 15m\xB2"
  },
  {
    id: "e103",
    code: "MK-1",
    area: 103,
    floors: 1,
    bedrooms: 3,
    footprint: 103,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 24\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 12\u043C\xB2, 3 \u0441\u043F\u0430\u043B\u043D\u0438 (15+10+10\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 13\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 14\u043C\xB2",
    summaryEn: "Living 24m\xB2, kitchen 12m\xB2, 3 bedrooms (15+10+10m\xB2), bath+WC 5m\xB2, hall 13m\xB2, veranda 14m\xB2"
  },
  {
    id: "e114",
    code: "MK-1",
    area: 114,
    floors: 1,
    bedrooms: 3,
    footprint: 114,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 25\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 12\u043C\xB2, 3 \u0441\u043F\u0430\u043B\u043D\u0438 (15+17+14\u043C\xB2), \u0431\u0430\u043D\u044F+WC 6\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 11\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 13\u043C\xB2",
    summaryEn: "Living 25m\xB2, kitchen 12m\xB2, 3 bedrooms (15+17+14m\xB2), bath+WC 6m\xB2, hall 11m\xB2, veranda 13m\xB2"
  },
  {
    id: "e131",
    code: "MK-1",
    area: 131,
    floors: 1,
    bedrooms: 4,
    footprint: 131,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 27\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 12\u043C\xB2, 4 \u0441\u043F\u0430\u043B\u043D\u0438 (17+14+12+20\u043C\xB2), \u0431\u0430\u043D\u044F+WC 8\u043C\xB2, \u043E\u0442\u0434. WC 3\u043C\xB2, \u0430\u043D\u0442\u0440\u0435 18\u043C\xB2",
    summaryEn: "Living 27m\xB2, kitchen 12m\xB2, 4 bedrooms (17+14+12+20m\xB2), bath+WC 8m\xB2, WC 3m\xB2, hall 18m\xB2"
  },
  {
    id: "e149",
    code: "MK-1",
    area: 149,
    floors: 1,
    bedrooms: 4,
    footprint: 149,
    summaryBg: "\u0414\u043D\u0435\u0432\u043D\u0430 34\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 12\u043C\xB2, 4 \u0441\u043F\u0430\u043B\u043D\u0438 (10+12+14+18\u043C\xB2), \u0431\u0430\u043D\u044F+WC 5\u043C\xB2, WC 4\u043C\xB2, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 22\u043C\xB2",
    summaryEn: "Living 34m\xB2, kitchen 12m\xB2, 4 bedrooms (10+12+14+18m\xB2), bath+WC 5m\xB2, WC 4m\xB2, veranda 22m\xB2"
  },
  // Two-Storey (Двуетажни MK-2)
  {
    id: "d90",
    code: "MK-2",
    area: 90,
    floors: 2,
    bedrooms: 2,
    footprint: 45,
    summaryBg: "\u0415\u0442.1: \u0414\u043D\u0435\u0432\u043D\u0430+\u043A\u0443\u0445\u043D\u044F 30\u043C\xB2, \u0430\u043D\u0442\u0440\u0435, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 | \u0415\u0442.2: 2 \u0441\u043F\u0430\u043B\u043D\u0438 (2\xD717\u043C\xB2), \u0431\u0430\u043D\u044F+WC, \u0442\u0435\u0440\u0430\u0441\u0430",
    summaryEn: "Fl.1: Living+kitchen 30m\xB2, hall, veranda | Fl.2: 2 bedrooms (2\xD717m\xB2), bath+WC, terrace"
  },
  {
    id: "d100",
    code: "MK-2",
    area: 100,
    floors: 2,
    bedrooms: 2,
    footprint: 50,
    summaryBg: "\u0415\u0442.1: \u0414\u043D\u0435\u0432\u043D\u0430+\u043A\u0443\u0445\u043D\u044F 32\u043C\xB2, WC, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 7\u043C\xB2 | \u0415\u0442.2: 2 \u0441\u043F\u0430\u043B\u043D\u0438 (2\xD715\u043C\xB2), \u0431\u0430\u043D\u044F+WC, \u0442\u0435\u0440\u0430\u0441\u0430",
    summaryEn: "Fl.1: Living+kitchen 32m\xB2, WC, veranda 7m\xB2 | Fl.2: 2 bedrooms (2\xD715m\xB2), bath+WC, terrace"
  },
  {
    id: "d101",
    code: "MK-2",
    area: 101,
    floors: 2,
    bedrooms: 3,
    footprint: 51,
    summaryBg: "\u0415\u0442.1: \u0414\u043D\u0435\u0432\u043D\u0430 20\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 6\u043C\xB2, 1 \u0441\u043F\u0430\u043B\u043D\u044F, WC, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 15\u043C\xB2 | \u0415\u0442.2: 2 \u0441\u043F\u0430\u043B\u043D\u0438 (10+20\u043C\xB2), \u0431\u0430\u043D\u044F+WC",
    summaryEn: "Fl.1: Living 20m\xB2, kitchen 6m\xB2, 1 bedroom, WC, veranda 15m\xB2 | Fl.2: 2 bedrooms (10+20m\xB2), bath+WC"
  },
  {
    id: "d128",
    code: "MK-2",
    area: 128,
    floors: 2,
    bedrooms: 2,
    footprint: 64,
    summaryBg: "\u0415\u0442.1: \u0414\u043D\u0435\u0432\u043D\u0430 24\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 15\u043C\xB2, \u0431\u0430\u043D\u044F+WC, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 10\u043C\xB2 | \u0415\u0442.2: 2 \u0441\u043F\u0430\u043B\u043D\u0438 (2\xD715\u043C\xB2), \u0431\u0430\u043D\u044F+WC, \u0442\u0435\u0440\u0430\u0441\u0430 10\u043C\xB2",
    summaryEn: "Fl.1: Living 24m\xB2, kitchen 15m\xB2, bath+WC, veranda 10m\xB2 | Fl.2: 2 bedrooms (2\xD715m\xB2), bath+WC, terrace 10m\xB2"
  },
  {
    id: "d136",
    code: "MK-2",
    area: 136,
    floors: 2,
    bedrooms: 3,
    footprint: 68,
    summaryBg: "\u0415\u0442.1: \u0414\u043D\u0435\u0432\u043D\u0430 28\u043C\xB2, \u043A\u0443\u0445\u043D\u044F 15\u043C\xB2, \u0431\u0430\u043D\u044F+WC, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 9\u043C\xB2 | \u0415\u0442.2: 3 \u0441\u043F\u0430\u043B\u043D\u0438 (12+18+13\u043C\xB2), \u0431\u0430\u043D\u044F+WC, \u0442\u0435\u0440\u0430\u0441\u0430",
    summaryEn: "Fl.1: Living 28m\xB2, kitchen 15m\xB2, bath+WC, veranda 9m\xB2 | Fl.2: 3 bedrooms (12+18+13m\xB2), bath+WC, terrace"
  },
  {
    id: "d145",
    code: "MK-2",
    area: 145,
    floors: 2,
    bedrooms: 3,
    footprint: 73,
    summaryBg: "\u0415\u0442.1: \u0414\u043D\u0435\u0432\u043D\u0430+\u043A\u0443\u0445\u043D\u044F 38\u043C\xB2, 1 \u0441\u043F\u0430\u043B\u043D\u044F 15\u043C\xB2, \u0431\u0430\u043D\u044F+WC, \u0432\u0435\u0440\u0430\u043D\u0434\u0430 9\u043C\xB2 | \u0415\u0442.2: 2 \u0441\u043F\u0430\u043B\u043D\u0438 (12+20\u043C\xB2), \u0431\u0430\u043D\u044F+WC, WC, \u0442\u0435\u0440\u0430\u0441\u0430",
    summaryEn: "Fl.1: Living+kitchen 38m\xB2, 1 bedroom 15m\xB2, bath+WC, veranda 9m\xB2 | Fl.2: 2 bedrooms (12+20m\xB2), bath+WC, WC, terrace"
  }
];
var SYSTEM_META = {
  press_standard: {
    name: {
      bg: "\u041F\u0440\u0435\u0441 \u043F\u0430\u043D\u0435\u043B \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442",
      en: "Press-Panel Standard (\u041F\u0440\u0435\u0441 \u043F\u0430\u043D\u0435\u043B \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442)"
    },
    shortDesc: {
      bg: "16 \u0441\u043C \u0432\u044A\u043D\u0448\u043D\u0438 / 10 \u0441\u043C \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438, EPS \u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F, \u0434\u0432\u0443\u043B\u0438\u0446\u0435\u0432 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442",
      en: "16 cm ext. / 10 cm int. walls, EPS insulation, double-faced fibre-cement"
    },
    wallSpec: {
      bg: "\u0414\u0432\u0443\u043B\u0438\u0446\u0435\u0432\u0438 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 + EPS \u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F \u2014 \u0412\u044A\u043D\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: 160 \u043C\u043C (10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442 + 140 \u043C\u043C EPS + 10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442); \u041F\u0440\u0435\u0433\u0440\u0430\u0434\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: 100 \u043C\u043C (10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442 + 80 \u043C\u043C EPS + 10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442)",
      en: "Double-faced fibre-cement panels + EPS insulation \u2014 External walls: 160 mm (10 mm fibre-cement + 140 mm EPS + 10 mm fibre-cement); Internal walls: 100 mm (10 mm fibre-cement + 80 mm EPS + 10 mm fibre-cement)"
    }
  },
  press_economy: {
    name: {
      bg: "\u041F\u0440\u0435\u0441 \u043F\u0430\u043D\u0435\u043B \u0438\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u043D",
      en: "Press-Panel Economy (\u041F\u0440\u0435\u0441 \u043F\u0430\u043D\u0435\u043B \u0438\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u043D)"
    },
    shortDesc: {
      bg: "\u0418\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u0430 \u0441\u0435\u0440\u0438\u044F \u043F\u0440\u0435\u0441 \u043F\u0430\u043D\u0435\u043B (16 \u0441\u043C \u0432\u044A\u043D\u0448\u043D\u0438 / 10 \u0441\u043C \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438, EPS)",
      en: "Economy series press-panel system (16 cm ext. / 10 cm int. walls, EPS)"
    },
    wallSpec: {
      bg: "\u0418\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u0430 \u0441\u0435\u0440\u0438\u044F \u0434\u0432\u0443\u043B\u0438\u0446\u0435\u0432\u0438 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441 EPS \u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F \u2014 \u0412\u044A\u043D\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: 160 \u043C\u043C; \u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u043F\u0440\u0435\u0433\u0440\u0430\u0434\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: 100 \u043C\u043C",
      en: "Economy series double-faced fibre-cement panels with EPS insulation \u2014 External walls: 160 mm; Internal partition walls: 100 mm"
    }
  },
  steel_frame: {
    name: {
      bg: "\u041A\u0430\u0440\u043A\u0430\u0441 (\u0441\u0442\u043E\u043C\u0430\u043D\u0435\u043D\u0430)",
      en: "Steel Frame \u2014 \u041A\u0430\u0440\u043A\u0430\u0441 (\u0441\u0442\u043E\u043C\u0430\u043D\u0435\u043D\u0430)"
    },
    shortDesc: {
      bg: "14 \u0441\u043C \u0432\u044A\u043D\u0448\u043D\u0438 / 8 \u0441\u043C \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438, \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430, \u0441\u0442\u043E\u043C\u0430\u043D\u0435\u043D \u043A\u0430\u0440\u043A\u0430\u0441",
      en: "14 cm ext. / 8 cm int. walls, rock wool insulation, steel frame structure"
    },
    wallSpec: {
      bg: "\u0421\u0442\u043E\u043C\u0430\u043D\u0435\u043D\u0430 \u043A\u0430\u0440\u043A\u0430\u0441\u043D\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u0441 \u0434\u0432\u0443\u043B\u0438\u0446\u0435\u0432\u0438 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u0438 \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 \u2014 \u0414\u0435\u0431\u0435\u043B\u0438\u043D\u0430 \u043D\u0430 \u0432\u044A\u043D\u0448\u043D\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0438: 14 \u0441\u043C; \u0414\u0435\u0431\u0435\u043B\u0438\u043D\u0430 \u043D\u0430 \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0438: 8 \u0441\u043C",
      en: "Steel frame structure with double-faced fibre-cement panels and rock wool \u2014 External wall thickness: 14 cm; Internal wall thickness: 8 cm"
    }
  },
  reinforced_metal: {
    name: {
      bg: "\u0423\u0441\u0438\u043B\u0435\u043D\u0430 \u043C\u0435\u0442\u0430\u043B\u043D\u0430",
      en: "Reinforced Metal \u2014 \u0423\u0441\u0438\u043B\u0435\u043D\u0430 \u043C\u0435\u0442\u0430\u043B\u043D\u0430"
    },
    shortDesc: {
      bg: "14 \u0441\u043C \u0432\u044A\u043D\u0448\u043D\u0438 / 8 \u0441\u043C \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438, \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430, \u0443\u0441\u0438\u043B\u0435\u043D\u0430 \u043F\u043E\u0446\u0438\u043D\u043A\u043E\u0432\u0430\u043D\u0430 \u0441\u0442\u043E\u043C\u0430\u043D\u0430",
      en: "14 cm ext. / 8 cm int. walls, rock wool, reinforced galvanised steel"
    },
    wallSpec: {
      bg: "\u0423\u0441\u0438\u043B\u0435\u043D\u0430 \u043F\u043E\u0446\u0438\u043D\u043A\u043E\u0432\u0430\u043D\u0430 \u043C\u0435\u0442\u0430\u043B\u043D\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F, \u0442\u043E\u043F\u043B\u043E- \u0438 \u0448\u0443\u043C\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u0430\u043D\u0430 \u0441 \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 (\u043E\u0442\u0432\u044A\u043D \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438, \u043E\u0442\u0432\u044A\u0442\u0440\u0435 \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D) \u2014 \u0412\u044A\u043D\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: 14 \u0441\u043C; \u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: 8 \u0441\u043C",
      en: "Reinforced galvanised steel structure, thermally & acoustically insulated with rock wool (fibre-cement exterior, plasterboard interior) \u2014 External walls: 14 cm; Internal walls: 8 cm"
    }
  }
};
var TURNKEY_META = {
  none: {
    label: {
      bg: "\u0411\u0435\u0437 \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C (\u0441\u0430\u043C\u043E \u0435\u0442\u0430\u043F \u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C)",
      en: "None \u2014 Shell Stage Only (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C)"
    },
    docName: {
      bg: "\u0411\u0435\u0437 \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C",
      en: "None (Shell Stage)"
    }
  },
  standard: {
    label: {
      bg: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442 (+420 \u20AC/m\xB2)",
      en: "Standard / \u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442 (+420 \u20AC/m\xB2)"
    },
    docName: {
      bg: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442",
      en: "Standard (\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442)"
    }
  },
  luxury_680: {
    label: {
      bg: "\u041B\u0443\u043A\u0441\u043E\u0437\u0435\u043D (+680 \u20AC/m\xB2)",
      en: "Luxury / \u041B\u0443\u043A\u0441\u043E\u0437\u0435\u043D (+680 \u20AC/m\xB2)"
    },
    docName: {
      bg: "\u041B\u0443\u043A\u0441\u043E\u0437\u0435\u043D",
      en: "Luxury (\u041B\u0443\u043A\u0441\u043E\u0437\u0435\u043D)"
    }
  },
  custom: {
    label: {
      bg: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u0435\u043D \u043F\u0430\u043A\u0435\u0442 (\u20AC/m\xB2)",
      en: "Custom Turnkey Rate (\u20AC/m\xB2)"
    },
    docName: {
      bg: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u0435\u043D \u043F\u0430\u043A\u0435\u0442",
      en: "Custom Package"
    }
  }
};
var ROOF_OPTIONS = [
  {
    key: "black",
    colorHex: "#33373b",
    ral: "RAL 9005",
    label: {
      bg: "\u0410\u043D\u0442\u0440\u0430\u0446\u0438\u0442\u043D\u043E \u0447\u0435\u0440\u0435\u043D (\u0427\u0435\u0440\u0435\u043D \xB7 RAL 9005)",
      en: "Anthracite Black (\u0427\u0435\u0440\u0435\u043D \xB7 RAL 9005)"
    },
    docVal: {
      bg: "\u0427\u0435\u0440\u0435\u043D (\u0410\u043D\u0442\u0440\u0430\u0446\u0438\u0442\u043D\u043E \u0447\u0435\u0440\u0435\u043D \xB7 RAL 9005)",
      en: "Black (Anthracite Black \xB7 RAL 9005)"
    }
  },
  {
    key: "red",
    colorHex: "#8d4136",
    ral: "RAL 3009",
    label: {
      bg: "\u041A\u0435\u0440\u0435\u043C\u0438\u0434\u0435\u043D\u043E \u0447\u0435\u0440\u0432\u0435\u043D (\u0427\u0435\u0440\u0432\u0435\u043D \xB7 RAL 3009)",
      en: "Tile Red (\u0427\u0435\u0440\u0432\u0435\u043D \xB7 RAL 3009)"
    },
    docVal: {
      bg: "\u0427\u0435\u0440\u0432\u0435\u043D (\u041A\u0435\u0440\u0435\u043C\u0438\u0434\u0435\u043D\u043E \u0447\u0435\u0440\u0432\u0435\u043D \xB7 RAL 3009)",
      en: "Red (Tile Red \xB7 RAL 3009)"
    }
  },
  {
    key: "green",
    colorHex: "#2f5843",
    ral: "RAL 6005",
    label: {
      bg: "\u0413\u043E\u0440\u0441\u043A\u043E \u0437\u0435\u043B\u0435\u043D (\u0417\u0435\u043B\u0435\u043D \xB7 RAL 6005)",
      en: "Forest Green (\u0417\u0435\u043B\u0435\u043D \xB7 RAL 6005)"
    },
    docVal: {
      bg: "\u0417\u0435\u043B\u0435\u043D (\u0413\u043E\u0440\u0441\u043A\u043E \u0437\u0435\u043B\u0435\u043D \xB7 RAL 6005)",
      en: "Green (Forest Green \xB7 RAL 6005)"
    }
  },
  {
    key: "white",
    colorHex: "#e9eae8",
    ral: "RAL 9002",
    label: {
      bg: "\u0421\u0438\u0432\u043E-\u0431\u044F\u043B (\u0411\u044F\u043B \xB7 RAL 9002)",
      en: "Grey-White (\u0411\u044F\u043B \xB7 RAL 9002)"
    },
    docVal: {
      bg: "\u0411\u044F\u043B (\u0421\u0438\u0432\u043E-\u0431\u044F\u043B \xB7 RAL 9002)",
      en: "White (Grey-White \xB7 RAL 9002)"
    }
  },
  {
    key: "unknown",
    colorHex: "#94a3b8",
    ral: "\u2014",
    label: {
      bg: "\u041D\u0435 \u0435 \u0443\u0442\u043E\u0447\u043D\u0435\u043D",
      en: "Undetermined"
    },
    docVal: {
      bg: "\u041D\u0435 \u0435 \u0443\u0442\u043E\u0447\u043D\u0435\u043D (\u043F\u043E \u0438\u0437\u0431\u043E\u0440 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430)",
      en: "Undetermined (to be selected)"
    }
  }
];
var WIN_COLOR_OPTIONS = [
  {
    key: "anthracite",
    colorHex: "#3a3f43",
    ral: "RAL 7016",
    label: {
      bg: "\u0410\u043D\u0442\u0440\u0430\u0446\u0438\u0442 (RAL 7016)",
      en: "Anthracite Grey (\u0410\u043D\u0442\u0440\u0430\u0446\u0438\u0442 \xB7 RAL 7016)"
    },
    docVal: {
      bg: "\u0410\u043D\u0442\u0440\u0430\u0446\u0438\u0442 (RAL 7016)",
      en: "Anthracite (RAL 7016)"
    }
  },
  {
    key: "oak",
    colorHex: "#96683f",
    ral: "Golden Oak",
    label: {
      bg: "\u0417\u043B\u0430\u0442\u0435\u043D \u0434\u044A\u0431 (\u0414\u044A\u0431)",
      en: "Golden Oak (\u0417\u043B\u0430\u0442\u0435\u043D \u0434\u044A\u0431)"
    },
    docVal: {
      bg: "\u0414\u044A\u0431 (\u0417\u043B\u0430\u0442\u0435\u043D \u0434\u044A\u0431)",
      en: "Golden Oak (\u0414\u044A\u0431)"
    }
  },
  {
    key: "white",
    colorHex: "#f5f4f1",
    ral: "RAL 9016",
    label: {
      bg: "\u0411\u044F\u043B (RAL 9016)",
      en: "Pure White (\u0411\u044F\u043B \xB7 RAL 9016)"
    },
    docVal: {
      bg: "\u0411\u044F\u043B (RAL 9016)",
      en: "White (RAL 9016)"
    }
  },
  {
    key: "unknown",
    colorHex: "#94a3b8",
    ral: "\u2014",
    label: {
      bg: "\u041D\u0435 \u0435 \u0443\u0442\u043E\u0447\u043D\u0435\u043D",
      en: "Undetermined"
    },
    docVal: {
      bg: "\u041D\u0435 \u0435 \u0443\u0442\u043E\u0447\u043D\u0435\u043D (\u043F\u043E \u0438\u0437\u0431\u043E\u0440 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430)",
      en: "Undetermined (to be selected)"
    }
  }
];
var WIN_PROFILE_OPTIONS = [
  {
    key: "pvc_5ch",
    label: {
      bg: "5-\u043A\u0430\u043C\u0435\u0440\u043D\u0430 PVC \u0434\u043E\u0433\u0440\u0430\u043C\u0430, 4 \u0441\u0435\u0437\u043E\u043D\u0430 (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442)",
      en: "5-chamber PVC joinery, 4-season (standard)"
    }
  },
  {
    key: "pvc_6ch",
    label: {
      bg: "6-\u043A\u0430\u043C\u0435\u0440\u043D\u0430 PVC \u0434\u043E\u0433\u0440\u0430\u043C\u0430, 4 \u0441\u0435\u0437\u043E\u043D\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "6-chamber PVC joinery, 4-season (optional)"
    }
  },
  {
    key: "pvc_7ch",
    label: {
      bg: "7-\u043A\u0430\u043C\u0435\u0440\u043D\u0430 PVC \u0434\u043E\u0433\u0440\u0430\u043C\u0430, 4 \u0441\u0435\u0437\u043E\u043D\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "7-chamber PVC joinery, 4-season (optional)"
    }
  },
  {
    key: "alu_thermal",
    label: {
      bg: "\u0410\u043B\u0443\u043C\u0438\u043D\u0438\u0435\u0432\u0430 \u0442\u0435\u0440\u043C\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u0430\u043D\u0430 \u0434\u043E\u0433\u0440\u0430\u043C\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "Thermal-break aluminium joinery (optional)"
    }
  }
];
var WIN_GLAZING_OPTIONS = [
  {
    key: "double",
    label: {
      bg: "\u0414\u0432\u043E\u0435\u043D \u0441\u0442\u044A\u043A\u043B\u043E\u043F\u0430\u043A\u0435\u0442 (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442, 4 \u0441\u0435\u0437\u043E\u043D\u0430)",
      en: "Double glazing (standard, 4-season)"
    }
  },
  {
    key: "triple",
    label: {
      bg: "\u0422\u0440\u043E\u0435\u043D \u0441\u0442\u044A\u043A\u043B\u043E\u043F\u0430\u043A\u0435\u0442 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440, \u0432\u0438\u0441\u043E\u043A\u043E\u0435\u043D\u0435\u0440\u0433\u0438\u0435\u043D)",
      en: "Triple glazing (optional, high-efficiency)"
    }
  },
  {
    key: "double_frosted",
    label: {
      bg: "\u0414\u0432\u043E\u0435\u043D \u0441\u0442\u044A\u043A\u043B\u043E\u043F\u0430\u043A\u0435\u0442 + \u043C\u0430\u0442\u0438\u0440\u0430\u043D\u043E \u0441\u0442\u044A\u043A\u043B\u043E \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442",
      en: "Double glazing + frosted glass per project"
    }
  }
];
var FACADE_OPTIONS = [
  {
    key: "panel_smooth",
    label: {
      bg: "\u0424\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u2014 \u0433\u043B\u0430\u0434\u044A\u043A (\u0431\u043E\u044F\u0434\u0438\u0441\u0430\u043D)",
      en: "Fibre-cement panels \u2014 smooth (painted)"
    },
    docVal: {
      bg: "\u0424\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 (\u0433\u043B\u0430\u0434\u044A\u043A / \u0431\u043E\u044F\u0434\u0438\u0441\u0430\u043D)",
      en: "Fibre-cement panels (smooth / painted)"
    }
  },
  {
    key: "panel_smooth_unpainted",
    label: {
      bg: "\u0424\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u2014 \u0433\u043B\u0430\u0434\u044A\u043A (\u043D\u0435\u0431\u043E\u044F\u0434\u0438\u0441\u0430\u043D)",
      en: "Fibre-cement panels \u2014 smooth (unpainted)"
    },
    docVal: {
      bg: "\u0424\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 (\u0433\u043B\u0430\u0434\u044A\u043A / \u043D\u0435\u0431\u043E\u044F\u0434\u0438\u0441\u0430\u043D)",
      en: "Fibre-cement panels (smooth / unpainted)"
    }
  },
  {
    key: "wood_siding",
    label: {
      bg: "\u0414\u044A\u0440\u0432\u0435\u0441\u0435\u043D \u0441\u0430\u0439\u0434\u0438\u043D\u0433 (\u0444\u043E\u0440\u043C\u043E\u0432\u0430\u043D \u0432\u044A\u0432 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u0430)",
      en: "Wood siding (formed in fibre-cement)"
    },
    docVal: {
      bg: "\u0414\u044A\u0440\u0432\u0435\u0441\u0435\u043D \u0441\u0430\u0439\u0434\u0438\u043D\u0433",
      en: "Wood siding (\u0414\u044A\u0440\u0432\u0435\u0441\u0435\u043D \u0441\u0430\u0439\u0434\u0438\u043D\u0433)"
    }
  },
  {
    key: "wood_decor",
    label: {
      bg: "\u0414\u044A\u0440\u0432\u0435\u0441\u0435\u043D \u0434\u0435\u043A\u043E\u0440 (\u0444\u043E\u0440\u043C\u043E\u0432\u0430\u043D \u0432\u044A\u0432 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u0430)",
      en: "Wood grain decor (formed in fibre-cement)"
    },
    docVal: {
      bg: "\u0414\u044A\u0440\u0432\u0435\u0441\u0435\u043D \u0434\u0435\u043A\u043E\u0440",
      en: "Wood grain decor (\u0414\u044A\u0440\u0432\u0435\u0441\u0435\u043D \u0434\u0435\u043A\u043E\u0440)"
    }
  },
  {
    key: "white_plaster",
    label: {
      bg: "\u0411\u044F\u043B\u0430 \u043C\u0430\u0437\u0438\u043B\u043A\u0430 \u2014 \u0440\u0435\u043B\u0435\u0444",
      en: "White render \u2014 textured relief"
    },
    docVal: {
      bg: "\u0411\u044F\u043B\u0430 \u043C\u0430\u0437\u0438\u043B\u043A\u0430",
      en: "White render (\u0411\u044F\u043B\u0430 \u043C\u0430\u0437\u0438\u043B\u043A\u0430)"
    }
  },
  {
    key: "insul_10cm",
    label: {
      bg: "\u0412\u044A\u043D\u0448\u043D\u0430 \u0442\u043E\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F 10 \u0441\u043C + \u0441\u0438\u043B\u0438\u043A\u043E\u043D\u043E\u0432\u0430 \u043C\u0430\u0437\u0438\u043B\u043A\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "10 cm external thermal insulation + silicone plaster (optional)"
    },
    docVal: {
      bg: "\u0412\u044A\u043D\u0448\u043D\u0430 \u0442\u043E\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F 10 \u0441\u043C \u0441\u044A\u0441 \u0441\u0438\u043B\u0438\u043A\u043E\u043D\u043E\u0432\u0430 \u043C\u0430\u0437\u0438\u043B\u043A\u0430",
      en: "10 cm external thermal insulation with silicone plaster"
    }
  },
  {
    key: "etalbond",
    label: {
      bg: "\u041E\u043A\u0430\u0447\u0435\u043D\u0430 \u0444\u0430\u0441\u0430\u0434\u0430 \u043E\u0442 \u0435\u0442\u0430\u043B\u0431\u043E\u043D\u0434 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "Etalbond / Alucobond curtain wall (optional)"
    },
    docVal: {
      bg: "\u041E\u043A\u0430\u0447\u0435\u043D\u0430 \u0444\u0430\u0441\u0430\u0434\u0430 \u043E\u0442 \u0435\u0442\u0430\u043B\u0431\u043E\u043D\u0434",
      en: "Etalbond curtain wall"
    }
  }
];
var WALL_HEIGHT_OPTIONS = [
  {
    key: "250",
    label: {
      bg: "250 \u0441\u043C (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442)",
      en: "250 cm (standard)"
    },
    docVal: { bg: "250 \u0441\u043C (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442)", en: "250 cm (standard)" }
  },
  {
    key: "280",
    label: {
      bg: "280 \u0441\u043C (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "280 cm (optional)"
    },
    docVal: { bg: "280 \u0441\u043C (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)", en: "280 cm (optional)" }
  },
  {
    key: "300",
    label: {
      bg: "300 \u0441\u043C (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "300 cm (optional)"
    },
    docVal: { bg: "300 \u0441\u043C (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)", en: "300 cm (optional)" }
  },
  {
    key: "custom",
    label: {
      bg: "\u0414\u0440\u0443\u0433\u0430 \u0432\u0438\u0441\u043E\u0447\u0438\u043D\u0430 (\u0440\u044A\u0447\u043D\u043E \u0432\u044A\u0432\u0435\u0436\u0434\u0430\u043D\u0435)",
      en: "Custom height (manual entry)"
    },
    docVal: { bg: "\u041F\u043E \u0437\u0430\u044F\u0432\u043A\u0430", en: "Custom" }
  }
];
var CEILING_INSUL_OPTIONS = [
  {
    key: "80",
    label: {
      bg: "12 \u043C\u043C \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D + 80 \u043C\u043C \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442)",
      en: "12 mm plasterboard + 80 mm rock wool (standard)"
    },
    docVal: {
      bg: "12 \u043C\u043C \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D + 80 \u043C\u043C \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442)",
      en: "12 mm plasterboard + 80 mm rock wool (standard)"
    }
  },
  {
    key: "160",
    label: {
      bg: "12 \u043C\u043C \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D + 160 \u043C\u043C \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "12 mm plasterboard + 160 mm rock wool (optional)"
    },
    docVal: {
      bg: "12 \u043C\u043C \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D + 160 \u043C\u043C \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)",
      en: "12 mm plasterboard + 160 mm rock wool (optional)"
    }
  }
];
var PERMIT_STATUS_OPTIONS = [
  {
    key: "has",
    label: {
      bg: "\u0418\u043C\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0437\u0430 \u0441\u0442\u0440\u043E\u0435\u0436",
      en: "Building permit available"
    }
  },
  {
    key: "process",
    label: {
      bg: "\u0412 \u043F\u0440\u043E\u0446\u0435\u0441 \u043D\u0430 \u0438\u0437\u0434\u0430\u0432\u0430\u043D\u0435",
      en: "Permit in progress"
    }
  },
  {
    key: "none",
    label: {
      bg: "\u041D\u044F\u043C\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 (\u0441\u044A\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043E\u0442 Flexi Home)",
      en: "No permit yet (assistance from Flexi Home)"
    }
  },
  {
    key: "unknown",
    label: {
      bg: "\u041D\u0435 \u0435 \u0443\u0442\u043E\u0447\u043D\u0435\u043D\u043E",
      en: "Undetermined"
    }
  }
];
var TURNKEY_FINISHING_ITEMS = {
  bg: [
    "\u0412\u044A\u043D\u0448\u043D\u0430 \u0442\u043E\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F",
    "\u0413\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D \u043F\u043E \u0441\u0442\u0435\u043D\u0438 \u0438 \u0448\u043F\u0430\u043A\u043B\u043E\u0432\u043A\u0430",
    "\u0417\u0430\u043C\u0430\u0437\u043A\u0430 \u043D\u0430 \u043F\u043E\u0434\u0430",
    "\u041D\u0430\u0441\u0442\u0438\u043B\u043A\u0438 \u2014 \u043B\u0430\u043C\u0438\u043D\u0430\u0442, \u0442\u0435\u0440\u0430\u043A\u043E\u0442, \u0444\u0430\u044F\u043D\u0441",
    "\u0424\u0438\u043D\u0430\u043B\u0435\u043D \u043C\u043E\u043D\u0442\u0430\u0436 \u043D\u0430 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0438, \u043A\u043B\u044E\u0447\u043E\u0432\u0435 \u0438 \u043E\u0441\u0432\u0435\u0442\u0438\u0442\u0435\u043B\u043D\u0438 \u0442\u0435\u043B\u0430",
    "\u0412\u044A\u0442\u0440\u0435\u0448\u043D\u043E \u0438 \u0432\u044A\u043D\u0448\u043D\u043E \u0431\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435",
    "\u041A\u0443\u0445\u043D\u0435\u043D\u0441\u043A\u043E \u043E\u0431\u043E\u0440\u0443\u0434\u0432\u0430\u043D\u0435 \u0438 \u0441\u0430\u043D\u0438\u0442\u0430\u0440\u0438\u044F"
  ],
  en: [
    "External thermal insulation",
    "Wall plasterboard and skim coat",
    "Floor screed",
    "Floor and wall coverings \u2014 laminate, tiles, ceramics",
    "Final fitting of sockets, switches and light fixtures",
    "Interior and exterior painting",
    "Kitchen equipment and sanitary ware"
  ]
};
var ALWAYS_EXCLUDED_ITEMS = {
  bg: [
    "\u041F\u0440\u043E\u0435\u043A\u0442\u043D\u0430 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0437\u0430 \u0441\u0442\u0440\u043E\u0435\u0436",
    "\u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442, \u0438\u0437\u043A\u043E\u043F\u043D\u0438 \u0440\u0430\u0431\u043E\u0442\u0438 \u0438 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u043D\u0430 \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u043A\u0430",
    "\u0412\u044A\u043D\u0448\u043D\u0438 \u0432\u0440\u044A\u0437\u043A\u0438 \u043A\u044A\u043C \u0435\u043B. \u043C\u0440\u0435\u0436\u0430, \u0432\u043E\u0434\u043E\u043F\u0440\u043E\u0432\u043E\u0434 \u0438 \u043A\u0430\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F",
    "\u041F\u043E\u0434\u043E\u0432\u043E \u043E\u0442\u043E\u043F\u043B\u0435\u043D\u0438\u0435, \u0441\u043B\u044A\u043D\u0447\u0435\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u0438 \u0434\u0440\u0443\u0433\u0438 \u0434\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u043D\u0438 \u0440\u0430\u0431\u043E\u0442\u0438 \u043F\u043E \u0436\u0435\u043B\u0430\u043D\u0438\u0435",
    "\u041E\u0442\u043E\u043F\u043B\u0435\u043D\u0438\u0435 \u0438 \u043A\u043B\u0438\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F"
  ],
  en: [
    "Design documentation and building permit",
    "Foundation, excavation and site levelling",
    "External connections to power grid, water supply and sewage",
    "Underfloor heating, solar panels and other optional works upon request",
    "Heating and air conditioning"
  ]
};
var CUSTOMER_RESPONSIBILITY = {
  bg: "\u041A\u043B\u0438\u0435\u043D\u0442\u044A\u0442 \u043E\u0441\u0438\u0433\u0443\u0440\u044F\u0432\u0430 \u043F\u043E\u0434\u0433\u043E\u0442\u0432\u0435\u043D \u0438 \u0434\u043E\u0441\u0442\u044A\u043F\u0435\u043D \u0437\u0430 \u0442\u0435\u0436\u043A\u043E\u0442\u043E\u0432\u0430\u0440\u0435\u043D \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u0438 \u043A\u0440\u0430\u043D \u043F\u0430\u0440\u0446\u0435\u043B, \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442, \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D \u043F\u043E \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u0435\u043D\u0430\u0442\u0430 \u043E\u0442 \u0438\u0437\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u044F \u0441\u0445\u0435\u043C\u0430, \u0432\u044A\u043D\u0448\u043D\u0438\u0442\u0435 \u0432\u0440\u044A\u0437\u043A\u0438 \u043A\u044A\u043C \u0435\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0430\u0442\u0430 \u043C\u0440\u0435\u0436\u0430, \u0432\u043E\u0434\u043E\u043F\u0440\u043E\u0432\u043E\u0434\u0430 \u0438 \u043A\u0430\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F\u0442\u0430, \u043A\u0430\u043A\u0442\u043E \u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u0438\u0442\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435\u043B\u043D\u0438. \u0417\u0430\u0431\u0430\u0432\u044F\u043D\u0435 \u043F\u043E\u0440\u0430\u0434\u0438 \u043D\u0435\u043F\u0440\u0435\u043E\u0434\u043E\u043B\u0438\u043C\u0430 \u0441\u0438\u043B\u0430 \u0438\u043B\u0438 \u043F\u043E\u0440\u0430\u0434\u0438 \u043F\u0440\u0438\u0447\u0438\u043D\u0438 \u0438\u0437\u0432\u044A\u043D \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0430 \u043D\u0430 \u0438\u0437\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u044F \u0443\u0434\u044A\u043B\u0436\u0430\u0432\u0430 \u0441\u0440\u043E\u043A\u0430 \u0437\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438 \u043C\u043E\u043D\u0442\u0430\u0436 \u0441\u044A\u0441 \u0441\u044A\u043E\u0442\u0432\u0435\u0442\u043D\u043E\u0442\u043E \u0432\u0440\u0435\u043C\u0435.",
  en: "The Customer provides a prepared plot accessible for heavy transport and a crane, a foundation built according to the layout scheme provided by the Contractor, external connections to the electricity grid, water supply and sewage, as well as the required permits. Any delay due to force majeure or reasons beyond the Contractor\u2019s control extends the delivery and assembly period accordingly."
};

// src/lib/pricingEngine.ts
function getTieredRate(area, tiers) {
  if (area <= 50) return tiers.upTo50;
  if (area <= 70) return tiers.from51To70;
  if (area <= 90) return tiers.from71To90;
  if (area <= 120) return tiers.from91To120;
  return tiers.over120;
}
function getBaseStructureUnitRate(form, config) {
  const { system, floors, areaRzp, pressTwoFloorVariant } = form;
  if (system === "press_economy") {
    return config.press_economy.flatRate;
  }
  if (system === "press_standard") {
    if (floors === 2) {
      return pressTwoFloorVariant === "515" ? config.press_standard.floor2Alt : config.press_standard.floor2Default;
    }
    return getTieredRate(areaRzp, config.press_standard.floor1);
  }
  if (system === "steel_frame") {
    if (floors === 2) {
      return config.steel_frame.floor2;
    }
    return getTieredRate(areaRzp, config.steel_frame.floor1);
  }
  if (floors === 2) {
    return config.reinforced_metal.floor2;
  }
  return getTieredRate(areaRzp, config.reinforced_metal.floor1);
}
function getBaseTurnkeyUnitRate(form, config) {
  switch (form.turnkeyPackage) {
    case "none":
      return 0;
    case "standard":
      return config.turnkeyRates.standard;
    case "luxury_680":
      return config.turnkeyRates.luxury_680;
    case "custom":
      return 420;
  }
}
function resolveOptionLabels(form) {
  const lang = form.lang || "bg";
  const sysMeta = SYSTEM_META[form.system];
  const roofObj = ROOF_OPTIONS.find((r) => r.key === form.roofColorKey) || ROOF_OPTIONS[0];
  const winColorObj = WIN_COLOR_OPTIONS.find((w) => w.key === form.winColorKey) || WIN_COLOR_OPTIONS[0];
  const winProfObj = WIN_PROFILE_OPTIONS.find((p) => p.key === form.winProfileKey) || WIN_PROFILE_OPTIONS[0];
  const winGlazeObj = WIN_GLAZING_OPTIONS.find((g) => g.key === form.winGlazingKey) || WIN_GLAZING_OPTIONS[0];
  const facadeObj = FACADE_OPTIONS.find((f) => f.key === form.facadeKey) || FACADE_OPTIONS[0];
  const wallHObj = WALL_HEIGHT_OPTIONS.find((h) => h.key === form.wallHeightKey) || WALL_HEIGHT_OPTIONS[0];
  const ceilingObj = CEILING_INSUL_OPTIONS.find((c) => c.key === form.ceilingInsulKey) || CEILING_INSUL_OPTIONS[0];
  const permitObj = PERMIT_STATUS_OPTIONS.find((p) => p.key === form.permitStatus) || PERMIT_STATUS_OPTIONS[0];
  const baseFloors = form.floors === 2 ? lang === "en" ? "Two-Storey (2 storeys)" : "\u0414\u0432\u0443\u0435\u0442\u0430\u0436\u043D\u0430 (2 \u0435\u0442\u0430\u0436\u0430)" : lang === "en" ? "Single-Storey (1 storey)" : "\u0415\u0434\u043D\u043E\u0435\u0442\u0430\u0436\u043D\u0430 (1 \u0435\u0442\u0430\u0436)";
  const floorsLabel = form.modelCodeLabel ? `${baseFloors} \xB7 ${form.modelCodeLabel}` : baseFloors;
  const locParts = [
    form.location,
    form.region,
    form.country,
    form.fullAddress ? `(${form.fullAddress})` : ""
  ].map((s) => (s || "").trim()).filter(Boolean);
  return {
    systemName: form.systemCustomText?.trim() || sysMeta.name[lang],
    floorsLabel,
    roofLabel: form.roofCustomText?.trim() || roofObj.docVal[lang],
    winColorLabel: winColorObj.docVal[lang],
    winFullLabel: form.winCustomText?.trim() || `${winColorObj.docVal[lang]} \xB7 ${winProfObj.label[lang]} \xB7 ${winGlazeObj.label[lang]}`,
    facadeLabel: form.facadeCustomText?.trim() || facadeObj.docVal[lang],
    wallHeightLabel: (() => {
      const raw = form.wallHeightCustomText?.trim();
      if (!raw) return wallHObj.docVal[lang];
      return /^\d+([.,]\d+)?$/.test(raw) ? `${raw} ${lang === "bg" ? "\u0441\u043C" : "cm"}` : raw;
    })(),
    ceilingLabel: form.ceilingCustomText?.trim() || ceilingObj.docVal[lang],
    permitLabel: permitObj.label[lang],
    locationFull: locParts.join(", ") || "\u2014"
  };
}
function getDefaultWallThicknessCm(system) {
  return system === "press_standard" || system === "press_economy" ? { ext: 16, int: 10 } : { ext: 14, int: 8 };
}
function buildDynamicWallSpec(form, lang) {
  const defaults = getDefaultWallThicknessCm(form.system);
  const extCm = form.extWallCm && form.extWallCm > 0 ? form.extWallCm : defaults.ext;
  const intCm = form.intWallCm && form.intWallCm > 0 ? form.intWallCm : defaults.int;
  const extMm = Math.round(extCm * 10);
  const intMm = Math.round(intCm * 10);
  if (lang === "en") {
    if (form.system === "press_standard") {
      const extCore = extMm > 20 ? ` (10 mm fibre-cement + ${extMm - 20} mm EPS + 10 mm fibre-cement)` : "";
      const intCore = intMm > 20 ? ` (10 mm fibre-cement + ${intMm - 20} mm EPS + 10 mm fibre-cement)` : "";
      return `Double-faced fibre-cement panels + EPS insulation \u2014 External walls: ${extCm} cm (${extMm} mm)${extCore}; Internal walls: ${intCm} cm (${intMm} mm)${intCore}`;
    }
    if (form.system === "press_economy") {
      return `Economy series double-faced fibre-cement panels with EPS insulation \u2014 External walls: ${extCm} cm (${extMm} mm); Internal partition walls: ${intCm} cm (${intMm} mm)`;
    }
    if (form.system === "steel_frame") {
      return `Steel frame structure with double-faced fibre-cement panels and rock wool \u2014 External wall thickness: ${extCm} cm; Internal wall thickness: ${intCm} cm`;
    }
    return `Reinforced galvanised steel structure, thermally & acoustically insulated with rock wool (fibre-cement exterior, plasterboard interior) \u2014 External walls: ${extCm} cm; Internal walls: ${intCm} cm`;
  }
  if (form.system === "press_standard") {
    const extCore = extMm > 20 ? ` (10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442 + ${extMm - 20} \u043C\u043C EPS + 10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442)` : "";
    const intCore = intMm > 20 ? ` (10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442 + ${intMm - 20} \u043C\u043C EPS + 10 \u043C\u043C \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442)` : "";
    return `\u0414\u0432\u0443\u043B\u0438\u0446\u0435\u0432\u0438 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 + EPS \u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F \u2014 \u0412\u044A\u043D\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: ${extCm} \u0441\u043C (${extMm} \u043C\u043C)${extCore}; \u041F\u0440\u0435\u0433\u0440\u0430\u0434\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: ${intCm} \u0441\u043C (${intMm} \u043C\u043C)${intCore}`;
  }
  if (form.system === "press_economy") {
    return `\u0418\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u0430 \u0441\u0435\u0440\u0438\u044F \u0434\u0432\u0443\u043B\u0438\u0446\u0435\u0432\u0438 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441 EPS \u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F \u2014 \u0412\u044A\u043D\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: ${extCm} \u0441\u043C (${extMm} \u043C\u043C); \u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u043F\u0440\u0435\u0433\u0440\u0430\u0434\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: ${intCm} \u0441\u043C (${intMm} \u043C\u043C)`;
  }
  if (form.system === "steel_frame") {
    return `\u0421\u0442\u043E\u043C\u0430\u043D\u0435\u043D\u0430 \u043A\u0430\u0440\u043A\u0430\u0441\u043D\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u0441 \u0434\u0432\u0443\u043B\u0438\u0446\u0435\u0432\u0438 \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u0430\u043D\u0435\u043B\u0438 \u0438 \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 \u2014 \u0414\u0435\u0431\u0435\u043B\u0438\u043D\u0430 \u043D\u0430 \u0432\u044A\u043D\u0448\u043D\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0438: ${extCm} \u0441\u043C; \u0414\u0435\u0431\u0435\u043B\u0438\u043D\u0430 \u043D\u0430 \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438\u0442\u0435 \u0441\u0442\u0435\u043D\u0438: ${intCm} \u0441\u043C`;
  }
  return `\u0423\u0441\u0438\u043B\u0435\u043D\u0430 \u043F\u043E\u0446\u0438\u043D\u043A\u043E\u0432\u0430\u043D\u0430 \u043C\u0435\u0442\u0430\u043B\u043D\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F, \u0442\u043E\u043F\u043B\u043E- \u0438 \u0448\u0443\u043C\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u0430\u043D\u0430 \u0441 \u043A\u0430\u043C\u0435\u043D\u043D\u0430 \u0432\u0430\u0442\u0430 (\u043E\u0442\u0432\u044A\u043D \u0444\u0438\u0431\u0440\u043E\u0446\u0438\u043C\u0435\u043D\u0442\u043E\u0432\u0438 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438, \u043E\u0442\u0432\u044A\u0442\u0440\u0435 \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D) \u2014 \u0412\u044A\u043D\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: ${extCm} \u0441\u043C; \u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438: ${intCm} \u0441\u043C`;
}
function buildSpecificationRows(form, foundationUnitRate, hasTurnkey, turnkeyDocName, resolved) {
  const lang = form.lang || "bg";
  const isPress = form.system === "press_standard" || form.system === "press_economy";
  const wallSpec = buildDynamicWallSpec(form, lang);
  const hasCustomRoof = Boolean(form.roofCustomText?.trim());
  const hasCustomWin = Boolean(form.winCustomText?.trim());
  const applyOverrides = (rows) => rows.map((row, idx) => {
    const custom = form.specOverrides?.[String(idx)]?.trim();
    return custom ? { ...row, spec: custom } : row;
  });
  if (lang === "en") {
    const termEn = isPress ? "Production ~3 weeks from advance payment and 5\u201310 days of on-site assembly (30\u201340 days after approved designs and building permit). Full assistance with project documentation." : "After approved projects and building permit \u2014 30\u201340 days to completed assembly. We provide full assistance with preparing the documentation.";
    return applyOverrides([
      {
        element: "Construction & foundation",
        spec: `Built on a reinforced concrete strip or pad foundation, as well as a metal structure with galvanised elements and ground-anchor screws. Indicative average foundation price: ~${foundationUnitRate} \u20AC/m\xB2 (exact price confirmed after a site visit and geodetic survey of the plot).`
      },
      {
        element: "Walls",
        spec: `${wallSpec}. Wall height: ${resolved.wallHeightLabel}. Facade finish: ${resolved.facadeLabel}${hasTurnkey ? " (painted and finished under the Turnkey package)." : " (delivered unpainted at shell stage; painting is included only in Turnkey packages)."}`
      },
      {
        element: "Roof",
        spec: hasCustomRoof ? resolved.roofLabel : `Galvanised steel trusses, OSB boards with vapour membrane, metal roof tiles (Colour: ${resolved.roofLabel}) and complete metal gutter system.`
      },
      {
        element: "Ceiling",
        spec: resolved.ceilingLabel
      },
      {
        element: "Doors",
        spec: "External armoured metal door (scratch- and impact-resistant, with thermal and sound insulation) + Internal MDF doors with wooden frame."
      },
      {
        element: "Windows",
        spec: hasCustomWin ? resolved.winFullLabel : `${resolved.winFullLabel}. Opening: turn-and-tilt (standard). Standard sizes: 60/40, 120/60, 120/100, 120/160, 160/160, 180/180 cm (custom sizes and frosted glass available per project).`
      },
      {
        element: "Electrical installation",
        spec: hasTurnkey ? "Concealed wiring in corrugated conduits, installed electrical breaker panel + complete final fitting of CE-certified sockets, switches and light fixtures (included in Turnkey package)." : "Concealed wiring in corrugated conduits and electrical panel installed by our team. CE-certified sockets, switches and ceiling lights supplied as materials (final fitting is part of finishing works)."
      },
      {
        element: "Plumbing (\u0412\u0438\u041A)",
        spec: hasTurnkey ? "Complete water supply and sewage installation + fully finished bathroom and toilet with sanitary ware included (shower tray, sink, toilet and accessories)." : "Plumbing and sewage installation included in the price (completed to shell stage)."
      },
      {
        element: "Lighting",
        spec: hasTurnkey ? "Interior and exterior ceiling lights \u2014 supplied and fitted." : "Interior and exterior ceiling lights \u2014 supplied as materials."
      },
      {
        element: "Painting",
        spec: hasTurnkey ? "Exterior silicone and interior latex paint \u2014 supplied and applied (included in Turnkey package)." : "Not included in shell stage \u2014 wall and facade claddings are delivered unpainted. Exterior and interior painting are included only in Turnkey packages."
      },
      {
        element: "Additional options",
        spec: hasTurnkey ? `Active Turnkey Package (${turnkeyDocName}): includes external thermal insulation, wall plasterboard & skim coat, floor screed, laminate/tiles/ceramics, painting, kitchen cabinets and equipped bathroom.` : "Screed and underfloor heating, plasterboard, skim coat, wallpaper, floor coverings, wall and floor tiles, furniture per project. For the facade: silicone plaster, 10 cm external thermal insulation or Etalbond curtain wall."
      },
      {
        element: "Delivery & assembly time",
        spec: termEn
      }
    ]);
  }
  const termBg = isPress ? "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E ~3 \u0441\u0435\u0434\u043C\u0438\u0446\u0438 \u043E\u0442 \u0430\u0432\u0430\u043D\u0441\u043E\u0432\u043E\u0442\u043E \u043F\u043B\u0430\u0449\u0430\u043D\u0435 \u0438 5\u201310 \u0434\u043D\u0438 \u043C\u043E\u043D\u0442\u0430\u0436 \u043D\u0430 \u043C\u044F\u0441\u0442\u043E (30\u201340 \u0434\u043D\u0438 \u0441\u043B\u0435\u0434 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438 \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0437\u0430 \u0441\u0442\u0440\u043E\u0435\u0436). \u041E\u043A\u0430\u0437\u0432\u0430\u043C\u0435 \u043F\u044A\u043B\u043D\u043E \u0441\u044A\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u0440\u0438 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430\u0442\u0430 \u043D\u0430 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F\u0442\u0430." : "\u0421\u043B\u0435\u0434 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438 \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0437\u0430 \u0441\u0442\u0440\u043E\u0435\u0436 \u2014 30\u201340 \u0434\u043D\u0438 \u0434\u043E \u0437\u0430\u0432\u044A\u0440\u0448\u0435\u043D \u043C\u043E\u043D\u0442\u0430\u0436. \u041E\u043A\u0430\u0437\u0432\u0430\u043C\u0435 \u043F\u044A\u043B\u043D\u043E \u0441\u044A\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u0440\u0438 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430\u0442\u0430 \u043D\u0430 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F\u0442\u0430.";
  return applyOverrides([
    {
      element: "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u0438 \u043E\u0441\u043D\u043E\u0432\u0430",
      spec: `\u0418\u0437\u0433\u0440\u0430\u0436\u0434\u0430 \u0441\u0435 \u0432\u044A\u0440\u0445\u0443 \u0431\u0435\u0442\u043E\u043D\u043E\u0432\u0430, \u0438\u0432\u0438\u0447\u043D\u0430 \u0438\u043B\u0438 \u0441\u0442\u044A\u043F\u043A\u043E\u0432\u0430 \u043E\u0441\u043D\u043E\u0432\u0430, \u043A\u0430\u043A\u0442\u043E \u0438 \u043C\u0435\u0442\u0430\u043B\u043D\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u0441 \u043F\u043E\u0446\u0438\u043D\u043A\u043E\u0432\u0430\u043D\u0438 \u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438 \u0438 \u0437\u0435\u043C\u043D\u043E-\u0430\u043D\u043A\u0435\u0440\u043D\u0438 \u0432\u0438\u043D\u0442\u043E\u0432\u0435. \u041E\u0440\u0438\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u044A\u0447\u043D\u0430 \u0441\u0440\u0435\u0434\u043D\u0430 \u0446\u0435\u043D\u0430 \u043D\u0430 \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442\u0430: ~${foundationUnitRate} \u20AC/\u043C\xB2 (\u0442\u043E\u0447\u043D\u0430\u0442\u0430 \u0446\u0435\u043D\u0430 \u0441\u0435 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F \u0441\u043B\u0435\u0434 \u043E\u0433\u043B\u0435\u0434 \u0438 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u043D\u043E \u0437\u0430\u0441\u043D\u0435\u043C\u0430\u043D\u0435 \u043D\u0430 \u0442\u0435\u0440\u0435\u043D\u0430).`
    },
    {
      element: "\u0421\u0442\u0435\u043D\u0438",
      spec: `${wallSpec}. \u0412\u0438\u0441\u043E\u0447\u0438\u043D\u0430 \u043D\u0430 \u0441\u0442\u0435\u043D\u0438\u0442\u0435: ${resolved.wallHeightLabel}. \u0424\u0430\u0441\u0430\u0434\u0430: ${resolved.facadeLabel}${hasTurnkey ? " (\u0431\u043E\u044F\u0434\u0438\u0441\u0430\u043D\u0438 \u0438 \u0437\u0430\u0432\u044A\u0440\u0448\u0435\u043D\u0438 \u043F\u043E \u043F\u0430\u043A\u0435\u0442\u0430 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C)." : " (\u0434\u043E\u0441\u0442\u0430\u0432\u044F\u0442 \u0441\u0435 \u0431\u0435\u0437 \u0431\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435 \u043D\u0430 \u0435\u0442\u0430\u043F \u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C; \u0431\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435\u0442\u043E \u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0441\u0430\u043C\u043E \u0432 \u043F\u0430\u043A\u0435\u0442\u0438\u0442\u0435 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C)."}`
    },
    {
      element: "\u041F\u043E\u043A\u0440\u0438\u0432",
      spec: hasCustomRoof ? resolved.roofLabel : `\u041C\u0435\u0442\u0430\u043B\u043D\u0438 \u0444\u0435\u0440\u043C\u0438 \u043E\u0442 \u043F\u043E\u0446\u0438\u043D\u043A\u043E\u0432\u0430\u043D\u0430 \u0441\u0442\u043E\u043C\u0430\u043D\u0430, OSB \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u0438 \u0441 \u043F\u0430\u0440\u043E\u043C\u0435\u043C\u0431\u0440\u0430\u043D\u0430, \u043C\u0435\u0442\u0430\u043B\u043D\u0438 \u043A\u0435\u0440\u0435\u043C\u0438\u0434\u0438 (\u0426\u0432\u044F\u0442: ${resolved.roofLabel}) \u0438 \u043C\u0435\u0442\u0430\u043B\u043D\u0438 \u0443\u043B\u0443\u0446\u0438.`
    },
    {
      element: "\u0422\u0430\u0432\u0430\u043D",
      spec: resolved.ceilingLabel
    },
    {
      element: "\u0412\u0440\u0430\u0442\u0438",
      spec: "\u0412\u044A\u043D\u0448\u043D\u0430 \u0431\u043B\u0438\u043D\u0434\u0438\u0440\u0430\u043D\u0430 \u043C\u0435\u0442\u0430\u043B\u043D\u0430 \u0432\u0440\u0430\u0442\u0430 (\u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u0430 \u043D\u0430 \u0443\u0434\u0430\u0440 \u0438 \u043D\u0430\u0434\u0440\u0430\u0441\u043A\u0432\u0430\u043D\u0435, \u0441 \u0442\u043E\u043F\u043B\u043E- \u0438 \u0448\u0443\u043C\u043E\u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F) + \u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 MDF \u0432\u0440\u0430\u0442\u0438 \u0441 \u0434\u044A\u0440\u0432\u0435\u043D\u0430 \u043A\u0430\u0441\u0430."
    },
    {
      element: "\u041F\u0440\u043E\u0437\u043E\u0440\u0446\u0438",
      spec: hasCustomWin ? resolved.winFullLabel : `${resolved.winFullLabel}. \u041E\u0442\u0432\u0430\u0440\u044F\u043D\u0435: \u0434\u0432\u043E\u0439\u043D\u043E \u0438 \u043D\u043E\u0436\u0438\u0447\u043D\u043E (\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442). \u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u0438 \u0440\u0430\u0437\u043C\u0435\u0440\u0438: 60/40, 120/60, 120/100, 120/160, 160/160, 180/180 \u0441\u043C (\u0432\u044A\u0437\u043C\u043E\u0436\u043D\u0438 \u0441\u0430 \u0438 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u043D\u0438 \u0440\u0430\u0437\u043C\u0435\u0440\u0438 \u0438 \u043C\u0430\u0442\u0438\u0440\u0430\u043D\u043E \u0441\u0442\u044A\u043A\u043B\u043E \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442).`
    },
    {
      element: "\u0415\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0430 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F",
      spec: hasTurnkey ? "\u0421\u043A\u0440\u0438\u0442 \u043C\u043E\u043D\u0442\u0430\u0436 \u0438 \u0435\u043B. \u0442\u0430\u0431\u043B\u043E + \u043F\u044A\u043B\u0435\u043D \u0444\u0438\u043D\u0430\u043B\u0435\u043D \u043C\u043E\u043D\u0442\u0430\u0436 \u043D\u0430 CE \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u0430\u043D\u0438 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0438, \u043A\u043B\u044E\u0447\u043E\u0432\u0435 \u0438 \u043E\u0441\u0432\u0435\u0442\u0438\u0442\u0435\u043B\u043D\u0438 \u0442\u0435\u043B\u0430 (\u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0432 \u043F\u0430\u043A\u0435\u0442\u0430 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C)." : "\u0421\u043A\u0440\u0438\u0442 \u043C\u043E\u043D\u0442\u0430\u0436 \u0438 \u0435\u043B. \u0442\u0430\u0431\u043B\u043E, \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D\u0438 \u043E\u0442 \u043D\u0430\u0448 \u0435\u043A\u0438\u043F \u043F\u043E \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u0435\u043D \u0435\u043B. \u043F\u0440\u043E\u0435\u043A\u0442. CE \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u0430\u043D\u0438 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0438, \u043A\u043B\u044E\u0447\u043E\u0432\u0435 \u0438 \u043F\u043B\u0430\u0444\u043E\u043D\u0438 \u2014 \u0434\u043E\u0441\u0442\u0430\u0432\u0435\u043D\u0438 \u043A\u0430\u0442\u043E \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B (\u0444\u0438\u043D\u0430\u043B\u043D\u0438\u044F\u0442 \u043C\u043E\u043D\u0442\u0430\u0436 \u0435 \u0447\u0430\u0441\u0442 \u043E\u0442 \u0434\u043E\u0432\u044A\u0440\u0448\u0438\u0442\u0435\u043B\u043D\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u0438)."
    },
    {
      element: "\u0412\u0438\u041A",
      spec: hasTurnkey ? "\u0412\u0438\u041A \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F + \u043D\u0430\u043F\u044A\u043B\u043D\u043E \u0437\u0430\u0432\u044A\u0440\u0448\u0435\u043D\u0438 \u0431\u0430\u043D\u044F \u0438 \u0442\u043E\u0430\u043B\u0435\u0442\u043D\u0430 \u0441 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u0441\u0430\u043D\u0438\u0442\u0430\u0440\u0438\u044F (\u0434\u0443\u0448 \u043A\u043E\u0440\u0438\u0442\u043E, \u043C\u0438\u0432\u043A\u0430, \u0442\u043E\u0430\u043B\u0435\u0442\u043D\u0430 \u0438 \u0430\u043A\u0441\u0435\u0441\u043E\u0430\u0440\u0438)." : "\u0412\u0438\u041A \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F \u2014 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u0432 \u0446\u0435\u043D\u0430\u0442\u0430 (\u0438\u0437\u0432\u0435\u0434\u0435\u043D\u0430 \u0434\u043E \u0442\u0430\u043F\u0430)."
    },
    {
      element: "\u041E\u0441\u0432\u0435\u0442\u043B\u0435\u043D\u0438\u0435",
      spec: hasTurnkey ? "\u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0438 \u0432\u044A\u043D\u0448\u043D\u0438 \u043F\u043B\u0430\u0444\u043E\u043D\u0438 \u2014 \u0434\u043E\u0441\u0442\u0430\u0432\u0435\u043D\u0438 \u0438 \u043C\u043E\u043D\u0442\u0438\u0440\u0430\u043D\u0438." : "\u0412\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0438 \u0432\u044A\u043D\u0448\u043D\u0438 \u043F\u043B\u0430\u0444\u043E\u043D\u0438 \u2014 \u0434\u043E\u0441\u0442\u0430\u0432\u0435\u043D\u0438 \u043A\u0430\u0442\u043E \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B."
    },
    {
      element: "\u0411\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435",
      spec: hasTurnkey ? "\u0412\u044A\u043D\u0448\u043D\u0430 \u0441\u0438\u043B\u0438\u043A\u043E\u043D\u043E\u0432\u0430 \u0438 \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0430 \u043B\u0430\u0442\u0435\u043A\u0441\u043E\u0432\u0430 \u0431\u043E\u044F \u2014 \u0434\u043E\u0441\u0442\u0430\u0432\u0435\u043D\u0438 \u0438 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438 (\u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0432 \u043F\u0430\u043A\u0435\u0442\u0430 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C)." : "\u041D\u0435 \u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0432 \u0435\u0442\u0430\u043F \u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C \u2014 \u0441\u0442\u0435\u043D\u043D\u0438\u0442\u0435 \u0438 \u0444\u0430\u0441\u0430\u0434\u043D\u0438\u0442\u0435 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u043A\u0438 \u0441\u0435 \u0434\u043E\u0441\u0442\u0430\u0432\u044F\u0442 \u0431\u0435\u0437 \u0431\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435. \u0412\u044A\u043D\u0448\u043D\u043E\u0442\u043E \u0438 \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u043E\u0442\u043E \u0431\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435 \u0441\u0435 \u0438\u0437\u043F\u044A\u043B\u043D\u044F\u0432\u0430\u0442 \u0441\u0430\u043C\u043E \u043F\u0440\u0438 \u0438\u0437\u0431\u0440\u0430\u043D \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C."
    },
    {
      element: "\u0414\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u043D\u0438 \u043E\u043F\u0446\u0438\u0438",
      spec: hasTurnkey ? `\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u0430\u043D \u0434\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u0435\u043D \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C (${turnkeyDocName}): \u0432\u043A\u043B\u044E\u0447\u0432\u0430 \u0432\u044A\u043D\u0448\u043D\u0430 \u0442\u043E\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F, \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D \u0438 \u0448\u043F\u0430\u043A\u043B\u043E\u0432\u043A\u0430, \u0437\u0430\u043C\u0430\u0437\u043A\u0430 \u043D\u0430 \u043F\u043E\u0434\u0430, \u043B\u0430\u043C\u0438\u043D\u0430\u0442/\u0442\u0435\u0440\u0430\u043A\u043E\u0442/\u0444\u0430\u044F\u043D\u0441, \u0431\u043E\u044F\u0434\u0438\u0441\u0432\u0430\u043D\u0435, \u043A\u0443\u0445\u043D\u0435\u043D\u0441\u043A\u043E \u043E\u0431\u043E\u0440\u0443\u0434\u0432\u0430\u043D\u0435 \u0438 \u0441\u0430\u043D\u0438\u0442\u0430\u0440\u0438\u044F.` : "\u0417\u0430\u043C\u0430\u0437\u043A\u0430 \u0438 \u043F\u043E\u0434\u043E\u0432\u043E \u043E\u0442\u043E\u043F\u043B\u0435\u043D\u0438\u0435, \u0433\u0438\u043F\u0441\u043E\u043A\u0430\u0440\u0442\u043E\u043D, \u0448\u043F\u0430\u043A\u043B\u043E\u0432\u043A\u0430, \u0442\u0430\u043F\u0435\u0442\u0438, \u043F\u043E\u0434\u043E\u0432\u0438 \u043D\u0430\u0441\u0442\u0438\u043B\u043A\u0438, \u0444\u0430\u044F\u043D\u0441, \u0442\u0435\u0440\u0430\u043A\u043E\u0442\u0430, \u043E\u0431\u0437\u0430\u0432\u0435\u0436\u0434\u0430\u043D\u0435 \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442. \u0417\u0430 \u0444\u0430\u0441\u0430\u0434\u0430: \u0441\u0438\u043B\u0438\u043A\u043E\u043D\u043E\u0432\u0430 \u043C\u0430\u0437\u0438\u043B\u043A\u0430, \u0432\u044A\u043D\u0448\u043D\u0430 \u0442\u043E\u043F\u043B\u043E\u0438\u0437\u043E\u043B\u0430\u0446\u0438\u044F 10 \u0441\u043C \u0438\u043B\u0438 \u043E\u043A\u0430\u0447\u0435\u043D\u0430 \u0444\u0430\u0441\u0430\u0434\u0430 \u043E\u0442 \u0435\u0442\u0430\u043B\u0431\u043E\u043D\u0434."
    },
    {
      element: "\u0421\u0440\u043E\u043A \u0437\u0430 \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D\u0438\u0435",
      spec: termBg
    }
  ]);
}
function calculateOffer(form, config) {
  const lang = form.lang || "bg";
  const baseStructureRate = getBaseStructureUnitRate(form, config);
  const structureUnitRate = form.structureRateOverride !== null && form.structureRateOverride >= 0 ? form.structureRateOverride : baseStructureRate;
  const area = Math.max(0, form.areaRzp || 0);
  const structureTotal = Math.round(area * structureUnitRate);
  const extraOptionAmount = Math.max(0, Math.round(form.extraOptionAmount || 0));
  const discountEur = Math.max(0, Math.round(form.discountEur || 0));
  const contractStructureNet = Math.max(
    0,
    structureTotal + extraOptionAmount - discountEur
  );
  const hasTurnkey = form.turnkeyPackage !== "none";
  const baseTurnkeyRate = getBaseTurnkeyUnitRate(form, config);
  const turnkeyUnitRate = hasTurnkey ? form.turnkeyRateOverride !== null && form.turnkeyRateOverride >= 0 ? form.turnkeyRateOverride : baseTurnkeyRate : 0;
  const turnkeyTotal = hasTurnkey ? Math.round(area * turnkeyUnitRate) : 0;
  const contractWithTurnkeyTotal = contractStructureNet + turnkeyTotal;
  const effectiveFoundationArea = form.includeFoundation ? Math.max(0, form.foundationArea || 0) : 0;
  const foundationUnitRate = form.foundationRateOverride !== null && form.foundationRateOverride >= 0 ? form.foundationRateOverride : config.foundationRate;
  const foundationTotal = form.includeFoundation ? Math.round(effectiveFoundationArea * foundationUnitRate) : 0;
  const structurePlusFoundationTotal = contractStructureNet + foundationTotal;
  const grandTotalWithTurnkey = contractStructureNet + turnkeyTotal + foundationTotal;
  const stage1_50 = Math.round(contractStructureNet * 0.5);
  const stage2_40 = Math.round(contractStructureNet * 0.4);
  const stage3_10 = contractStructureNet - stage1_50 - stage2_40;
  const tkSuffix = lang === "en" ? "(incl. in Turnkey package)" : "(\u0432\u043A\u043B. \u0432 \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C)";
  const turnkeyMeta = TURNKEY_META[form.turnkeyPackage] ?? TURNKEY_META.none;
  const resolvedLabels = resolveOptionLabels(form);
  const wallDefaults = getDefaultWallThicknessCm(form.system);
  const extCm = form.extWallCm && form.extWallCm > 0 ? form.extWallCm : wallDefaults.ext;
  const intCm = form.intWallCm && form.intWallCm > 0 ? form.intWallCm : wallDefaults.int;
  const dynamicBaseScope = lang === "en" ? [
    "Factory manufacturing of the structure",
    "Delivery to the customer\u2019s plot",
    "On-site assembly by Flexi Home team",
    `Wall system (${extCm} cm external / ${intCm} cm internal)`,
    form.roofCustomText?.trim() ? `Roof: ${resolvedLabels.roofLabel}` : `Roof system with galvanised trusses, OSB, vapour membrane, metal tiles (${resolvedLabels.roofLabel}) and gutters`,
    `Ceiling: ${resolvedLabels.ceilingLabel}`,
    `Windows & glazing: ${resolvedLabels.winFullLabel}`,
    "Armoured metal entrance door and interior MDF doors with wooden frame",
    "Electrical installation (concealed wiring and breaker panel)",
    "Plumbing installation (completed to shell stage)",
    ...form.includeFoundation ? [`Foundation per project (${effectiveFoundationArea} m\xB2)`] : []
  ] : [
    "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043D\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F\u0442\u0430 \u0432\u044A\u0432 \u0444\u0430\u0431\u0440\u0438\u043A\u0430",
    "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0434\u043E \u043F\u0430\u0440\u0446\u0435\u043B\u0430 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
    "\u041C\u043E\u043D\u0442\u0430\u0436 \u043D\u0430 \u043C\u044F\u0441\u0442\u043E \u043E\u0442 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u0430\u043D \u0435\u043A\u0438\u043F",
    `\u0421\u0442\u0435\u043D\u043D\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430 (${extCm} \u0441\u043C \u0432\u044A\u043D\u0448\u043D\u0438 / ${intCm} \u0441\u043C \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438 \u0441\u0442\u0435\u043D\u0438)`,
    form.roofCustomText?.trim() ? `\u041F\u043E\u043A\u0440\u0438\u0432: ${resolvedLabels.roofLabel}` : `\u041F\u043E\u043A\u0440\u0438\u0432\u043D\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441 \u043C\u0435\u0442\u0430\u043B\u043D\u0438 \u0444\u0435\u0440\u043C\u0438, OSB, \u043F\u0430\u0440\u043E\u043C\u0435\u043C\u0431\u0440\u0430\u043D\u0430, \u043C\u0435\u0442\u0430\u043B\u043D\u0438 \u043A\u0435\u0440\u0435\u043C\u0438\u0434\u0438 (${resolvedLabels.roofLabel}) \u0438 \u0443\u043B\u0443\u0446\u0438`,
    `\u0422\u0430\u0432\u0430\u043D: ${resolvedLabels.ceilingLabel}`,
    `\u0414\u043E\u0433\u0440\u0430\u043C\u0430 \u0438 \u0441\u0442\u044A\u043A\u043B\u043E\u043F\u0430\u043A\u0435\u0442: ${resolvedLabels.winFullLabel}`,
    "\u0412\u044A\u043D\u0448\u043D\u0430 \u0431\u043B\u0438\u043D\u0434\u0438\u0440\u0430\u043D\u0430 \u043C\u0435\u0442\u0430\u043B\u043D\u0430 \u0438 \u0432\u044A\u0442\u0440\u0435\u0448\u043D\u0438 MDF \u0432\u0440\u0430\u0442\u0438 \u0441 \u0434\u044A\u0440\u0432\u0435\u043D\u0430 \u043A\u0430\u0441\u0430",
    "\u0415\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0430 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F (\u0441\u043A\u0440\u0438\u0442 \u043C\u043E\u043D\u0442\u0430\u0436 \u0438 \u0435\u043B. \u0442\u0430\u0431\u043B\u043E)",
    "\u0412\u0438\u041A \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F (\u043D\u0430\u043F\u044A\u043B\u043D\u043E \u043C\u043E\u043D\u0442\u0438\u0440\u0430\u043D\u0430 \u0434\u043E \u0442\u0430\u043F\u0430)",
    ...form.includeFoundation ? [`\u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442 \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442 (${effectiveFoundationArea} \u043C\xB2)`] : []
  ];
  const includedScope = hasTurnkey ? [
    ...dynamicBaseScope,
    ...TURNKEY_FINISHING_ITEMS[lang].map((item) => `${item} ${tkSuffix}`)
  ] : dynamicBaseScope;
  const alwaysExcl = ALWAYS_EXCLUDED_ITEMS[lang];
  const excludedScope = hasTurnkey ? [] : [
    alwaysExcl[0],
    ...form.includeFoundation ? [] : [alwaysExcl[1]],
    ...TURNKEY_FINISHING_ITEMS[lang],
    alwaysExcl[3],
    alwaysExcl[2],
    alwaysExcl[4]
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
      stage3_10
    },
    resolvedLabels,
    includedScope,
    excludedScope,
    specRows
  };
}
function formatEur(amount) {
  return `${amount.toLocaleString("bg-BG").replace(/\u00A0/g, " ")} \u20AC`;
}
function formatValidUntilDate(dateIso, validityDays) {
  const safeDays = Math.max(1, Math.round(validityDays || 30));
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((dateIso || "").trim());
  const baseMs = match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : Date.now();
  const target = new Date(baseMs + safeDays * 864e5);
  const dd = String(target.getUTCDate()).padStart(2, "0");
  const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = target.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
var COUNTER_KEY = "flexi_home_offer_seq_counter_v1";
function generateOfferNumber(increment = true) {
  const now = /* @__PURE__ */ new Date();
  const yy = String(now.getFullYear()).slice(-2);
  let seq = 101;
  if (typeof window !== "undefined") {
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
      seq = Math.floor(1e3 + Math.random() * 9e3);
    }
  }
  return `${yy}-${String(seq).padStart(4, "0")}`;
}

// src/lib/pdfGenerator.ts
function formatOfferFilename(form) {
  const rawName = (form.clientName || (form.lang === "en" ? "Client" : "Klient")).trim();
  const safeName = rawName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\u0400-\u04FF_-]/g, "");
  const datePart = form.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return `Oferta-${safeName || "Klient"}-${datePart}.pdf`;
}
function formatBgDate(isoDate, lang = "bg") {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return lang === "en" ? `${parts[2]}.${parts[1]}.${parts[0]}` : `${parts[2]}.${parts[1]}.${parts[0]} \u0433.`;
}
function buildBulgarianOfferDocDefinition(form, calc, logoDataUrl = null) {
  const lang = form.lang || "bg";
  const isEn = lang === "en";
  const dateFormatted = formatBgDate(form.date, lang);
  const R = calc.resolvedLabels;
  const buildPageHeader = (pageSubtitle, pageBreakBefore = false) => {
    return {
      stack: [
        {
          columns: [
            logoDataUrl ? {
              image: logoDataUrl,
              width: 44,
              height: 44,
              margin: [0, 0, 10, 0]
            } : { width: 0, text: "" },
            {
              width: "*",
              stack: [
                {
                  text: COMPANY_INFO.brand,
                  fontSize: 16,
                  bold: true,
                  color: "#1e1b4b"
                },
                {
                  text: `${COMPANY_INFO.website}  \xB7  ${isEn ? COMPANY_INFO.legalNameEn : COMPANY_INFO.legalName}`,
                  fontSize: 8.5,
                  color: "#475569",
                  margin: [0, 2, 0, 0]
                },
                {
                  text: pageSubtitle,
                  fontSize: 8,
                  color: "#1B365D",
                  bold: true,
                  margin: [0, 2, 0, 0]
                }
              ]
            },
            {
              width: "auto",
              alignment: "right",
              stack: [
                {
                  text: isEn ? `OFFER \u2116 ${form.offerNo}` : `\u041E\u0424\u0415\u0420\u0422\u0410 \u2116 ${form.offerNo}`,
                  fontSize: 13,
                  bold: true,
                  color: "#1B365D"
                },
                {
                  text: isEn ? `Date: ${dateFormatted}` : `\u0414\u0430\u0442\u0430: ${dateFormatted}`,
                  fontSize: 8.5,
                  color: "#334155",
                  margin: [0, 2, 0, 0]
                },
                {
                  text: isEn ? `Validity: ${form.validityDays} days (until ${formatValidUntilDate(form.date, form.validityDays)})  |  Currency: ${COMPANY_INFO.currency}` : `\u0412\u0430\u043B\u0438\u0434\u043D\u043E\u0441\u0442: ${form.validityDays} \u0434\u043D\u0438 (\u0434\u043E ${formatValidUntilDate(form.date, form.validityDays)})  |  \u0412\u0430\u043B\u0443\u0442\u0430: ${COMPANY_INFO.currency}`,
                  fontSize: 8,
                  color: "#64748b",
                  margin: [0, 1, 0, 0]
                }
              ]
            }
          ]
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 6,
              x2: 515,
              y2: 6,
              lineWidth: 1.5,
              lineColor: "#1B365D"
            }
          ],
          margin: [0, 2, 0, 8]
        }
      ],
      ...pageBreakBefore ? { pageBreak: "before" } : {}
    };
  };
  const sectionTitle = (num, title) => ({
    table: {
      widths: ["auto", "*"],
      body: [
        [
          {
            text: num,
            fillColor: "#1B365D",
            color: "#ffffff",
            bold: true,
            fontSize: 9,
            margin: [5, 3, 5, 3]
          },
          {
            text: title,
            fillColor: "#eef2ff",
            color: "#1e1b4b",
            bold: true,
            fontSize: 9.5,
            margin: [8, 3, 6, 3]
          }
        ]
      ]
    },
    layout: "noBorders",
    margin: [0, 6, 0, 5]
  });
  const priceBody = [
    [
      { text: isEn ? "Item / Description" : "\u041F\u043E\u0437\u0438\u0446\u0438\u044F / \u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", style: "th" },
      {
        text: isEn ? "Quantity" : "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E",
        style: "th",
        alignment: "right"
      },
      {
        text: isEn ? "Unit Price" : "\u0415\u0434. \u0446\u0435\u043D\u0430",
        style: "th",
        alignment: "right"
      },
      {
        text: isEn ? "Amount (incl. VAT)" : "\u0421\u0443\u043C\u0430 (\u0441 \u0414\u0414\u0421)",
        style: "th",
        alignment: "right"
      }
    ],
    [
      {
        stack: [
          {
            text: isEn ? `1. Structure \u201C${R.systemName}\u201D, shell stage (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C)` : `1. \u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u201E${R.systemName}\u201C, \u0435\u0442\u0430\u043F \u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C`,
            bold: true,
            fontSize: 9,
            color: "#0f172a"
          },
          {
            text: isEn ? "Manufacturing, delivery and on-site assembly (incl. 20% VAT)" : "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E, \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438 \u043C\u043E\u043D\u0442\u0430\u0436 (\u0441 \u0432\u043A\u043B\u044E\u0447\u0435\u043D 20% \u0414\u0414\u0421)",
            fontSize: 7.5,
            color: "#64748b",
            margin: [0, 1, 0, 0]
          }
        ]
      },
      { text: `${form.areaRzp} m\xB2`, alignment: "right", fontSize: 9 },
      { text: `${calc.structureUnitRate} \u20AC/m\xB2`, alignment: "right", fontSize: 9 },
      {
        text: formatEur(calc.structureTotal),
        alignment: "right",
        bold: true,
        fontSize: 9
      }
    ]
  ];
  if (calc.extraOptionAmount > 0) {
    priceBody.push([
      {
        text: form.extraOptionLabel || (isEn ? "Additional option" : "\u0414\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u043D\u0430 \u043E\u043F\u0446\u0438\u044F"),
        fontSize: 8.5
      },
      { text: "1", alignment: "right", fontSize: 8.5 },
      {
        text: formatEur(calc.extraOptionAmount),
        alignment: "right",
        fontSize: 8.5
      },
      {
        text: formatEur(calc.extraOptionAmount),
        alignment: "right",
        bold: true,
        fontSize: 8.5
      }
    ]);
  }
  if (calc.discountEur > 0) {
    priceBody.push([
      {
        text: isEn ? "Special client discount" : "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u043D\u0430 \u043E\u0442\u0441\u0442\u044A\u043F\u043A\u0430",
        fontSize: 8.5,
        color: "#15803d",
        bold: true
      },
      { text: "\u2014", alignment: "right", fontSize: 8.5 },
      {
        text: `-${formatEur(calc.discountEur)}`,
        alignment: "right",
        fontSize: 8.5,
        color: "#15803d"
      },
      {
        text: `-${formatEur(calc.discountEur)}`,
        alignment: "right",
        bold: true,
        fontSize: 8.5,
        color: "#15803d"
      }
    ]);
  }
  priceBody.push([
    {
      text: isEn ? "Contract Value for Shell Structure (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C), incl. 20% VAT" : "\u0414\u043E\u0433\u043E\u0432\u043E\u0440\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0437\u0430 \u0433\u0440\u0443\u0431 \u0441\u0442\u0440\u043E\u0435\u0436 (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C) \u0441 \u0432\u043A\u043B\u044E\u0447\u0435\u043D 20% \u0414\u0414\u0421",
      colSpan: 3,
      bold: true,
      fontSize: 9,
      fillColor: "#f1f5f9",
      color: "#0f172a"
    },
    {},
    {},
    {
      text: formatEur(calc.contractStructureNet),
      alignment: "right",
      bold: true,
      fontSize: 9.5,
      fillColor: "#f1f5f9",
      color: "#1e1b4b"
    }
  ]);
  if (calc.hasTurnkey) {
    priceBody.push([
      {
        stack: [
          {
            text: isEn ? `2. Additional Turnkey Package (separate package / extra) \u2014 ${calc.turnkeyName}` : `2. \u0414\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u0435\u043D \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C (\u043E\u0442\u0434\u0435\u043B\u0435\u043D \u043F\u0430\u043A\u0435\u0442 / \u0435\u043A\u0441\u0442\u0440\u0430) \u2014 ${calc.turnkeyName}`,
            bold: true,
            fontSize: 9,
            color: "#312e81"
          },
          {
            text: isEn ? "Finishing works per selected material tier (quoted as a separate option)" : "\u0414\u043E\u0432\u044A\u0440\u0448\u0438\u0442\u0435\u043B\u043D\u0438 \u0440\u0430\u0431\u043E\u0442\u0438 \u043F\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u0438\u044F \u043A\u043B\u0430\u0441 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0438 (\u043E\u0442\u0434\u0435\u043B\u043D\u0430 \u043E\u043F\u0446\u0438\u044F \u043A\u044A\u043C \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F\u0442\u0430)",
            fontSize: 7.5,
            color: "#1B365D",
            margin: [0, 1, 0, 0]
          }
        ]
      },
      { text: `${form.areaRzp} m\xB2`, alignment: "right", fontSize: 9 },
      { text: `+${calc.turnkeyUnitRate} \u20AC/m\xB2`, alignment: "right", fontSize: 9 },
      {
        text: formatEur(calc.turnkeyTotal),
        alignment: "right",
        bold: true,
        fontSize: 9,
        color: "#312e81"
      }
    ]);
  }
  if (form.includeFoundation) {
    priceBody.push([
      {
        stack: [
          {
            text: isEn ? "Foundation (Reinforced concrete sub-base)" : "\u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442 (\u0421\u0442\u043E\u043C\u0430\u043D\u043E\u0431\u0435\u0442\u043E\u043D\u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0430 / \u043F\u043B\u043E\u0447\u0430)",
            bold: true,
            fontSize: 8.5,
            color: "#334155"
          },
          {
            text: COMPANY_INFO.foundationDisclaimer[lang],
            fontSize: 7.5,
            italics: true,
            color: "#b45309",
            margin: [0, 1, 0, 0]
          }
        ]
      },
      {
        text: `${calc.effectiveFoundationArea} m\xB2`,
        alignment: "right",
        fontSize: 8.5,
        color: "#475569"
      },
      {
        text: `${calc.foundationUnitRate} \u20AC/m\xB2`,
        alignment: "right",
        fontSize: 8.5,
        color: "#475569"
      },
      {
        text: `\u2248 ${formatEur(calc.foundationTotal)}`,
        alignment: "right",
        bold: true,
        fontSize: 8.5,
        color: "#b45309"
      }
    ]);
  }
  priceBody.push([
    {
      text: form.includeFoundation ? isEn ? "TOTAL (Shell Structure Only + Indicative Foundation)" : "\u041E\u0411\u0429\u041E (\u0421\u0430\u043C\u043E \u0433\u0440\u0443\u0431 \u0441\u0442\u0440\u043E\u0435\u0436 \u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C + \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u0435\u043D \u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442)" : isEn ? "TOTAL (Shell Structure Only \u2014 without foundation)" : "\u041E\u0411\u0429\u041E (\u0421\u0430\u043C\u043E \u0433\u0440\u0443\u0431 \u0441\u0442\u0440\u043E\u0435\u0436 \u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C \u2014 \u0431\u0435\u0437 \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442)",
      colSpan: 3,
      bold: true,
      fontSize: 9,
      fillColor: "#eef2ff",
      color: "#1e1b4b"
    },
    {},
    {},
    {
      text: form.includeFoundation ? `\u2248 ${formatEur(calc.structurePlusFoundationTotal)}` : formatEur(calc.contractStructureNet),
      alignment: "right",
      bold: true,
      fontSize: 9.5,
      fillColor: "#eef2ff",
      color: "#1e1b4b"
    }
  ]);
  if (calc.hasTurnkey) {
    priceBody.push([
      {
        text: form.includeFoundation ? isEn ? `GRAND TOTAL INCL. TURNKEY PACKAGE (${calc.turnkeyName}) + FOUNDATION` : `\u041E\u0411\u0429\u0410 \u0421\u0422\u041E\u0419\u041D\u041E\u0421\u0422 \u0421 \u041F\u0410\u041A\u0415\u0422 \u201E\u0414\u041E \u041A\u041B\u042E\u0427\u201C (${calc.turnkeyName}) + \u0424\u0423\u041D\u0414\u0410\u041C\u0415\u041D\u0422` : isEn ? `GRAND TOTAL INCL. TURNKEY PACKAGE (${calc.turnkeyName})` : `\u041E\u0411\u0429\u0410 \u0421\u0422\u041E\u0419\u041D\u041E\u0421\u0422 \u0421 \u041F\u0410\u041A\u0415\u0422 \u201E\u0414\u041E \u041A\u041B\u042E\u0427\u201C (${calc.turnkeyName})`,
        colSpan: 3,
        bold: true,
        fontSize: 9.5,
        fillColor: "#312e81",
        color: "#ffffff"
      },
      {},
      {},
      {
        text: form.includeFoundation ? `\u2248 ${formatEur(calc.grandTotalWithTurnkey)}` : formatEur(calc.contractWithTurnkeyTotal),
        alignment: "right",
        bold: true,
        fontSize: 10,
        fillColor: "#312e81",
        color: "#ffffff"
      }
    ]);
  }
  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 32, 40, 42],
    info: {
      title: `\u041E\u0424\u0415\u0420\u0422\u0410 \u2116 ${form.offerNo} - ${form.clientName || "Flexi Home"}`,
      author: "FLEXI HOME (\u201E\u0421 1 \u0422\u0420\u0415\u0419\u0414\u201C \u0415\u041E\u041E\u0414)",
      subject: "\u041E\u0444\u0435\u0440\u0442\u0430 \u0437\u0430 \u0441\u0433\u043B\u043E\u0431\u044F\u0435\u043C\u0430 / \u043C\u0435\u0442\u0430\u043B\u043D\u0430 \u043A\u044A\u0449\u0430"
    },
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      color: "#1e293b",
      lineHeight: 1.22
    },
    styles: {
      th: {
        bold: true,
        fontSize: 8.5,
        color: "#ffffff",
        fillColor: "#1e1b4b"
      },
      kvLabel: {
        fontSize: 8.5,
        color: "#475569",
        bold: true
      },
      kvVal: {
        fontSize: 8.5,
        color: "#0f172a",
        bold: true
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    footer: (currentPage, pageCount) => ({
      margin: [40, 6, 40, 0],
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: "#cbd5e1"
            }
          ],
          margin: [0, 0, 0, 4]
        },
        {
          columns: [
            {
              width: "*",
              text: `${COMPANY_INFO.brand} \xB7 ${COMPANY_INFO.legalName} \xB7 ${COMPANY_INFO.phones.join(", ")} \xB7 ${COMPANY_INFO.website}`,
              fontSize: 7.5,
              color: "#64748b"
            },
            {
              width: "auto",
              text: isEn ? `Page ${currentPage} of ${pageCount}` : `\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 ${currentPage} \u043E\u0442 ${pageCount}`,
              fontSize: 7.5,
              bold: true,
              color: "#475569"
            }
          ]
        }
      ]
    }),
    content: [
      // ==================== PAGE 1 ====================
      buildPageHeader(
        isEn ? `Price basis: ${COMPANY_INFO.priceBasis.en}  \xB7  System: ${R.systemName}` : `\u0426\u0435\u043D\u043E\u0432\u0430 \u0431\u0430\u0437\u0430: ${COMPANY_INFO.priceBasis.bg}  \xB7  \u0421\u0438\u0441\u0442\u0435\u043C\u0430: ${R.systemName}`,
        false
      ),
      sectionTitle("01", isEn ? "CUSTOMER & PROJECT" : "\u041A\u041B\u0418\u0415\u041D\u0422 \u0418 \u041E\u0411\u0415\u041A\u0422"),
      {
        table: {
          widths: ["34%", "66%"],
          body: [
            [
              { text: isEn ? "Customer" : "\u041A\u043B\u0438\u0435\u043D\u0442", style: "kvLabel" },
              {
                text: form.clientName ? `${form.clientName}${form.clientPhone ? ` (${form.clientPhone})` : ""}` : "\u2014",
                style: "kvVal"
              }
            ],
            [
              {
                text: isEn ? "Project location" : "\u041C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043D\u0430 \u043E\u0431\u0435\u043A\u0442\u0430",
                style: "kvLabel"
              },
              { text: R.locationFull, style: "kvVal" }
            ],
            [
              {
                text: isEn ? "Structural system" : "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u0438\u0432\u043D\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430",
                style: "kvLabel"
              },
              { text: R.systemName, style: "kvVal" }
            ],
            [
              { text: isEn ? "Storeys & Model" : "\u0415\u0442\u0430\u0436\u043D\u043E\u0441\u0442 \u0438 \u043C\u043E\u0434\u0435\u043B", style: "kvLabel" },
              { text: R.floorsLabel, style: "kvVal" }
            ],
            [
              {
                text: isEn ? "Built-up area (RZP)" : "\u0417\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u043F\u043B\u043E\u0449 (\u0420\u0417\u041F)",
                style: "kvLabel"
              },
              { text: `${form.areaRzp} m\xB2`, style: "kvVal" }
            ],
            [
              {
                text: isEn ? "Foundation footprint area" : "\u041F\u043B\u043E\u0449 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0430\u0442\u0430 (\u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442)",
                style: "kvLabel"
              },
              {
                text: form.includeFoundation ? `${calc.effectiveFoundationArea} m\xB2${form.floors === 2 ? isEn ? " (separate ground footprint for 2-storey building)" : " (\u043E\u0442\u0434\u0435\u043B\u043D\u0430 \u043F\u043B\u043E\u0449 \u043D\u0430 \u0441\u0442\u044A\u043F\u043A\u0430\u0442\u0430 \u0437\u0430 \u0434\u0432\u0443\u0435\u0442\u0430\u0436\u043D\u0430 \u0441\u0433\u0440\u0430\u0434\u0430)" : ""}` : isEn ? "Not included (prepared by client)" : "\u041D\u0435 \u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D (\u0438\u0437\u043F\u044A\u043B\u043D\u044F\u0432\u0430 \u0441\u0435 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430)",
                style: "kvVal"
              }
            ],
            [
              {
                text: isEn ? "Wall & ceiling height" : "\u0412\u0438\u0441\u043E\u0447\u0438\u043D\u0430 \u043D\u0430 \u0441\u0442\u0435\u043D\u0438\u0442\u0435 \u0438 \u0442\u0430\u0432\u0430\u043D",
                style: "kvLabel"
              },
              {
                text: `${R.wallHeightLabel}  |  ${R.ceilingLabel}`,
                style: "kvVal"
              }
            ],
            [
              { text: isEn ? "Roof" : "\u041F\u043E\u043A\u0440\u0438\u0432", style: "kvLabel" },
              { text: R.roofLabel, style: "kvVal" }
            ],
            [
              {
                text: isEn ? "Windows & Joinery" : "\u0414\u043E\u0433\u0440\u0430\u043C\u0430 \u0438 \u0441\u0442\u044A\u043A\u043B\u043E\u043F\u0430\u043A\u0435\u0442",
                style: "kvLabel"
              },
              { text: R.winFullLabel, style: "kvVal" }
            ],
            [
              { text: isEn ? "Facade" : "\u0424\u0430\u0441\u0430\u0434\u0430", style: "kvLabel" },
              { text: R.facadeLabel, style: "kvVal" }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 3.2,
          paddingBottom: () => 3.2
        }
      },
      sectionTitle("02", isEn ? "PRICE" : "\u0426\u0415\u041D\u0410"),
      {
        table: {
          headerRows: 1,
          widths: ["*", 62, 68, 86],
          body: priceBody
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4.2,
          paddingBottom: () => 4.2
        }
      },
      {
        text: isEn ? `Note: This offer is valid for ${form.validityDays} days from issue date. All structure prices include 20% VAT, manufacturing, delivery and assembly. Foundation is indicative (confirmed after site visit and geodetic survey \u2014 not part of the contract value).` : `\u0417\u0430\u0431\u0435\u043B\u0435\u0436\u043A\u0430: \u041E\u0444\u0435\u0440\u0442\u0430\u0442\u0430 \u0435 \u0432\u0430\u043B\u0438\u0434\u043D\u0430 ${form.validityDays} \u0434\u043D\u0438 \u043E\u0442 \u0434\u0430\u0442\u0430\u0442\u0430 \u043D\u0430 \u0438\u0437\u0434\u0430\u0432\u0430\u043D\u0435. \u0412\u0441\u0438\u0447\u043A\u0438 \u0446\u0435\u043D\u0438 \u0437\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u0441\u0430 \u0441 \u0432\u043A\u043B\u044E\u0447\u0435\u043D 20% \u0414\u0414\u0421, \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E, \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u0438 \u043C\u043E\u043D\u0442\u0430\u0436. \u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442\u044A\u0442 \u0435 \u0441 \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 (\u0443\u0442\u043E\u0447\u043D\u044F\u0432\u0430 \u0441\u0435 \u0441\u043B\u0435\u0434 \u043E\u0433\u043B\u0435\u0434 \u0438 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u043D\u043E \u0437\u0430\u0441\u043D\u0435\u043C\u0430\u043D\u0435 \u2014 \u043D\u0435 \u0435 \u0447\u0430\u0441\u0442 \u043E\u0442 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u043D\u0430\u0442\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442).`,
        fontSize: 7.5,
        italics: true,
        color: "#475569",
        margin: [0, 5, 0, 0]
      },
      // ==================== PAGE 2 ====================
      buildPageHeader(
        isEn ? "Sections 03 & 04: Payment Schedule, Delivery Terms & Company Bank Details" : "\u0420\u0430\u0437\u0434\u0435\u043B 03 & 04: \u0421\u0445\u0435\u043C\u0430 \u043D\u0430 \u043F\u043B\u0430\u0449\u0430\u043D\u0435, \u0441\u0440\u043E\u043A\u043E\u0432\u0435 \u0437\u0430 \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D\u0438\u0435 \u0438 \u0431\u0430\u043D\u043A\u043E\u0432\u0438 \u0434\u0430\u043D\u043D\u0438",
        true
      ),
      sectionTitle("03", isEn ? "PAYMENT & TERMS" : "\u041F\u041B\u0410\u0429\u0410\u041D\u0415 \u0418 \u0421\u0420\u041E\u041A\u041E\u0412\u0415"),
      {
        table: {
          headerRows: 1,
          widths: ["*", 65, 95],
          body: [
            [
              {
                text: isEn ? "Payment Stage (based on Shell Structure Contract Value)" : "\u0415\u0442\u0430\u043F \u043D\u0430 \u043F\u043B\u0430\u0449\u0430\u043D\u0435 (\u043F\u043E \u0414\u043E\u0433\u043E\u0432\u043E\u0440\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0437\u0430 \u0433\u0440\u0443\u0431 \u0441\u0442\u0440\u043E\u0435\u0436)",
                style: "th"
              },
              { text: isEn ? "Share" : "\u0414\u044F\u043B", style: "th", alignment: "right" },
              {
                text: isEn ? "Amount (EUR)" : "\u0421\u0443\u043C\u0430 (EUR)",
                style: "th",
                alignment: "right"
              }
            ],
            [
              {
                text: isEn ? "Stage 1: On signing the contract" : "\u041F\u0440\u0438 \u043F\u043E\u0434\u043F\u0438\u0441\u0432\u0430\u043D\u0435 \u043D\u0430 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0430",
                fontSize: 9,
                bold: true
              },
              { text: "50%", alignment: "right", bold: true, fontSize: 9 },
              {
                text: formatEur(calc.paymentStages.stage1_50),
                alignment: "right",
                bold: true,
                fontSize: 9
              }
            ],
            [
              {
                text: isEn ? "Stage 2: On dispatch of the goods from the factory to the customer\u2019s plot" : "\u041F\u0440\u0438 \u0435\u043A\u0441\u043F\u0435\u0434\u0438\u0446\u0438\u044F \u043D\u0430 \u0441\u0442\u043E\u043A\u0430\u0442\u0430 \u043E\u0442 \u0444\u0430\u0431\u0440\u0438\u043A\u0430\u0442\u0430 \u043A\u044A\u043C \u043F\u0430\u0440\u0446\u0435\u043B\u0430 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
                fontSize: 9,
                bold: true
              },
              { text: "40%", alignment: "right", bold: true, fontSize: 9 },
              {
                text: formatEur(calc.paymentStages.stage2_40),
                alignment: "right",
                bold: true,
                fontSize: 9
              }
            ],
            [
              {
                text: isEn ? "Stage 3: After completion of the construction and assembly works" : "\u0421\u043B\u0435\u0434 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430\u043D\u0435 \u043D\u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u043D\u043E-\u043C\u043E\u043D\u0442\u0430\u0436\u043D\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u0438",
                fontSize: 9,
                bold: true
              },
              { text: "10%", alignment: "right", bold: true, fontSize: 9 },
              {
                text: formatEur(calc.paymentStages.stage3_10),
                alignment: "right",
                bold: true,
                fontSize: 9
              }
            ],
            [
              {
                text: isEn ? "Total Contract Value for Shell Structure (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C)" : "\u041E\u0431\u0449\u043E \u043F\u043E \u0434\u043E\u0433\u043E\u0432\u043E\u0440 \u0437\u0430 \u0433\u0440\u0443\u0431 \u0441\u0442\u0440\u043E\u0435\u0436 (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C)",
                bold: true,
                fillColor: "#f1f5f9",
                fontSize: 9
              },
              {
                text: "100%",
                alignment: "right",
                bold: true,
                fillColor: "#f1f5f9",
                fontSize: 9
              },
              {
                text: formatEur(calc.contractStructureNet),
                alignment: "right",
                bold: true,
                fillColor: "#f1f5f9",
                fontSize: 9.5,
                color: "#1e1b4b"
              }
            ],
            ...calc.hasTurnkey ? [
              [
                {
                  text: isEn ? `+ Turnkey Package (${calc.turnkeyName}) \u2014 finishing works schedule` : `+ \u041F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C (${calc.turnkeyName}) \u2014 \u043F\u043E \u0433\u0440\u0430\u0444\u0438\u043A \u0437\u0430 \u0434\u043E\u0432\u044A\u0440\u0448\u0438\u0442\u0435\u043B\u043D\u0438 \u0440\u0430\u0431\u043E\u0442\u0438`,
                  bold: true,
                  fillColor: "#ecfdf5",
                  color: "#065f46",
                  fontSize: 8.5
                },
                {
                  text: "\u2014",
                  alignment: "right",
                  fillColor: "#ecfdf5",
                  color: "#065f46",
                  fontSize: 8.5
                },
                {
                  text: `+${formatEur(calc.turnkeyTotal)}`,
                  alignment: "right",
                  bold: true,
                  fillColor: "#ecfdf5",
                  color: "#065f46",
                  fontSize: 9
                }
              ]
            ] : [],
            ...form.includeFoundation ? [
              [
                {
                  text: isEn ? "+ Foundation (Concrete Base) \u2014 upon base execution" : "+ \u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442 (\u0421\u0442\u043E\u043C\u0430\u043D\u043E\u0431\u0435\u0442\u043E\u043D\u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0430) \u2014 \u043F\u0440\u0438 \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D\u0438\u0435 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0430\u0442\u0430",
                  bold: true,
                  fillColor: "#fffbeb",
                  color: "#92400e",
                  fontSize: 8.5
                },
                {
                  text: "\u2014",
                  alignment: "right",
                  fillColor: "#fffbeb",
                  color: "#92400e",
                  fontSize: 8.5
                },
                {
                  text: `\u2248 +${formatEur(calc.foundationTotal)}`,
                  alignment: "right",
                  bold: true,
                  fillColor: "#fffbeb",
                  color: "#92400e",
                  fontSize: 9
                }
              ]
            ] : [],
            ...calc.hasTurnkey || form.includeFoundation ? [
              [
                {
                  text: isEn ? "TOTAL PROJECT VALUE (ALL SELECTED ITEMS)" : "\u041E\u0411\u0429\u0410 \u0421\u0422\u041E\u0419\u041D\u041E\u0421\u0422 \u041D\u0410 \u041F\u0420\u041E\u0415\u041A\u0422\u0410 (\u0412\u0421\u0418\u0427\u041A\u041E \u0412\u041A\u041B\u042E\u0427\u0415\u041D\u041E)",
                  bold: true,
                  fillColor: "#312e81",
                  color: "#ffffff",
                  fontSize: 9.5
                },
                {
                  text: isEn ? "Total" : "\u041E\u0431\u0449\u043E",
                  alignment: "right",
                  bold: true,
                  fillColor: "#312e81",
                  color: "#c7d2fe",
                  fontSize: 8.5
                },
                {
                  text: `${form.includeFoundation ? "\u2248 " : ""}${formatEur(calc.grandTotalWithTurnkey)}`,
                  alignment: "right",
                  bold: true,
                  fillColor: "#312e81",
                  color: "#ffffff",
                  fontSize: 10
                }
              ]
            ] : []
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 5,
          paddingBottom: () => 5
        }
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    text: COMPANY_INFO.deliveryTerm[lang],
                    bold: true,
                    fontSize: 9.5,
                    color: "#1e1b4b"
                  },
                  {
                    text: isEn ? "The price covers factory manufacturing, delivery to the customer\u2019s plot and complete assembly. Payment stages (50% / 40% / 10%) are calculated strictly on the Shell Structure Contract Value." : "\u0426\u0435\u043D\u0430\u0442\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 \u0444\u0430\u0431\u0440\u0438\u0447\u043D\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E, \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0434\u043E \u043F\u0430\u0440\u0446\u0435\u043B\u0430 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 \u0438 \u043F\u044A\u043B\u0435\u043D \u043C\u043E\u043D\u0442\u0430\u0436. \u041F\u043B\u0430\u0442\u0435\u0436\u043D\u0438\u0442\u0435 \u0442\u0440\u0430\u043D\u0448\u043E\u0432\u0435 (50% / 40% / 10%) \u0441\u0430 \u0438\u0437\u0447\u0438\u0441\u043B\u0435\u043D\u0438 \u0432\u044A\u0440\u0445\u0443 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u043D\u0430\u0442\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0437\u0430 \u0433\u0440\u0443\u0431 \u0441\u0442\u0440\u043E\u0435\u0436.",
                    fontSize: 8,
                    color: "#475569",
                    margin: [0, 2, 0, 0]
                  },
                  ...calc.hasTurnkey ? [
                    {
                      text: isEn ? `* The selected Turnkey Package (${formatEur(calc.turnkeyTotal)}) is paid on a separate schedule aligned with finishing milestones.` : `* \u0418\u0437\u0431\u0440\u0430\u043D\u0438\u044F\u0442 \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C (${formatEur(calc.turnkeyTotal)}) \u0441\u0435 \u0437\u0430\u043F\u043B\u0430\u0449\u0430 \u043F\u043E \u043E\u0442\u0434\u0435\u043B\u0435\u043D \u0433\u0440\u0430\u0444\u0438\u043A \u0441\u044A\u0433\u043B\u0430\u0441\u043D\u043E \u0435\u0442\u0430\u043F\u0438\u0442\u0435 \u043D\u0430 \u0434\u043E\u0432\u044A\u0440\u0448\u0438\u0442\u0435\u043B\u043D\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u0438.`,
                      fontSize: 8,
                      color: "#065f46",
                      margin: [0, 2, 0, 0]
                    }
                  ] : [],
                  ...form.includeFoundation ? [
                    {
                      text: isEn ? `* The Foundation (${formatEur(calc.foundationTotal)}) is billed separately upon base execution.` : `* \u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442\u044A\u0442 (${formatEur(calc.foundationTotal)}) \u0441\u0435 \u0437\u0430\u043F\u043B\u0430\u0449\u0430 \u043E\u0442\u0434\u0435\u043B\u043D\u043E \u043F\u0440\u0438 \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u043D\u0438\u0435 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0430\u0442\u0430.`,
                      fontSize: 8,
                      color: "#92400e",
                      margin: [0, 2, 0, 0]
                    }
                  ] : []
                ],
                fillColor: "#eef2ff",
                margin: [8, 6, 8, 6]
              }
            ]
          ]
        },
        layout: "noBorders",
        margin: [0, 6, 0, 6]
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    text: isEn ? "BANK FINANCING & CREDIT ASSISTANCE  \u2022  PARTNER BANKS" : "\u0411\u0410\u041D\u041A\u041E\u0412\u041E \u0424\u0418\u041D\u0410\u041D\u0421\u0418\u0420\u0410\u041D\u0415 \u0418 \u0421\u042A\u0414\u0415\u0419\u0421\u0422\u0412\u0418\u0415 \u0417\u0410 \u041A\u0420\u0415\u0414\u0418\u0422  \u2022  \u041F\u0410\u0420\u0422\u041D\u042C\u041E\u0420\u0421\u041A\u0418 \u0411\u0410\u041D\u041A\u0418",
                    bold: true,
                    fontSize: 9.5,
                    color: "#065F46"
                  },
                  {
                    text: isEn ? [
                      "\u201ES 1 TRADE\u201C EOOD (Flexi Home) has active financing partnerships with ",
                      { text: "Postbank", bold: true, color: "#047857" },
                      " and ",
                      { text: "UniCredit Bulbank", bold: true, color: "#047857" },
                      ". We provide full credit intermediation and assistance to finance your home under preferential terms."
                    ] : [
                      "\u201E\u0421 1 \u0422\u0420\u0415\u0419\u0414\u201C \u0415\u041E\u041E\u0414 (Flexi Home) \u0438\u043C\u0430 \u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438 \u043F\u0430\u0440\u0442\u043D\u044C\u043E\u0440\u0441\u043A\u0438 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0438 \u0437\u0430 \u043A\u0440\u0435\u0434\u0438\u0442\u0438\u0440\u0430\u043D\u0435 \u0441 ",
                      { text: "Postbank", bold: true, color: "#047857" },
                      " \u0438 ",
                      { text: "UniCredit Bulbank", bold: true, color: "#047857" },
                      ". \u041E\u043A\u0430\u0437\u0432\u0430\u043C\u0435 \u043F\u044A\u043B\u043D\u043E \u0441\u044A\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0438 \u043A\u0440\u0435\u0434\u0438\u0442\u043D\u043E \u043F\u043E\u0441\u0440\u0435\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0437\u0430 \u0444\u0438\u043D\u0430\u043D\u0441\u0438\u0440\u0430\u043D\u0435 \u043D\u0430 \u0412\u0430\u0448\u0438\u044F \u0434\u043E\u043C \u043F\u0440\u0438 \u043F\u0440\u0435\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u0430\u043B\u043D\u0438 \u0443\u0441\u043B\u043E\u0432\u0438\u044F."
                    ],
                    fontSize: 8.5,
                    bold: true,
                    color: "#0f172a",
                    margin: [0, 3, 0, 0]
                  }
                ],
                fillColor: "#ECFDF5",
                margin: [10, 7, 10, 7]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 1.5,
          vLineWidth: (i) => i === 0 ? 4 : 1.5,
          hLineColor: () => "#059669",
          vLineColor: () => "#059669"
        },
        margin: [0, 0, 0, 8]
      },
      ...form.customNotes ? [
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  text: isEn ? `Additional Notes: ${form.customNotes}` : `\u0414\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u043D\u0438 \u0431\u0435\u043B\u0435\u0436\u043A\u0438 \u043A\u044A\u043C \u043E\u0444\u0435\u0440\u0442\u0430\u0442\u0430: ${form.customNotes}`,
                  fontSize: 8.5,
                  fillColor: "#fffbeb",
                  color: "#92400e",
                  margin: [8, 5, 8, 5]
                }
              ]
            ]
          },
          layout: "noBorders",
          margin: [0, 0, 0, 8]
        }
      ] : [],
      sectionTitle(
        "04",
        isEn ? "COMPANY & BANK DETAILS" : "\u0424\u0418\u0420\u041C\u0415\u041D\u0418 \u0418 \u0411\u0410\u041D\u041A\u041E\u0412\u0418 \u0414\u0410\u041D\u041D\u0418"
      ),
      {
        table: {
          widths: ["26%", "74%"],
          body: [
            [
              { text: isEn ? "Company" : "\u0414\u0440\u0443\u0436\u0435\u0441\u0442\u0432\u043E", style: "kvLabel" },
              {
                text: isEn ? COMPANY_INFO.legalNameEn : COMPANY_INFO.legalName,
                style: "kvVal"
              }
            ],
            [
              { text: isEn ? "Company ID (\u0415\u0418\u041A)" : "\u0415\u0418\u041A", style: "kvLabel" },
              { text: COMPANY_INFO.eik, style: "kvVal" }
            ],
            [
              { text: isEn ? "VAT No (\u0414\u0414\u0421 \u2116)" : "\u0414\u0414\u0421 \u2116", style: "kvLabel" },
              { text: COMPANY_INFO.vatNo, style: "kvVal" }
            ],
            [
              { text: isEn ? "Bank" : "\u0411\u0430\u043D\u043A\u0430", style: "kvLabel" },
              {
                text: isEn ? COMPANY_INFO.bankNameEn : COMPANY_INFO.bankName,
                style: "kvVal"
              }
            ],
            [
              { text: "IBAN", style: "kvLabel" },
              { text: COMPANY_INFO.iban, style: "kvVal", color: "#1B365D" }
            ],
            [
              { text: "BIC", style: "kvLabel" },
              { text: COMPANY_INFO.bic, style: "kvVal" }
            ],
            [
              { text: isEn ? "Sofia Office" : "\u041E\u0444\u0438\u0441 \u0421\u043E\u0444\u0438\u044F", style: "kvLabel" },
              {
                text: isEn ? COMPANY_INFO.addressSofiaEn : COMPANY_INFO.addressSofia,
                style: "kvVal"
              }
            ],
            [
              {
                text: isEn ? "Burgas Office" : "\u041E\u0444\u0438\u0441 \u0411\u0443\u0440\u0433\u0430\u0441",
                style: "kvLabel"
              },
              {
                text: isEn ? COMPANY_INFO.addressBurgasEn : COMPANY_INFO.addressBurgas,
                style: "kvVal"
              }
            ],
            [
              { text: isEn ? "Phones" : "\u0422\u0435\u043B\u0435\u0444\u043E\u043D\u0438", style: "kvLabel" },
              { text: COMPANY_INFO.phones.join(", "), style: "kvVal" }
            ],
            [
              { text: isEn ? "Email & Web" : "\u0418\u043C\u0435\u0439\u043B \u0438 \u0423\u0435\u0431", style: "kvLabel" },
              {
                text: `${COMPANY_INFO.email}  |  ${COMPANY_INFO.website}`,
                style: "kvVal"
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 4.5,
          paddingBottom: () => 4.5
        }
      },
      // ==================== PAGE 3 ====================
      buildPageHeader(
        isEn ? `Section 05: Technical Specification \u2014 ${R.systemName}` : `\u0420\u0430\u0437\u0434\u0435\u043B 05: \u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0430 \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u2014 ${R.systemName}`,
        true
      ),
      sectionTitle(
        "05",
        isEn ? "SPECIFICATION OF THE SELECTED SYSTEM" : "\u0421\u041F\u0415\u0426\u0418\u0424\u0418\u041A\u0410\u0426\u0418\u042F \u041D\u0410 \u0418\u0417\u0411\u0420\u0410\u041D\u0410\u0422\u0410 \u0421\u0418\u0421\u0422\u0415\u041C\u0410"
      ),
      {
        table: {
          headerRows: 1,
          widths: ["26%", "74%"],
          body: [
            [
              { text: isEn ? "Element" : "\u0415\u043B\u0435\u043C\u0435\u043D\u0442", style: "th" },
              {
                text: isEn ? "Technical Specification & Description" : "\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0430 \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u0438 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
                style: "th"
              }
            ],
            ...calc.specRows.map((row, idx) => [
              {
                text: row.element,
                bold: true,
                fontSize: 8.5,
                color: "#1e1b4b",
                fillColor: idx % 2 === 0 ? "#f8fafc" : "#ffffff"
              },
              {
                text: row.spec,
                fontSize: 8.3,
                color: "#1e293b",
                fillColor: idx % 2 === 0 ? "#f8fafc" : "#ffffff"
              }
            ])
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      },
      // ==================== PAGE 4 ====================
      buildPageHeader(
        isEn ? "Sections 06 & 07: Scope of Offer & Customer Responsibility" : "\u0420\u0430\u0437\u0434\u0435\u043B 06 & 07: \u041E\u0431\u0445\u0432\u0430\u0442 \u043D\u0430 \u043E\u0444\u0435\u0440\u0442\u0430\u0442\u0430 \u0438 \u043E\u0442\u0433\u043E\u0432\u043E\u0440\u043D\u043E\u0441\u0442 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
        true
      ),
      sectionTitle("06", isEn ? "SCOPE OF THE OFFER" : "\u041E\u0411\u0425\u0412\u0410\u0422 \u041D\u0410 \u041E\u0424\u0415\u0420\u0422\u0410\u0422\u0410"),
      calc.hasTurnkey ? {
        table: {
          headerRows: 1,
          widths: ["100%"],
          body: [
            [
              {
                text: isEn ? "\u2713 Included in the price (Structure + Turnkey Package)" : "\u2713 \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0432 \u0446\u0435\u043D\u0430\u0442\u0430 (\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F + \u041F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C)",
                bold: true,
                fontSize: 9,
                color: "#ffffff",
                fillColor: "#15803d"
              }
            ],
            [
              {
                stack: calc.includedScope.map((item) => ({
                  text: `\u2713  ${item}`,
                  fontSize: 8.2,
                  color: "#14532d",
                  margin: [0, 2, 0, 2]
                })),
                fillColor: "#f0fdf4"
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6
        }
      } : {
        table: {
          headerRows: 1,
          widths: ["50%", "50%"],
          body: [
            [
              {
                text: isEn ? "\u2713 Included in the price" : "\u2713 \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0432 \u0446\u0435\u043D\u0430\u0442\u0430",
                bold: true,
                fontSize: 9,
                color: "#ffffff",
                fillColor: "#15803d"
              },
              {
                text: isEn ? "\u2022 Excluded \u2014 customer\u2019s responsibility" : "\u2022 \u041D\u0435 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 \u2014 \u0437\u0430 \u0441\u043C\u0435\u0442\u043A\u0430 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
                bold: true,
                fontSize: 9,
                color: "#ffffff",
                fillColor: "#b91c1c"
              }
            ],
            [
              {
                stack: calc.includedScope.map((item) => ({
                  text: `\u2713  ${item}`,
                  fontSize: 8.2,
                  color: "#14532d",
                  margin: [0, 2, 0, 2]
                })),
                fillColor: "#f0fdf4"
              },
              {
                stack: calc.excludedScope.map((item) => ({
                  text: `\u2022  ${item}`,
                  fontSize: 8.2,
                  color: "#7f1d1d",
                  margin: [0, 2, 0, 2]
                })),
                fillColor: "#fef2f2"
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6
        }
      },
      {
        text: calc.hasTurnkey ? isEn ? `Active Turnkey Package (${calc.turnkeyName}): all finishing works covered by the package have been automatically moved to \u201CIncluded in the price\u201D.` : `\u0410\u043A\u0442\u0438\u0432\u0435\u043D \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C (${calc.turnkeyName}): \u0434\u043E\u0432\u044A\u0440\u0448\u0438\u0442\u0435\u043B\u043D\u0438\u0442\u0435 \u0434\u0435\u0439\u043D\u043E\u0441\u0442\u0438 \u0441\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E \u043F\u0440\u0435\u0445\u0432\u044A\u0440\u043B\u0435\u043D\u0438 \u0432 \u0433\u0440\u0430\u0444\u0430 \u201E\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0432 \u0446\u0435\u043D\u0430\u0442\u0430\u201C.` : isEn ? "Items in the right-hand column are carried out by Flexi Home only when explicitly selected by the customer via a Turnkey package or separate agreement." : "\u041F\u043E\u0437\u0438\u0446\u0438\u0438\u0442\u0435 \u0432 \u0434\u044F\u0441\u043D\u0430\u0442\u0430 \u043A\u043E\u043B\u043E\u043D\u0430 \u0441\u0435 \u0438\u0437\u043F\u044A\u043B\u043D\u044F\u0432\u0430\u0442 \u043E\u0442 Flexi Home \u0441\u0430\u043C\u043E \u043A\u043E\u0433\u0430\u0442\u043E \u0441\u0430 \u0438\u0437\u0440\u0438\u0447\u043D\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u0438 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 \u0447\u0440\u0435\u0437 \u0434\u043E\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u0435\u043D \u043F\u0430\u043A\u0435\u0442 \u201E\u0414\u043E \u043A\u043B\u044E\u0447\u201C \u0438\u043B\u0438 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u043D\u043E \u0434\u043E\u0433\u043E\u0432\u0430\u0440\u044F\u043D\u0435.",
        fontSize: 7.8,
        italics: true,
        color: "#475569",
        margin: [0, 5, 0, 10]
      },
      sectionTitle(
        "07",
        isEn ? "CUSTOMER RESPONSIBILITY" : "\u041E\u0422\u0413\u041E\u0412\u041E\u0420\u041D\u041E\u0421\u0422 \u041D\u0410 \u041A\u041B\u0418\u0415\u041D\u0422\u0410"
      ),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: CUSTOMER_RESPONSIBILITY[lang],
                fontSize: 8.8,
                color: "#1e293b",
                fillColor: "#f8fafc",
                margin: [8, 7, 8, 7]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1"
        },
        margin: [0, 0, 0, 24]
      },
      {
        columns: [
          {
            width: "46%",
            stack: [
              {
                text: isEn ? "For the Contractor (\u201E\u0421 1 \u0422\u0420\u0415\u0419\u0414\u201C \u0415\u041E\u041E\u0414):" : "\u0417\u0430 \u0418\u0437\u043F\u044A\u043B\u043D\u0438\u0442\u0435\u043B\u044F (\u201E\u0421 1 \u0422\u0420\u0415\u0419\u0414\u201C \u0415\u041E\u041E\u0414):",
                bold: true,
                fontSize: 8.5,
                color: "#334155"
              },
              {
                text: "............................................................",
                margin: [0, 22, 0, 2],
                color: "#94a3b8"
              },
              {
                text: isEn ? "Signature & Stamp / FLEXI HOME" : "\u041F\u043E\u0434\u043F\u0438\u0441 \u0438 \u043F\u0435\u0447\u0430\u0442 / FLEXI HOME",
                fontSize: 7.5,
                color: "#64748b"
              }
            ]
          },
          { width: "8%", text: "" },
          {
            width: "46%",
            stack: [
              {
                text: isEn ? "For the Customer (Client):" : "\u0417\u0430 \u0412\u044A\u0437\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044F (\u041A\u043B\u0438\u0435\u043D\u0442):",
                bold: true,
                fontSize: 8.5,
                color: "#334155"
              },
              {
                text: "............................................................",
                margin: [0, 22, 0, 2],
                color: "#94a3b8"
              },
              {
                text: form.clientName || (isEn ? "Customer Name & Signature" : "\u0418\u043C\u0435 \u0438 \u043F\u043E\u0434\u043F\u0438\u0441 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430"),
                fontSize: 7.5,
                color: "#64748b"
              }
            ]
          }
        ]
      }
    ]
  };
  return docDefinition;
}

// src/lib/shareLinks.ts
function buildOfferShareMessage(form, calc) {
  const isEn = form.lang === "en";
  const totalDisplay = calc.hasTurnkey || form.includeFoundation ? formatEur(calc.grandTotalWithTurnkey) : formatEur(calc.contractStructureNet);
  if (isEn) {
    const lines2 = [
      `Flexi Home | Offer \u2116 ${form.offerNo}`,
      form.clientName ? `Client: ${form.clientName}` : null,
      `Model: ${form.modelCodeLabel} (${form.areaRzp} m\xB2, ${calc.resolvedLabels.floorsLabel})`,
      `System: ${calc.resolvedLabels.systemName}`,
      `Base Structure: ${formatEur(calc.contractStructureNet)}`,
      calc.hasTurnkey ? `Turnkey (${calc.turnkeyName}): +${formatEur(calc.turnkeyTotal)}` : null,
      form.includeFoundation ? `Foundation (${calc.effectiveFoundationArea} m\xB2): +${formatEur(calc.foundationTotal)}` : null,
      `Total: ${totalDisplay}`,
      `flexi-home.eu`
    ];
    return lines2.filter(Boolean).join("\n");
  }
  const lines = [
    `Flexi Home | \u041E\u0444\u0435\u0440\u0442\u0430 \u2116 ${form.offerNo}`,
    form.clientName ? `\u041A\u043B\u0438\u0435\u043D\u0442: ${form.clientName}` : null,
    `\u041C\u043E\u0434\u0435\u043B: ${form.modelCodeLabel} (${form.areaRzp} \u043C\xB2, ${calc.resolvedLabels.floorsLabel})`,
    `\u0421\u0438\u0441\u0442\u0435\u043C\u0430: ${calc.resolvedLabels.systemName}`,
    `\u0413\u0440\u0443\u0431\u0430 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F (\u201E\u0434\u043E \u0442\u0430\u043F\u0430\u201C): ${formatEur(calc.contractStructureNet)}`,
    calc.hasTurnkey ? `\u041F\u0430\u043A\u0435\u0442 ${calc.turnkeyName}: +${formatEur(calc.turnkeyTotal)}` : null,
    form.includeFoundation ? `\u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442 (${calc.effectiveFoundationArea} \u043C\xB2): +${formatEur(calc.foundationTotal)}` : null,
    `\u041E\u0431\u0449\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442: ${totalDisplay}`,
    `flexi-home.eu`
  ];
  return lines.filter(Boolean).join("\n");
}

// src/cli/offerService.ts
function buildOfferFormFromInput(input = {}) {
  const lang = input.lang === "en" ? "en" : "bg";
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const catalogModel = input.catalogModelId ? CATALOG_MODELS.find((m) => m.id === input.catalogModelId) : void 0;
  const baseFloors = input.floors ?? catalogModel?.floors ?? 1;
  const baseArea = input.areaRzp ?? catalogModel?.area ?? 85;
  const baseFootprint = catalogModel?.footprint ?? (baseFloors === 2 ? Math.round(baseArea / 2) : baseArea);
  return {
    lang,
    offerNo: input.offerNo || generateOfferNumber(false),
    date: input.date || today,
    validityDays: input.validityDays ?? 30,
    clientName: input.clientName || (lang === "en" ? "Client" : "\u041A\u043B\u0438\u0435\u043D\u0442"),
    clientPhone: input.clientPhone || "",
    country: input.country || (lang === "en" ? "Bulgaria" : "\u0411\u044A\u043B\u0433\u0430\u0440\u0438\u044F"),
    region: input.region || "",
    location: input.location || (lang === "en" ? "Sofia" : "\u0433\u0440. \u0421\u043E\u0444\u0438\u044F"),
    fullAddress: input.fullAddress || "",
    permitStatus: input.permitStatus || "unknown",
    catalogModelId: input.catalogModelId || "custom",
    modelCodeLabel: input.modelCodeLabel ?? (catalogModel ? catalogModel.code : ""),
    system: input.system || "press_standard",
    floors: baseFloors,
    pressTwoFloorVariant: input.pressTwoFloorVariant || "489",
    areaRzp: baseArea,
    includeFoundation: input.includeFoundation ?? true,
    foundationArea: input.foundationArea ?? baseFootprint,
    turnkeyPackage: input.turnkeyPackage || "none",
    structureRateOverride: input.structureRateOverride ?? null,
    foundationRateOverride: input.foundationRateOverride ?? null,
    turnkeyRateOverride: input.turnkeyRateOverride ?? null,
    roofColorKey: input.roofColorKey || "unknown",
    winColorKey: input.winColorKey || "unknown",
    winProfileKey: input.winProfileKey || "pvc_5ch",
    winGlazingKey: input.winGlazingKey || "double",
    facadeKey: input.facadeKey || "panel_smooth",
    wallHeightKey: input.wallHeightKey || "250",
    ceilingInsulKey: input.ceilingInsulKey || "80",
    extWallCm: input.extWallCm,
    intWallCm: input.intWallCm,
    systemCustomText: input.systemCustomText,
    roofCustomText: input.roofCustomText,
    winCustomText: input.winCustomText,
    facadeCustomText: input.facadeCustomText,
    wallHeightCustomText: input.wallHeightCustomText,
    ceilingCustomText: input.ceilingCustomText,
    extraOptionLabel: input.extraOptionLabel || "",
    extraOptionAmount: input.extraOptionAmount || 0,
    discountEur: input.discountEur || 0,
    customNotes: input.customNotes || ""
  };
}
function computeOfferResult(input = {}) {
  const form = buildOfferFormFromInput(input);
  const calculation = calculateOffer(form, DEFAULT_PRICING_CONFIG);
  const shareText = buildOfferShareMessage(form, calculation);
  const suggestedPdfFilename = formatOfferFilename(form);
  return { form, calculation, shareText, suggestedPdfFilename };
}
function readLocalLogoDataUrl() {
  try {
    const candidates = [
      path.resolve(process.cwd(), "public/flexi-home-logo.jpg"),
      path.resolve(__dirname, "../public/flexi-home-logo.jpg")
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const b64 = fs.readFileSync(p).toString("base64");
        return `data:image/jpeg;base64,${b64}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}
async function generateOfferPdfBuffer(input = {}) {
  const { form, calculation, suggestedPdfFilename } = computeOfferResult(input);
  const req = createRequire(import.meta.url);
  const pdfMake = req("pdfmake/build/pdfmake.js");
  const pdfFonts = req("pdfmake/build/vfs_fonts.js");
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
  const buffer = await new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buf) => {
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
    calculation
  };
}
function getCatalogPayload() {
  return {
    models: CATALOG_MODELS.map((m) => ({
      id: m.id,
      code: m.code,
      floors: m.floors,
      area: m.area,
      footprint: m.footprint,
      bedrooms: m.bedrooms,
      summaryBg: m.summaryBg,
      summaryEn: m.summaryEn
    })),
    systems: Object.entries(SYSTEM_META).filter(([key]) => key !== "press_economy").map(([key, meta]) => ({
      key,
      name: meta.name,
      shortDesc: meta.shortDesc
    })),
    turnkeyPackages: Object.entries(TURNKEY_META).map(([key, meta]) => ({
      key,
      label: meta.label,
      docName: meta.docName
    })),
    roofColors: ROOF_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    windowColors: WIN_COLOR_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    windowProfiles: WIN_PROFILE_OPTIONS,
    windowGlazings: WIN_GLAZING_OPTIONS,
    facades: FACADE_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    wallHeights: WALL_HEIGHT_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
    permitStatuses: PERMIT_STATUS_OPTIONS,
    defaultPricingConfig: DEFAULT_PRICING_CONFIG
  };
}

// src/cli/mcpHandler.ts
import fs2 from "node:fs";
import path2 from "node:path";
var MCP_TOOLS = [
  {
    name: "list_catalog",
    description: "List all Flexi Home catalog models, structural systems, turnkey finishing packages, roof/window/facade options, and default EUR pricing rates.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "calculate_offer",
    description: "Calculate a Flexi Home prefabricated house price offer (incl. 20% VAT), payment schedule (50/40/10), turnkey package, foundation estimate, and shareable summary text.",
    inputSchema: {
      type: "object",
      properties: {
        lang: { type: "string", enum: ["bg", "en"], default: "bg" },
        clientName: { type: "string" },
        clientPhone: { type: "string" },
        location: { type: "string" },
        catalogModelId: { type: "string" },
        areaRzp: { type: "number" },
        floors: { type: "number", enum: [1, 2] },
        system: {
          type: "string",
          enum: ["press_standard", "steel_frame", "reinforced_metal"]
        },
        turnkeyPackage: {
          type: "string",
          enum: ["none", "standard", "luxury_680", "custom"]
        },
        turnkeyRateOverride: { type: "number" },
        includeFoundation: { type: "boolean" },
        foundationArea: { type: "number" },
        foundationRateOverride: { type: "number" },
        structureRateOverride: { type: "number" },
        discountEur: { type: "number" },
        extWallCm: { type: "number" },
        intWallCm: { type: "number" },
        wallHeightKey: { type: "string", enum: ["250", "280", "300", "custom"] },
        wallHeightCustomText: { type: "string" },
        roofColorKey: {
          type: "string",
          enum: ["black", "red", "green", "white", "unknown"]
        },
        winColorKey: {
          type: "string",
          enum: ["anthracite", "oak", "white", "unknown"]
        },
        facadeKey: {
          type: "string",
          enum: [
            "panel_smooth",
            "panel_smooth_unpainted",
            "wood_siding",
            "wood_decor",
            "white_plaster",
            "insul_10cm",
            "etalbond"
          ]
        },
        permitStatus: {
          type: "string",
          enum: ["has", "process", "none", "unknown"]
        },
        validityDays: { type: "number", default: 30 },
        customNotes: { type: "string" }
      }
    }
  },
  {
    name: "generate_offer_pdf",
    description: "Generate the 4-page Flexi Home offer PDF. Optionally writes to outputPath on disk (when running locally) and always returns calculation + base64 PDF metadata.",
    inputSchema: {
      type: "object",
      properties: {
        outputPath: {
          type: "string",
          description: "Optional local file path to save the generated PDF."
        },
        offer: {
          type: "object",
          description: "Offer input fields (same fields as calculate_offer)."
        }
      }
    }
  }
];
async function handleMcpRequest(req) {
  const id = req.id ?? null;
  if (req.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "flexi-oferta-mcp",
          version: "1.0.0"
        }
      }
    };
  }
  if (req.method === "notifications/initialized" || req.method === "ping") {
    return req.id !== void 0 ? { jsonrpc: "2.0", id, result: {} } : null;
  }
  if (req.method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: MCP_TOOLS
      }
    };
  }
  if (req.method === "tools/call") {
    const params = req.params || {};
    const toolName = String(params.name || "");
    const args = params.arguments || {};
    if (toolName === "list_catalog") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(getCatalogPayload(), null, 2)
            }
          ]
        }
      };
    }
    if (toolName === "calculate_offer") {
      const result = computeOfferResult(args);
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };
    }
    if (toolName === "generate_offer_pdf") {
      const offerInput = args.offer || args;
      const { buffer, filename, form, calculation } = await generateOfferPdfBuffer(offerInput);
      const outputPath = typeof args.outputPath === "string" && args.outputPath.trim() ? path2.resolve(args.outputPath.trim()) : null;
      if (outputPath) {
        fs2.mkdirSync(path2.dirname(outputPath), { recursive: true });
        fs2.writeFileSync(outputPath, buffer);
      }
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ok: true,
                  filename,
                  savedTo: outputPath,
                  sizeBytes: buffer.length,
                  pdfBase64: outputPath ? void 0 : buffer.toString("base64"),
                  offerNo: form.offerNo,
                  grandTotalWithTurnkey: calculation.grandTotalWithTurnkey,
                  contractStructureNet: calculation.contractStructureNet
                },
                null,
                2
              )
            }
          ]
        }
      };
    }
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Unknown tool: ${toolName}`
      }
    };
  }
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${req.method}`
    }
  };
}

// src/cli/index.ts
function parseCliArgs(argv) {
  const [command = "help", ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (!arg.startsWith("--")) continue;
    const eqIdx = arg.indexOf("=");
    if (eqIdx > 2) {
      flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }
  return { command, flags };
}
function buildInputFromFlags(flags) {
  const base = typeof flags.json === "string" ? JSON.parse(flags.json) : {};
  if (typeof flags.lang === "string") {
    base.lang = flags.lang === "en" ? "en" : "bg";
  }
  if (typeof flags.client === "string") base.clientName = flags.client;
  if (typeof flags.phone === "string") base.clientPhone = flags.phone;
  if (typeof flags.location === "string") base.location = flags.location;
  if (typeof flags.model === "string") base.catalogModelId = flags.model;
  if (typeof flags.area === "string") base.areaRzp = Number(flags.area);
  if (typeof flags.floors === "string") {
    base.floors = Number(flags.floors) === 2 ? 2 : 1;
  }
  if (typeof flags.system === "string") {
    base.system = flags.system;
  }
  if (typeof flags.turnkey === "string") {
    base.turnkeyPackage = flags.turnkey;
  }
  if (typeof flags["turnkey-rate"] === "string") {
    base.turnkeyRateOverride = Number(flags["turnkey-rate"]);
  }
  if (flags.foundation === true) base.includeFoundation = true;
  if (flags["no-foundation"] === true) base.includeFoundation = false;
  if (typeof flags["foundation-area"] === "string") {
    base.foundationArea = Number(flags["foundation-area"]);
  }
  if (typeof flags.discount === "string") {
    base.discountEur = Number(flags.discount);
  }
  if (typeof flags["ext-wall"] === "string") {
    base.extWallCm = Number(flags["ext-wall"]);
  }
  if (typeof flags["int-wall"] === "string") {
    base.intWallCm = Number(flags["int-wall"]);
  }
  if (typeof flags["wall-height"] === "string") {
    base.wallHeightKey = flags["wall-height"];
  }
  if (typeof flags["wall-height-text"] === "string") {
    base.wallHeightCustomText = flags["wall-height-text"];
  }
  if (typeof flags.roof === "string") {
    base.roofColorKey = flags.roof;
  }
  if (typeof flags["win-color"] === "string") {
    base.winColorKey = flags["win-color"];
  }
  if (typeof flags.facade === "string") {
    base.facadeKey = flags.facade;
  }
  if (typeof flags.permit === "string") {
    base.permitStatus = flags.permit;
  }
  if (typeof flags.validity === "string") {
    base.validityDays = Number(flags.validity);
  }
  if (typeof flags.notes === "string") {
    base.customNotes = flags.notes;
  }
  return base;
}
function runStdioMcp() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  });
  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const req = JSON.parse(trimmed);
      const resp = await handleMcpRequest(req);
      if (resp) {
        process.stdout.write(`${JSON.stringify(resp)}
`);
      }
    } catch (err) {
      process.stdout.write(
        `${JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: err instanceof Error ? err.message : "Parse error"
          }
        })}
`
      );
    }
  });
}
async function main() {
  const { command, flags } = parseCliArgs(process.argv.slice(2));
  if (command === "mcp") {
    runStdioMcp();
    return;
  }
  if (command === "catalog") {
    process.stdout.write(`${JSON.stringify(getCatalogPayload(), null, 2)}
`);
    return;
  }
  if (command === "calc") {
    const input = buildInputFromFlags(flags);
    const result = computeOfferResult(input);
    if (typeof flags.out === "string") {
      const { buffer, filename } = await generateOfferPdfBuffer(input);
      const outPath = path3.resolve(flags.out || filename);
      fs3.mkdirSync(path3.dirname(outPath), { recursive: true });
      fs3.writeFileSync(outPath, buffer);
      process.stdout.write(
        `${JSON.stringify({ ...result, pdfSavedTo: outPath }, null, 2)}
`
      );
      return;
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}
`);
    return;
  }
  if (command === "pdf") {
    const input = buildInputFromFlags(flags);
    const { buffer, filename, calculation, form } = await generateOfferPdfBuffer(input);
    const outPath = path3.resolve(
      typeof flags.out === "string" ? flags.out : filename
    );
    fs3.mkdirSync(path3.dirname(outPath), { recursive: true });
    fs3.writeFileSync(outPath, buffer);
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          pdfSavedTo: outPath,
          sizeBytes: buffer.length,
          offerNo: form.offerNo,
          contractStructureNet: calculation.contractStructureNet,
          grandTotalWithTurnkey: calculation.grandTotalWithTurnkey
        },
        null,
        2
      )}
`
    );
    return;
  }
  process.stdout.write(
    `Flexi Home \u041E\u0424\u0415\u0420\u0422\u0410 CLI & MCP

Commands:
  flexi-oferta catalog                     List models, systems, options, and rates (JSON)
  flexi-oferta calc [flags]                Calculate offer & payment schedule (JSON)
  flexi-oferta pdf [flags] --out FILE.pdf  Generate 4-page PDF offer
  flexi-oferta mcp                         Start stdio MCP server for Claude / AI agents

Common flags:
  --lang bg|en  --client "Name"  --phone "+359..."  --location "Sofia"
  --model e85|custom  --area 100  --floors 1|2
  --system press_standard|steel_frame|reinforced_metal
  --turnkey none|standard|luxury_680|custom  --foundation / --no-foundation
  --roof black|red|green|white|unknown  --win-color anthracite|oak|white|unknown
  --facade panel_smooth|panel_smooth_unpainted|...
  --permit has|process|none|unknown  --validity 30  --out offer.pdf
`
  );
}
main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}
`);
  process.exit(1);
});
