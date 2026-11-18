#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {
  computeOfferResult,
  generateOfferPdfBuffer,
  getCatalogPayload,
} from './offerService';
import { handleMcpRequest, JsonRpcRequest } from './mcpHandler';
import { OfferFormState } from '@/types/offer';

function parseCliArgs(argv: string[]): {
  command: string;
  flags: Record<string, string | boolean>;
} {
  const [command = 'help', ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (!arg.startsWith('--')) continue;
    const eqIdx = arg.indexOf('=');
    if (eqIdx > 2) {
      flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }
  return { command, flags };
}

function buildInputFromFlags(
  flags: Record<string, string | boolean>
): Partial<OfferFormState> {
  const base: Partial<OfferFormState> =
    typeof flags.json === 'string' ? JSON.parse(flags.json) : {};

  if (typeof flags.lang === 'string') {
    base.lang = flags.lang === 'en' ? 'en' : 'bg';
  }
  if (typeof flags.client === 'string') base.clientName = flags.client;
  if (typeof flags.phone === 'string') base.clientPhone = flags.phone;
  if (typeof flags.location === 'string') base.location = flags.location;
  if (typeof flags.model === 'string') base.catalogModelId = flags.model;
  if (typeof flags.area === 'string') base.areaRzp = Number(flags.area);
  if (typeof flags.floors === 'string') {
    base.floors = Number(flags.floors) === 2 ? 2 : 1;
  }
  if (typeof flags.system === 'string') {
    base.system = flags.system as OfferFormState['system'];
  }
  if (typeof flags.turnkey === 'string') {
    base.turnkeyPackage = flags.turnkey as OfferFormState['turnkeyPackage'];
  }
  if (typeof flags['turnkey-rate'] === 'string') {
    base.turnkeyRateOverride = Number(flags['turnkey-rate']);
  }
  if (flags.foundation === true) base.includeFoundation = true;
  if (flags['no-foundation'] === true) base.includeFoundation = false;
  if (typeof flags['foundation-area'] === 'string') {
    base.foundationArea = Number(flags['foundation-area']);
  }
  if (typeof flags.discount === 'string') {
    base.discountEur = Number(flags.discount);
  }
  if (typeof flags['ext-wall'] === 'string') {
    base.extWallCm = Number(flags['ext-wall']);
  }
  if (typeof flags['int-wall'] === 'string') {
    base.intWallCm = Number(flags['int-wall']);
  }
  if (typeof flags['wall-height'] === 'string') {
    base.wallHeightKey = flags['wall-height'] as OfferFormState['wallHeightKey'];
  }
  if (typeof flags['wall-height-text'] === 'string') {
    base.wallHeightCustomText = flags['wall-height-text'];
  }
  if (typeof flags.roof === 'string') {
    base.roofColorKey = flags.roof as OfferFormState['roofColorKey'];
  }
  if (typeof flags['win-color'] === 'string') {
    base.winColorKey = flags['win-color'] as OfferFormState['winColorKey'];
  }
  if (typeof flags.facade === 'string') {
    base.facadeKey = flags.facade as OfferFormState['facadeKey'];
  }
  if (typeof flags.permit === 'string') {
    base.permitStatus = flags.permit as OfferFormState['permitStatus'];
  }
  if (typeof flags.validity === 'string') {
    base.validityDays = Number(flags.validity);
  }
  if (typeof flags.notes === 'string') {
    base.customNotes = flags.notes;
  }
  return base;
}

function runStdioMcp() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const req = JSON.parse(trimmed) as JsonRpcRequest;
      const resp = await handleMcpRequest(req);
      if (resp) {
        process.stdout.write(`${JSON.stringify(resp)}\n`);
      }
    } catch (err) {
      process.stdout.write(
        `${JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: err instanceof Error ? err.message : 'Parse error',
          },
        })}\n`
      );
    }
  });
}

async function main() {
  const { command, flags } = parseCliArgs(process.argv.slice(2));

  if (command === 'mcp') {
    runStdioMcp();
    return;
  }

  if (command === 'catalog') {
    process.stdout.write(`${JSON.stringify(getCatalogPayload(), null, 2)}\n`);
    return;
  }

  if (command === 'calc') {
    const input = buildInputFromFlags(flags);
    const result = computeOfferResult(input);
    if (typeof flags.out === 'string') {
      const { buffer, filename } = await generateOfferPdfBuffer(input);
      const outPath = path.resolve(flags.out || filename);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buffer);
      process.stdout.write(
        `${JSON.stringify({ ...result, pdfSavedTo: outPath }, null, 2)}\n`
      );
      return;
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (command === 'pdf') {
    const input = buildInputFromFlags(flags);
    const { buffer, filename, calculation, form } =
      await generateOfferPdfBuffer(input);
    const outPath = path.resolve(
      typeof flags.out === 'string' ? flags.out : filename
    );
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          pdfSavedTo: outPath,
          sizeBytes: buffer.length,
          offerNo: form.offerNo,
          contractStructureNet: calculation.contractStructureNet,
          grandTotalWithTurnkey: calculation.grandTotalWithTurnkey,
        },
        null,
        2
      )}\n`
    );
    return;
  }

  process.stdout.write(
    `Flexi Home ОФЕРТА CLI & MCP

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
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
