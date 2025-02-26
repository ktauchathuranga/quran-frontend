const CACHE_NAME = 'website-cache-v2';
const ASSETS_TO_CACHE = [
  '/', '/index.html', '/manifest.json', '/robots.txt', '/sitemap.xml', '/version.json',
  // CSS Files
  '/assets/css/fontawesome-all.min.css',
  '/assets/css/main.css',
  '/assets/css/noscript.css',
  '/images/loading/loading.css',
  // JavaScript Files
  '/assets/js/api.js',
  '/assets/js/breakpoints.min.js',
  '/assets/js/browser.min.js',
  '/assets/js/jquery.min.js',
  '/assets/js/main.js',
  '/assets/js/mood.js',
  '/assets/js/pwa-install-notification.js',
  '/assets/js/random-verse.js',
  '/assets/js/service-worker.js',
  '/assets/js/util.js',
  // Videos
  '/assets/videos/bg1.webm',
  // Images
  '/images/404.webp',
  '/images/bg.webp',
  '/images/banners/about.webp',
  '/images/banners/ayah.webp',
  '/images/banners/mood.webp',
  '/images/banners/surah.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        for (const asset of ASSETS_TO_CACHE) {
          try {
            await cache.add(asset);
          } catch (error) {
            console.error(`Failed to cache ${asset}:`, error);
          }
        }
      })
      .then(() => console.log('Service Worker: Assets cached (with possible errors).'))
  );
  self.skipWaiting();
});

/**
 * Activate Event - Cleans up old caches.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log(`Service Worker: Deleting old cache: ${cache}`);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch Event - Implements Stale-While-Revalidate caching strategy.
 */
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Ignore external requests (requests not from the same origin)
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Attempt to fetch the request from the network (revalidate)
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // If network request is successful, update the cache with the new response
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((error) => {
            console.warn('Service Worker: Network request failed, serving cached response if available.', error);
            // Serve the cached response if the network request fails
            return cachedResponse;
          });

        // If cachedResponse exists, return it immediately (stale)
        // If not, return the fetchPromise to fetch from the network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
