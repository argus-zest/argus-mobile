/* Argus Mobile service worker.
 * App-shell offline support. API responses are NEVER cached: only GET
 * requests to the same origin or the curated static hosts below are stored.
 * When offline, navigations fall back to the cached app shell, which boots
 * into explicitly labelled mock mode (MOCK DATA badge) — mock data is never
 * presented as live information.
 */
const SHELL_CACHE = 'argus-shell-v1';
const RUNTIME_CACHE = 'argus-runtime-v1';
const MAX_RUNTIME_ENTRIES = 120;

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/argus-logo.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
];

const STATIC_HOSTS = new Set([
  self.location.hostname,
  'unpkg.com',
  'a.tile.openstreetmap.org',
  'b.tile.openstreetmap.org',
  'c.tile.openstreetmap.org',
  'demotiles.maplibre.org',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function prune(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_RUNTIME_ENTRIES) {
    await cache.delete(keys[0]);
    return prune(cache);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  // Never cache API traffic or unknown hosts: let it pass through.
  if (!STATIC_HOSTS.has(url.hostname)) return;

  // Navigations: network first, fall back to the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, copy).then(() => prune(cache));
            });
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
