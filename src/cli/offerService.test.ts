import { describe, it, expect } from 'vitest';
import { computeOfferResult, getCatalogPayload } from './offerService';
import { handleMcpRequest } from './mcpHandler';

describe('CLI & MCP offerService', () => {
  it('computes offer totals with 30-day default validity and catalog options', () => {
    const res = computeOfferResult({
      clientName: 'Иван Петров',
      areaRzp: 100,
      system: 'steel_frame',
      turnkeyPackage: 'standard',
      includeFoundation: true,
      foundationArea: 100,
    });
    expect(res.form.validityDays).toBe(30);
    expect(res.calculation.contractStructureNet).toBe(50600);
    expect(res.calculation.turnkeyTotal).toBe(42000);
    expect(res.calculation.foundationTotal).toBe(14000);
    expect(res.calculation.grandTotalWithTurnkey).toBe(106600);
  });

  it('excludes press_economy from catalog systems and exposes unpainted smooth facade', () => {
    const catalog = getCatalogPayload();
    expect(catalog.systems.some((s) => s.key === 'press_economy')).toBe(false);
    expect(
      catalog.facades.some((f) => f.key === 'panel_smooth_unpainted')
    ).toBe(true);
  });

  it('handles MCP tools/list and calculate_offer JSON-RPC calls', async () => {
    const listResp = await handleMcpRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });
    expect(listResp?.result?.tools).toHaveLength(3);

    const calcResp = await handleMcpRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'calculate_offer',
        arguments: { areaRzp: 80, system: 'press_standard', includeFoundation: false },
      },
    });
    expect(calcResp?.result?.content?.[0]?.type).toBe('text');
  });
});
