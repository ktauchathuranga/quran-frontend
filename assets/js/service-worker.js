self.addEventListener('install', (event) => {
    console.log('Service worker installed!');
    // Skip waiting to activate the new service worker immediately
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service worker activated!');
  });
  
  self.addEventListener('fetch', (event) => {
    // Optional: Add logging or monitoring without caching or offline handling
    console.log('Fetching:', event.request.url);
  });
  