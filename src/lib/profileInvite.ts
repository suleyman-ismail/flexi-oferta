import { z } from 'zod';
import { UserProfile } from '@/types/offer';

const InvitedUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pin: z.string().regex(/^\d{6}$/),
  role: z.enum(['admin', 'agent']),
  phone: z.string().optional().default(''),
  active: z.boolean().optional().default(true),
  createdAt: z.string().optional(),
});

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Builds a shareable access link that registers/updates this profile & PIN
 * on any colleague's phone or browser when opened.
 */
export function buildProfileInviteUrl(
  user: UserProfile,
  baseUrl?: string
): string {
  const payload = {
    id: user.id,
    name: user.name,
    pin: user.pin,
    role: user.role,
    phone: user.phone || '',
    active: user.active,
    createdAt: user.createdAt,
  };
  const token = toBase64Url(JSON.stringify(payload));
  const origin =
    baseUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://suleyman-ismail.github.io/flexi-oferta/');
  const sep = origin.includes('?') ? '&' : '?';
  return `${origin}${sep}invite=${token}`;
}

/**
 * Parses and validates an `?invite=...` token from URL search or hash.
 */
export function parseProfileInviteFromUrl(
  search: string,
  hash = ''
): UserProfile | null {
  try {
    const searchParams = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    let token = searchParams.get('invite');
    if (!token && hash) {
      const cleanHash = hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash);
      token = hashParams.get('invite');
    }
    if (!token) return null;

    const json = fromBase64Url(token.trim());
    const parsed = JSON.parse(json);
    const result = InvitedUserSchema.safeParse(parsed);
    if (!result.success) return null;

    return {
      id: result.data.id,
      name: result.data.name,
      pin: result.data.pin,
      role: result.data.role,
      phone: result.data.phone || '',
      active: result.data.active ?? true,
      createdAt: result.data.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
