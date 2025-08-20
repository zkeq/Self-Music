/**
 * Self-Music Service Worker
 * High-availability caching system for music streaming platform
 * 
 * Cache Strategies:
 * - Static files: 6 hours with stale-while-revalidate
 * - Audio files: 2 months with cache-first
 * - Cover images: 2 months with cache-first  
 * - API requests: Network-first with short cache (5 minutes)
 * - App shell: Cache-first with update notification
 */

const CACHE_VERSION = '1.0.0';
const CACHE_PREFIX = 'self-music';

// Cache names
const CACHES = {
  static: `${CACHE_PREFIX}-static-v${CACHE_VERSION}`,
  audio: `${CACHE_PREFIX}-audio-v${CACHE_VERSION}`,
  images: `${CACHE_PREFIX}-images-v${CACHE_VERSION}`,
  api: `${CACHE_PREFIX}-api-v${CACHE_VERSION}`,
  offline: `${CACHE_PREFIX}-offline-v${CACHE_VERSION}`
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  static: 6 * 60 * 60 * 1000,        // 6 hours
  audio: 60 * 24 * 60 * 60 * 1000,   // 2 months  
  images: 60 * 24 * 60 * 60 * 1000,  // 2 months
  api: 5 * 60 * 1000                 // 5 minutes
};

// Essential files to cache for offline functionality
const ESSENTIAL_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon.png'
];

// Utility functions
function isAudioRequest(url) {
  // Check by file extension for audio files (including query parameters)
  return url.match(/\.(mp3|m4a|wav|ogg|webm|flac|aac)(\?.*)?$/i) || 
         (url.includes('/api/songs/') && url.includes('/stream'));
}

function isCoverRequest(url) {
  // Include the full URL with query parameters for image caching
  return url.includes('/api/') && (url.includes('cover') || url.includes('image')) ||
         url.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)(\?.*)?$/i);
}

function isApiRequest(url) {
  return url.includes('/api/') && !isAudioRequest(url) && !isCoverRequest(url);
}

function isStaticAsset(url) {
  return url.match(/\.(js|css|html|ico|svg)$/i) || url.includes('/_next/');
}

function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

function isExpired(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  
  const age = Date.now() - parseInt(cachedAt);
  return age > maxAge;
}

// Cache strategies
async function cacheFirst(request, cacheName, maxAge = null) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && (!maxAge || !isExpired(cachedResponse, maxAge))) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      console.log('Network failed, serving stale cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

async function networkFirst(request, cacheName, maxAge = null) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse && (!maxAge || !isExpired(cachedResponse, maxAge))) {
      console.log('Network failed, serving cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName, maxAge = null) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Return cached version if available and not too old
  if (cachedResponse && (!maxAge || !isExpired(cachedResponse, maxAge))) {
    // Attempt to revalidate in background (don't await)
    fetch(request).then(response => {
      if (response.ok) {
        const responseToCache = addTimestamp(response.clone());
        cache.put(request, responseToCache);
      }
    }).catch(error => {
      console.log('Background revalidation failed:', request.url, error);
    });
    
    return cachedResponse;
  }
  
  // No valid cache, try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    // Network failed, check for stale cache
    if (cachedResponse) {
      console.log('Network failed, serving stale cache:', request.url);
      return cachedResponse;
    }
    
    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      const offlineCache = await caches.open(CACHES.offline);
      const offlinePage = await offlineCache.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
      // If offline page not cached, return a basic offline response
      return new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // For other requests, throw to be handled by outer try-catch
    throw error;
  }
}

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache essential files
      caches.open(CACHES.offline).then(cache => {
        return cache.addAll(ESSENTIAL_CACHE_URLS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith(CACHE_PREFIX) && 
                !Object.values(CACHES).includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Audio files - cache first with long duration
        if (isAudioRequest(url.href)) {
          return await cacheFirst(request, CACHES.audio, CACHE_DURATIONS.audio);
        }
        
        // Cover images - cache first with long duration
        if (isCoverRequest(url.href)) {
          return await cacheFirst(request, CACHES.images, CACHE_DURATIONS.images);
        }
        
        // API requests - network first with short cache
        if (isApiRequest(url.href)) {
          return await networkFirst(request, CACHES.api, CACHE_DURATIONS.api);
        }
        
        // Static assets - stale while revalidate
        if (isStaticAsset(url.href) || url.pathname.startsWith('/_next/')) {
          return await staleWhileRevalidate(request, CACHES.static, CACHE_DURATIONS.static);
        }
        
        // Navigation requests - stale while revalidate with offline fallback
        if (request.mode === 'navigate') {
          return await staleWhileRevalidate(request, CACHES.static, CACHE_DURATIONS.static);
        }
        
        // Default - try network first
        return await fetch(request);
        
      } catch (error) {
        console.error('Service Worker fetch error:', error, request.url);
        
        // For navigation requests, return offline page
        if (request.mode === 'navigate') {
          const offlineCache = await caches.open(CACHES.offline);
          const offlinePage = await offlineCache.match('/offline');
          if (offlinePage) {
            return offlinePage;
          }
        }
        
        // For other requests, return a generic error response
        return new Response('Service Unavailable', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      }
    })()
  );
});

// Message event - handle cache management commands
self.addEventListener('message', event => {
  const { data } = event;
  
  if (data.type === 'CACHE_AUDIO') {
    // Preemptively cache audio file
    caches.open(CACHES.audio).then(cache => {
      cache.add(data.url);
    });
  }
  
  if (data.type === 'CACHE_IMAGE') {
    // Preemptively cache image
    caches.open(CACHES.images).then(cache => {
      cache.add(data.url);
    });
  }
  
  if (data.type === 'CLEAR_CACHE') {
    // Clear specific cache
    if (data.cacheName && CACHES[data.cacheName]) {
      caches.delete(CACHES[data.cacheName]);
    }
  }
  
  if (data.type === 'CLEAR_ALL_CACHES') {
    // Clear all caches
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.startsWith(CACHE_PREFIX)) {
          caches.delete(cacheName);
        }
      });
    });
  }
  
  if (data.type === 'GET_CACHE_STATUS') {
    // Return cache status
    Promise.all([
      caches.open(CACHES.static).then(cache => cache.keys()),
      caches.open(CACHES.audio).then(cache => cache.keys()),
      caches.open(CACHES.images).then(cache => cache.keys()),
      caches.open(CACHES.api).then(cache => cache.keys())
    ]).then(([staticKeys, audioKeys, imageKeys, apiKeys]) => {
      event.ports[0].postMessage({
        type: 'CACHE_STATUS',
        static: staticKeys.length,
        audio: audioKeys.length,
        images: imageKeys.length,
        api: apiKeys.length
      });
    });
  }
});

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});

console.log('Self-Music Service Worker loaded');