const CACHE_NAME = 'website-cache-v1';
const ASSETS_TO_CACHE = [
  '/', '/index.html', '/manifest.json', '/robot.txt', '/sitemap.xml', '/version.json',
  // CSS
  '/assets/css/fontawesome-all.min.css',
  '/assets/css/main.css',
  '/assets/css/noscript.css',
  '/images/loading/loading.css',
  // JS
  '/assets/js/api.js',
  '/assets/js/breakpoints.min.js',
  '/assets/js/browser.min.js',
  '/assets/js/jquery.min.js',
  '/assets/js/main.js',
  '/assets/js/mood.js',
  '/assets/js/pwa-install-notfication.js',
  '/assets/js/random-verse.js',
  '/assets/js/service-worker.js',
  '/assets/js/util.js',
  // Videos
  '/assets/videos/bg1.mp4',
];

// Install Event - Cache all predefined assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => console.log('Assets cached successfully!'))
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Ignore external requests
  if (!requestUrl.origin.includes(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with the latest response
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => cachedResponse); // Fallback to cache if network fails

        return cachedResponse || fetchPromise; // Serve cache first, update in background
      });
    })
  );
});
