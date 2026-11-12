import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OfferFormPanel } from './OfferFormPanel';
import { DEFAULT_PRICING_CONFIG } from '@/lib/constants';
import { calculateOffer } from '@/lib/pricingEngine';
import { createInitialFormState } from '@/store/useOfferStore';

describe('OfferFormPanel', () => {
  it('renders Bulgarian and English form fields and triggers updates', () => {
    const form = createInitialFormState('bg');
    const calc = calculateOffer(form, DEFAULT_PRICING_CONFIG);
    const onUpdateForm = vi.fn();

    render(
      <OfferFormPanel
        form={form}
        pricingConfig={DEFAULT_PRICING_CONFIG}
        calc={calc}
        onUpdateForm={onUpdateForm}
        onSelectCatalogModel={vi.fn()}
        onOpenPricingModal={vi.fn()}
      />
    );

    const clientInput = screen.getByLabelText('Име и фамилия на клиента');
    expect(clientInput).toBeDefined();

    fireEvent.change(clientInput, { target: { value: 'Георги Димитров' } });
    expect(onUpdateForm).toHaveBeenCalledWith({ clientName: 'Георги Димитров' });
  });
});
