import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PwaInstallBanner } from './PwaInstallBanner';

describe('PwaInstallBanner', () => {
  it('renders PWA install prompt in Bulgarian and can be dismissed', () => {
    render(<PwaInstallBanner lang="bg" />);

    expect(
      screen.getByText(/Инсталирай Flexi Home ОФЕРТА като приложение/i)
    ).toBeTruthy();

    const closeBtn = screen.getByLabelText('Затвори банера за инсталация');
    fireEvent.click(closeBtn);
  });
});
