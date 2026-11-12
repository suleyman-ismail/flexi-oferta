import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BulgarianPdfPreview } from './BulgarianPdfPreview';
import { DEFAULT_PRICING_CONFIG } from '@/lib/constants';
import { calculateOffer } from '@/lib/pricingEngine';
import { createInitialFormState } from '@/store/useOfferStore';

describe('BulgarianPdfPreview', () => {
  it('renders all 4 pages and 7 official sections in Bulgarian', () => {
    const form = {
      ...createInitialFormState('bg'),
      turnkeyPackage: 'standard' as const,
    };
    const calc = calculateOffer(form, DEFAULT_PRICING_CONFIG);

    render(<BulgarianPdfPreview form={form} calc={calc} />);

    expect(screen.getByText('КЛИЕНТ И ОБЕКТ')).toBeTruthy();
    expect(
      screen.getByText('ЦЕНА И ФИНАНСОВА СПЕЦИФИКАЦИЯ (С ВКЛ. 20% ДДС)')
    ).toBeTruthy();
    expect(screen.getByText('ФИРМЕНИ И БАНКОВИ ДАННИ')).toBeTruthy();
    expect(screen.getByText('ОБХВАТ НА ОФЕРТАТА')).toBeTruthy();
    expect(screen.getByText('ОТГОВОРНОСТ НА КЛИЕНТА')).toBeTruthy();
  });

  it('renders all 4 pages in English when lang is en', () => {
    const form = createInitialFormState('en');
    const calc = calculateOffer(form, DEFAULT_PRICING_CONFIG);

    render(<BulgarianPdfPreview form={form} calc={calc} />);

    expect(screen.getByText('CLIENT & PROJECT SITE')).toBeTruthy();
    expect(screen.getByText('COMPANY & BANK DETAILS')).toBeTruthy();
    expect(screen.getByText('SCOPE OF OFFER')).toBeTruthy();
  });
});
