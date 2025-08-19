const CACHE_NAME = 'self-music-cache-v1';
const MAX_AGE = 2 * 24 * 60 * 60 * 1000; // 2 days in ms

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await clients.claim();
      await cleanupCache();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
        await updateTimestamp(event.request, cache);
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return Response.error();
      })
  );
});

async function updateTimestamp(request, cache) {
  await cache.put(
    new Request(request.url + '__meta'),
    new Response(Date.now().toString())
  );
}

async function cleanupCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  const now = Date.now();

  await Promise.all(
    requests.map(async (request) => {
      if (request.url.endsWith('__meta')) {
        return;
      }
      const meta = await cache.match(request.url + '__meta');
      if (!meta) {
        return;
      }
      const fetched = parseInt(await meta.text(), 10);
      if (now - fetched > MAX_AGE) {
        await cache.delete(request);
        await cache.delete(request.url + '__meta');
      }
    })
  );
}
