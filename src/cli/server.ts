#!/usr/bin/env node
import http from 'node:http';
import {
  computeOfferResult,
  generateOfferPdfBuffer,
  getCatalogPayload,
} from './offerService';
import { handleMcpRequest, JsonRpcRequest } from './mcpHandler';
import { OfferFormState } from '@/types/offer';

const PORT = Number(process.env.PORT || 8787);

function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  setCorsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, { ok: true, service: 'flexi-oferta-api' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/catalog') {
      sendJson(res, 200, getCatalogPayload());
      return;
    }

    if (req.method === 'POST' && pathname === '/api/offer/calculate') {
      const body = (await readJsonBody(req)) as Partial<OfferFormState>;
      const result = computeOfferResult(body);
      sendJson(res, 200, { ok: true, ...result });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/offer/pdf') {
      const body = (await readJsonBody(req)) as Partial<OfferFormState>;
      const { buffer, filename, form, calculation } =
        await generateOfferPdfBuffer(body);
      if (url.searchParams.get('format') === 'base64') {
        sendJson(res, 200, {
          ok: true,
          filename,
          sizeBytes: buffer.length,
          pdfBase64: buffer.toString('base64'),
          offerNo: form.offerNo,
          contractStructureNet: calculation.contractStructureNet,
          grandTotalWithTurnkey: calculation.grandTotalWithTurnkey,
        });
        return;
      }
      setCorsHeaders(res);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
      return;
    }

    if (req.method === 'POST' && pathname === '/mcp') {
      const rpcReq = (await readJsonBody(req)) as unknown as JsonRpcRequest;
      const rpcResp = await handleMcpRequest(rpcReq);
      sendJson(res, 200, rpcResp ?? {});
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 400, {
      error: err instanceof Error ? err.message : 'Bad request',
    });
  }
});

server.listen(PORT, () => {
  process.stdout.write(
    `Flexi Home ОФЕРТА API & MCP server listening on http://localhost:${PORT}\n`
  );
});
