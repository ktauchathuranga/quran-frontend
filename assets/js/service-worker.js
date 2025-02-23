const CACHE_NAME = 'website-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // Root
  '/index.html',
  '/manifest.json',
  '/robot.txt',
  '/sitemap.xml',
  '/version.json',
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

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching specified assets...');
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
            throw new Error(`Failed to fetch ${url}`);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('Service worker activated!');
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

// Fetch Event
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Check if the request is for the /assets or /images folder
  if (requestUrl.pathname.startsWith('/assets/') || requestUrl.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Handle other requests normally
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
