import { z } from 'zod';

export const FirebaseWebConfigSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  appId: z.string().min(1),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
});

export type FirebaseWebConfig = z.infer<typeof FirebaseWebConfigSchema>;

export const FIREBASE_CONFIG_STORAGE_KEY = 'flexi_home_firebase_config_v1';

export function getEnvFirebaseConfig(): FirebaseWebConfig | null {
  const raw = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || undefined,
  };
  const res = FirebaseWebConfigSchema.safeParse(raw);
  return res.success ? res.data : null;
}

export function getSavedFirebaseConfig(): FirebaseWebConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const res = FirebaseWebConfigSchema.safeParse(parsed);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseWebConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      FIREBASE_CONFIG_STORAGE_KEY,
      JSON.stringify(config)
    );
  } catch {
    // ignore storage quota or private mode failures
  }
}

export function clearSavedFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getActiveFirebaseConfig(): FirebaseWebConfig | null {
  return getEnvFirebaseConfig() || getSavedFirebaseConfig();
}

const KNOWN_KEYS: Array<keyof FirebaseWebConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

/**
 * Parses either raw JSON or a Firebase Console JS snippet such as:
 * `const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };`
 */
export function parseFirebaseConfigInput(
  rawText: string
): FirebaseWebConfig | null {
  const trimmed = (rawText || '').trim();
  if (!trimmed) return null;

  try {
    const parsedJson = JSON.parse(trimmed);
    const res = FirebaseWebConfigSchema.safeParse(parsedJson);
    if (res.success) return res.data;
  } catch {
    // fallback to JS object literal extraction
  }

  const extracted: Record<string, string> = {};
  for (const key of KNOWN_KEYS) {
    const re = new RegExp(
      `["']?${key}["']?\\s*:\\s*["']([^"']+)["']`,
      'm'
    );
    const m = re.exec(trimmed);
    if (m && m[1]) {
      extracted[key] = m[1].trim();
    }
  }

  const res = FirebaseWebConfigSchema.safeParse(extracted);
  return res.success ? res.data : null;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const padded =
    b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Generates a one-click cloud connection URL (`?cloud=...`) for other team phones/devices.
 */
export function buildCloudSetupUrl(
  config: FirebaseWebConfig,
  baseUrl?: string
): string {
  const token = toBase64Url(JSON.stringify(config));
  const origin =
    baseUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://suleyman-ismail.github.io/flexi-oferta/');
  const sep = origin.includes('?') ? '&' : '?';
  return `${origin}${sep}cloud=${token}`;
}

export function parseCloudConfigFromUrl(
  search: string,
  hash = ''
): FirebaseWebConfig | null {
  try {
    const searchParams = new URLSearchParams(
      search.startsWith('?') ? search : `?${search}`
    );
    let token = searchParams.get('cloud');
    if (!token && hash) {
      const cleanHash = hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(
        cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash
      );
      token = hashParams.get('cloud');
    }
    if (!token) return null;

    const json = fromBase64Url(token.trim());
    const parsed = JSON.parse(json);
    const res = FirebaseWebConfigSchema.safeParse(parsed);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}
