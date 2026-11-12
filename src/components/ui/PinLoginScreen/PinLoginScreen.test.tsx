import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PinLoginScreen } from './PinLoginScreen';

describe('PinLoginScreen', () => {
  it('submits 6-digit PIN when 6 digits are clicked', () => {
    const onLoginWithPin = vi.fn().mockReturnValue({ ok: true });

    render(
      <PinLoginScreen
        lang="bg"
        onSetLang={vi.fn()}
        onLoginWithPin={onLoginWithPin}
      />
    );

    ['1', '2', '3', '4', '5', '6'].forEach((d) => {
      fireEvent.click(screen.getByLabelText(`Digit ${d}`));
    });

    expect(onLoginWithPin).toHaveBeenCalledWith('123456');
  });
});
