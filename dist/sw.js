const STATIC_CACHE = 'urban-harvest-static-v1';
const RUNTIME_CACHE = 'urban-harvest-runtime-v1';
const API_CACHE = 'urban-harvest-api-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/', '/offline.html', '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg']),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/') || caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'Urban Harvest Hub',
    body: 'Fresh sustainable updates are ready to explore.',
    url: '/explore',
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      data: {
        url: payload.url || '/explore',
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  const targetUrl = event.notification.data?.url || '/';
  event.notification.close();
  event.waitUntil(clients.openWindow(targetUrl));
});

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return new Response(JSON.stringify({ message: 'Offline data unavailable.' }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 503,
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}
