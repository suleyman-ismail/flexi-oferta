import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingSettingsModal } from './PricingSettingsModal';
import { DEFAULT_PRICING_CONFIG } from '@/lib/constants';

describe('PricingSettingsModal', () => {
  it('renders pricing fields and saves updated config in Bulgarian', () => {
    const onSavePricing = vi.fn();
    const onClose = vi.fn();

    render(
      <PricingSettingsModal
        lang="bg"
        isOpen={true}
        pricing={DEFAULT_PRICING_CONFIG}
        onClose={onClose}
        onSavePricing={onSavePricing}
        onResetDefaults={vi.fn()}
      />
    );

    const foundationInput = screen.getByLabelText('Foundation Default Unit Price');
    fireEvent.change(foundationInput, { target: { value: '155' } });

    const saveBtn = screen.getByLabelText('Запази тарифите');
    fireEvent.click(saveBtn);

    expect(onSavePricing).toHaveBeenCalledWith(
      expect.objectContaining({ foundationRate: 155 })
    );
  });
});
