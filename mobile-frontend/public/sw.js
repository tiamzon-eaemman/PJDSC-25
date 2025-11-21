// Custom SW augmenting next-pwa generated logic (registered alongside).
// Precache core shell + hazard geojson for offline risk assessment.
const STATIC_CACHE = 'sagip-static-v2';
const API_CACHE = 'sagip-api-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try { await cache.addAll(STATIC_ASSETS); } catch (e) { /* ignore partial failures */ }
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => ![STATIC_CACHE, API_CACHE].includes(k)).map(k => caches.delete(k))
      );
      self.clients.claim();
    })()
  );
});

// Network-first for API updates; fallback to cache.
async function apiFetch(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache API requests
  if (url.pathname.includes('/evac_centers') || url.pathname.includes('/plan')) {
    event.respondWith(apiFetch(request));
    return;
  }
});
  const url = new URL(request.url);
  // Only intercept same-origin.
  if (url.origin === self.location.origin) {
    if (/\/processed_data\/.*\.geojson$/.test(url.pathname)) {
      event.respondWith(hazardFetch(request));
      return;
    }
    if (request.method === 'GET') {
      event.respondWith(
        (async () => {
          const cache = await caches.open(STATIC_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          try {
            const res = await fetch(request);
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          } catch (e) {
            return cached || Response.error();
          }
        })()
      );
    }
  }

// Web Push handling.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'SAGIP Update', body: 'New advisory received.' }; }
  const title = data.title || 'SAGIP Alert';
  const options = {
    body: data.body || 'Open the app for details.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: { url: data.url || '/', ts: Date.now() }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })()
  );
});
