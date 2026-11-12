import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminDashboardModal } from './AdminDashboardModal';
import { DEFAULT_USERS, createInitialFormState } from '@/store/useOfferStore';

describe('AdminDashboardModal', () => {
  it('displays all team offers and allows switching to profiles tab', () => {
    render(
      <AdminDashboardModal
        lang="bg"
        isOpen={true}
        users={DEFAULT_USERS}
        savedOffers={[
          {
            id: 'of-1',
            createdAt: '2026-04-12T10:00:00.000Z',
            updatedAt: '2026-04-12T10:00:00.000Z',
            createdByUserId: 'agent-hasan',
            createdByName: 'Хасан (Агент)',
            createdByRole: 'agent',
            isCustomPrice: true,
            form: {
              ...createInitialFormState('bg'),
              offerNo: '26-0105',
              clientName: 'Димитър Николов',
            },
            summary: {
              structureTotal: 32000,
              turnkeyTotal: 0,
              foundationTotal: 11900,
              grandTotal: 43900,
            },
          },
        ]}
        currentOfferNo="26-0105"
        onClose={vi.fn()}
        onAddOrUpdateUser={vi.fn().mockReturnValue({ ok: true })}
        onDeleteUser={vi.fn()}
        onToggleUserActive={vi.fn()}
        onLoadOffer={vi.fn()}
        onDeleteOffer={vi.fn()}
        onSyncCurrentOfferNo={vi.fn()}
        onExportJson={() => '{}'}
        onImportJson={() => ({ ok: true, message: 'OK' })}
      />
    );

    expect(screen.getByText('Димитър Николов')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Tab Team Profiles'));
    expect(screen.getByText(/PIN: 123456/i)).toBeTruthy();
  });
});
