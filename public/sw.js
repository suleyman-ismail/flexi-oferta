// Flexi Home ОФЕРТА Studio v1.0.1 – Auto-Updating Offline-First Service Worker
const CACHE = 'flexi-oferta-v101';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-180.png?v=2',
  'icon-192.png?v=2',
  'icon-512.png?v=2',
  'icon-maskable-512.png?v=2',
  'flexi-home-logo.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) =>
        Promise.allSettled(
          SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(
          ks
            .filter((k) => k !== CACHE && k.indexOf('flexi-oferta-') === 0)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;

  // Network-first for HTML navigation, manifest, and app icons so updates appear immediately
  if (
    e.request.mode === 'navigate' ||
    u.pathname.endsWith('.html') ||
    u.pathname.endsWith('/') ||
    u.pathname.endsWith('manifest.webmanifest') ||
    u.pathname.includes('/icon-')
  ) {
    e.respondWith(
      fetch(new Request(e.request, { cache: 'no-cache' }))
        .then((r) => {
          if (r && r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() =>
          caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true }))
        )
    );
    return;
  }

  // Stale-while-revalidate for JS/CSS/images/fonts
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request)
          .then((r) => {
            if (r && r.ok) c.put(e.request, r.clone());
            return r;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
