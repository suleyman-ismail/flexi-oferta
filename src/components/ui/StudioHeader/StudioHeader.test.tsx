import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudioHeader } from './StudioHeader';

describe('StudioHeader', () => {
  it('renders BG/EN language switcher and action buttons', () => {
    const onDownloadPdf = vi.fn();
    const onSetLang = vi.fn();

    render(
      <StudioHeader
        lang="bg"
        offerNo="26-0101"
        savedCount={3}
        isGeneratingPdf={false}
        darkMode={false}
        onSetLang={onSetLang}
        onToggleDarkMode={vi.fn()}
        onNewOffer={vi.fn()}
        onSaveOffer={vi.fn()}
        onDownloadPdf={onDownloadPdf}
        onOpenSavedDrawer={vi.fn()}
        onOpenPricingModal={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Switch to English language'));
    expect(onSetLang).toHaveBeenCalledWith('en');

    fireEvent.click(screen.getByLabelText('Изтегли PDF (4 стр.)'));
    expect(onDownloadPdf).toHaveBeenCalled();
  });
});
