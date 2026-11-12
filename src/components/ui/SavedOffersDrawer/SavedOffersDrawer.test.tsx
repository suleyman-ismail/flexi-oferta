import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SavedOffersDrawer } from './SavedOffersDrawer';
import { createInitialFormState } from '@/store/useOfferStore';

describe('SavedOffersDrawer', () => {
  it('renders saved offers and triggers duplicate / load actions', () => {
    const onLoadOffer = vi.fn();

    render(
      <SavedOffersDrawer
        lang="bg"
        isOpen={true}
        savedOffers={[
          {
            id: 'offer-1',
            createdAt: '2026-04-12T10:00:00.000Z',
            updatedAt: '2026-04-12T10:00:00.000Z',
            form: {
              ...createInitialFormState('bg'),
              clientName: 'Георги Димитров',
            },
            summary: {
              structureTotal: 36000,
              turnkeyTotal: 0,
              foundationTotal: 14000,
              grandTotal: 50000,
            },
          },
        ]}
        onClose={vi.fn()}
        onLoadOffer={onLoadOffer}
        onDeleteOffer={vi.fn()}
        onExportJson={() => '{}'}
        onImportJson={() => ({ ok: true, message: 'OK' })}
      />
    );

    expect(screen.getByText('Георги Димитров')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Копирай (Ревизия) Георги Димитров'));
    expect(onLoadOffer).toHaveBeenCalledWith('offer-1', true);
  });
});
