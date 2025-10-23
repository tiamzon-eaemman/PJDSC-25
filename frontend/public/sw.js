// Mobile-First PWA Service Worker for SAGIP
const CACHE_NAME = 'sagip-mobile-v1';
const STATIC_CACHE = 'sagip-static-v1';
const DYNAMIC_CACHE = 'sagip-dynamic-v1';

// Essential files for offline functionality
const ESSENTIAL_FILES = [
  '/',
  '/gis',
  '/install',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('SAGIP Mobile SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SAGIP Mobile SW: Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('SAGIP Mobile SW: Essential files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SAGIP Mobile SW: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SAGIP Mobile SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('SAGIP Mobile SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SAGIP Mobile SW: Activated and controlling clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - mobile-optimized caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    // Static assets - Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname.startsWith('/_next/')) {
    // Next.js assets - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // HTML pages - Network First
    event.respondWith(networkFirstStrategy(request));
  }
});

// Network First Strategy (for API and HTML)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SAGIP Mobile SW: Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }

    throw error;
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SAGIP Mobile SW: Failed to fetch asset:', request.url);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy (for Next.js assets)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(STATIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Background Sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SAGIP Mobile SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline data synchronization
  console.log('SAGIP Mobile SW: Performing background sync');
}

// Push notifications for emergency alerts
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/emergency')
    );
  }
});

console.log('SAGIP Mobile SW: Service Worker loaded');
