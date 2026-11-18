import { describe, it, expect } from 'vitest';
import {
  buildProfileInviteUrl,
  parseProfileInviteFromUrl,
} from './profileInvite';
import { UserProfile } from '@/types/offer';

describe('profileInvite', () => {
  it('encodes and decodes a Cyrillic user profile invite URL', () => {
    const user: UserProfile = {
      id: 'user-99',
      name: 'Иван Георгиев',
      pin: '654321',
      role: 'agent',
      phone: '+359888111222',
      active: true,
      createdAt: '2026-11-18T12:00:00.000Z',
    };
    const url = buildProfileInviteUrl(
      user,
      'https://suleyman-ismail.github.io/flexi-oferta/'
    );
    const parsedUrl = new URL(url);
    const decoded = parseProfileInviteFromUrl(parsedUrl.search, parsedUrl.hash);
    expect(decoded).not.toBeNull();
    expect(decoded?.name).toBe('Иван Георгиев');
    expect(decoded?.pin).toBe('654321');
    expect(decoded?.role).toBe('agent');
    expect(decoded?.active).toBe(true);
  });

  it('returns null for invalid or missing invite tokens', () => {
    expect(parseProfileInviteFromUrl('')).toBeNull();
    expect(parseProfileInviteFromUrl('?invite=invalid-base64')).toBeNull();
  });
});
