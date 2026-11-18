import fs from 'node:fs';
import path from 'node:path';
import {
  computeOfferResult,
  generateOfferPdfBuffer,
  getCatalogPayload,
} from './offerService';
import { OfferFormState } from '@/types/offer';

export interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export const MCP_TOOLS = [
  {
    name: 'list_catalog',
    description:
      'List all Flexi Home catalog models, structural systems, turnkey finishing packages, roof/window/facade options, and default EUR pricing rates.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'calculate_offer',
    description:
      'Calculate a Flexi Home prefabricated house price offer (incl. 20% VAT), payment schedule (50/40/10), turnkey package, foundation estimate, and shareable summary text.',
    inputSchema: {
      type: 'object',
      properties: {
        lang: { type: 'string', enum: ['bg', 'en'], default: 'bg' },
        clientName: { type: 'string' },
        clientPhone: { type: 'string' },
        location: { type: 'string' },
        catalogModelId: { type: 'string' },
        areaRzp: { type: 'number' },
        floors: { type: 'number', enum: [1, 2] },
        system: {
          type: 'string',
          enum: ['press_standard', 'steel_frame', 'reinforced_metal'],
        },
        turnkeyPackage: {
          type: 'string',
          enum: ['none', 'standard', 'luxury_680', 'custom'],
        },
        turnkeyRateOverride: { type: 'number' },
        includeFoundation: { type: 'boolean' },
        foundationArea: { type: 'number' },
        foundationRateOverride: { type: 'number' },
        structureRateOverride: { type: 'number' },
        discountEur: { type: 'number' },
        extWallCm: { type: 'number' },
        intWallCm: { type: 'number' },
        wallHeightKey: { type: 'string', enum: ['250', '280', '300', 'custom'] },
        wallHeightCustomText: { type: 'string' },
        roofColorKey: {
          type: 'string',
          enum: ['black', 'red', 'green', 'white', 'unknown'],
        },
        winColorKey: {
          type: 'string',
          enum: ['anthracite', 'oak', 'white', 'unknown'],
        },
        facadeKey: {
          type: 'string',
          enum: [
            'panel_smooth',
            'panel_smooth_unpainted',
            'wood_siding',
            'wood_decor',
            'white_plaster',
            'insul_10cm',
            'etalbond',
          ],
        },
        permitStatus: {
          type: 'string',
          enum: ['has', 'process', 'none', 'unknown'],
        },
        validityDays: { type: 'number', default: 30 },
        customNotes: { type: 'string' },
      },
    },
  },
  {
    name: 'generate_offer_pdf',
    description:
      'Generate the 4-page Flexi Home offer PDF. Optionally writes to outputPath on disk (when running locally) and always returns calculation + base64 PDF metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        outputPath: {
          type: 'string',
          description: 'Optional local file path to save the generated PDF.',
        },
        offer: {
          type: 'object',
          description: 'Offer input fields (same fields as calculate_offer).',
        },
      },
    },
  },
];

export async function handleMcpRequest(req: JsonRpcRequest) {
  const id = req.id ?? null;

  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'flexi-oferta-mcp',
          version: '1.0.0',
        },
      },
    };
  }

  if (req.method === 'notifications/initialized' || req.method === 'ping') {
    return req.id !== undefined ? { jsonrpc: '2.0', id, result: {} } : null;
  }

  if (req.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS,
      },
    };
  }

  if (req.method === 'tools/call') {
    const params = req.params || {};
    const toolName = String(params.name || '');
    const args = (params.arguments || {}) as Record<string, unknown>;

    if (toolName === 'list_catalog') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(getCatalogPayload(), null, 2),
            },
          ],
        },
      };
    }

    if (toolName === 'calculate_offer') {
      const result = computeOfferResult(args as Partial<OfferFormState>);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    }

    if (toolName === 'generate_offer_pdf') {
      const offerInput = (args.offer || args) as Partial<OfferFormState>;
      const { buffer, filename, form, calculation } =
        await generateOfferPdfBuffer(offerInput);
      const outputPath =
        typeof args.outputPath === 'string' && args.outputPath.trim()
          ? path.resolve(args.outputPath.trim())
          : null;
      if (outputPath) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buffer);
      }
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  ok: true,
                  filename,
                  savedTo: outputPath,
                  sizeBytes: buffer.length,
                  pdfBase64: outputPath ? undefined : buffer.toString('base64'),
                  offerNo: form.offerNo,
                  grandTotalWithTurnkey: calculation.grandTotalWithTurnkey,
                  contractStructureNet: calculation.contractStructureNet,
                },
                null,
                2
              ),
            },
          ],
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Unknown tool: ${toolName}`,
      },
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${req.method}`,
    },
  };
}
