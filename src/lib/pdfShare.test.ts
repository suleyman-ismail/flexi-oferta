import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_PRICING_CONFIG } from './constants';
import { calculateOffer } from './pricingEngine';
import { createInitialFormState } from '@/store/useOfferStore';

vi.mock('pdfmake/build/pdfmake', () => ({
  default: {
    vfs: {},
    createPdf: vi.fn(() => ({
      getBlob: (cb: (blob: Blob) => void) => {
        cb(new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }));
      },
      download: vi.fn(),
    })),
  },
}));

vi.mock('pdfmake/build/vfs_fonts', () => ({
  default: {
    pdfMake: { vfs: {} },
  },
}));

import { shareBulgarianOfferPdf } from './pdfGenerator';

describe('shareBulgarianOfferPdf (Web Share API)', () => {
  const form = createInitialFormState('bg');
  const calc = calculateOffer(form, DEFAULT_PRICING_CONFIG);

  const originalShare = navigator.share;
  const originalCanShare = navigator.canShare;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-pdf');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: originalCanShare,
      configurable: true,
      writable: true,
    });
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it('uses navigator.share with PDF file when supported', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    const canShareMock = vi.fn().mockReturnValue(true);

    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const outcome = await shareBulgarianOfferPdf(form, calc);
    expect(outcome).toBe('shared');
    expect(canShareMock).toHaveBeenCalledTimes(1);
    expect(shareMock).toHaveBeenCalledTimes(1);
    const sharePayload = shareMock.mock.calls[0][0];
    expect(sharePayload.files).toHaveLength(1);
    expect(sharePayload.files[0].type).toBe('application/pdf');
  });

  it('returns cancelled when user dismisses native share sheet (AbortError)', async () => {
    const abortErr = Object.assign(new Error('Share aborted'), {
      name: 'AbortError',
    });
    const shareMock = vi.fn().mockRejectedValue(abortErr);
    const canShareMock = vi.fn().mockReturnValue(true);

    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const outcome = await shareBulgarianOfferPdf(form, calc);
    expect(outcome).toBe('cancelled');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('falls back to blob download when navigator.share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    const outcome = await shareBulgarianOfferPdf(form, calc);
    expect(outcome).toBe('downloaded');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
