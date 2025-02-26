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
  '/assets/js/pwa-install-notification',
  '/assets/js/random-verse.js',
  // '/assets/js/service-worker.js',
  '/assets/js/util.js',
  // Videos
  '/assets/videos/bg1.webm',
  // Images
  '/assets/images/404.webp',
  '/assets/images/bg.webp',
  '/assets/images/banners/about.webp',
  '/assets/images/banners/ayah.webp',
  '/assets/images/banners/mood.webp',
  '/assets/images/banners/surah.webp',
];

/**
 * Install Event - Caches predefined assets.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => console.log('Service Worker: Assets cached successfully.'))
      .catch((error) => console.error('Service Worker: Asset caching failed', error))
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

  // Ignore external requests
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch((error) => {
            console.warn('Service Worker: Network request failed, serving cached response if available.', error);
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
