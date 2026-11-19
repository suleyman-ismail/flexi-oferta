import { describe, it, expect } from 'vitest';
import {
  buildCloudSetupUrl,
  parseCloudConfigFromUrl,
  parseFirebaseConfigInput,
} from './firebaseConfig';

describe('firebaseConfig helper', () => {
  it('parses valid JSON Firebase config', () => {
    const parsed = parseFirebaseConfigInput(
      JSON.stringify({
        apiKey: 'AIzaTestKey123',
        authDomain: 'flexi-home.firebaseapp.com',
        projectId: 'flexi-home-sync',
        storageBucket: 'flexi-home-sync.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef',
      })
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.projectId).toBe('flexi-home-sync');
    expect(parsed?.apiKey).toBe('AIzaTestKey123');
  });

  it('parses Firebase Console JS const snippet', () => {
    const snippet = `
      // Import the functions you need from the SDKs you need
      const firebaseConfig = {
        apiKey: "AIzaSnippetKey999",
        authDomain: "flexi-demo.firebaseapp.com",
        projectId: "flexi-demo",
        storageBucket: "flexi-demo.firebasestorage.app",
        messagingSenderId: '987654321',
        appId: "1:987654321:web:xyz123"
      };
    `;
    const parsed = parseFirebaseConfigInput(snippet);
    expect(parsed).not.toBeNull();
    expect(parsed?.projectId).toBe('flexi-demo');
    expect(parsed?.messagingSenderId).toBe('987654321');
    expect(parsed?.appId).toBe('1:987654321:web:xyz123');
  });

  it('rejects incomplete Firebase config', () => {
    expect(
      parseFirebaseConfigInput('{ "apiKey": "only-key", "projectId": "" }')
    ).toBeNull();
    expect(parseFirebaseConfigInput('')).toBeNull();
  });

  it('round-trips buildCloudSetupUrl and parseCloudConfigFromUrl', () => {
    const cfg = {
      apiKey: 'AIzaUrlKey',
      authDomain: 'flexi-url.firebaseapp.com',
      projectId: 'flexi-url',
      appId: '1:111:web:222',
    };
    const url = buildCloudSetupUrl(
      cfg,
      'https://suleyman-ismail.github.io/flexi-oferta/'
    );
    const u = new URL(url);
    const decoded = parseCloudConfigFromUrl(u.search, u.hash);
    expect(decoded).toEqual(cfg);
  });
});
