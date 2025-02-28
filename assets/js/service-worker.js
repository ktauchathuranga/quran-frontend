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

// Install event - Cache assets
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

// Activate event - Clean old caches
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

// Fetch event - Stale-While-Revalidate caching strategy
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Ignore external requests
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // Return cache if network fails

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// ✅ Push Notification Event
self.addEventListener('push', (event) => {
  console.log('Push Notification received:', event);

  let notificationData = {};

  if (event.data) {
    try {
      notificationData = event.data.json();
      console.log("Notification Data:", notificationData);  // Log to see structure of the data
    } catch (error) {
      console.error('Error parsing push event data:', error);
    }
  }

  // Extract URL from the click_action field (similar to the tutorial)
  const url = notificationData.notification?.click_action || '/';  // Default fallback if URL is not found
  console.log("Extracted URL:", url); // Log to confirm the URL extraction

  const title = notificationData.notification?.title || "New Notification";
  const options = {
    body: notificationData.notification?.body || "You have a new message.",
    icon: notificationData.notification?.icon || "/images/pwa/icons/android/android-launchericon-512-512.png",
    badge: notificationData.notification?.badge || "/images/pwa/icons/android/android-launchericon-512-512.png",
    vibrate: [200, 100, 200],
    data: { url: url }  // Store the URL in the notification's data field
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ✅ Handle Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';
  
  // Log the URL that will be opened to the console
  console.log("Opening URL:", urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
