const CACHE_NAME = 'agrimetrics-v1.2';
const urlsToCache = [
  '/AgriMetrics/',
  '/AgriMetrics/index.html',
  '/AgriMetrics/css/styles.css',
  '/AgriMetrics/js/app.js',
  '/AgriMetrics/js/framework.js',
  '/AgriMetrics/js/core.js',
  '/AgriMetrics/js/auth.js',
  '/AgriMetrics/js/dashboard.js',
  '/AgriMetrics/js/profile.js',
  '/AgriMetrics/js/feed-record.js',
  '/AgriMetrics/js/income-expenses.js',
  '/AgriMetrics/js/inventory-check.js',
  '/AgriMetrics/js/broiler-mortality.js',
  '/AgriMetrics/js/orders.js',
  '/AgriMetrics/js/sales-record.js',
  '/AgriMetrics/js/production.js',
  // Only include ONE of these - remove the duplicate:
  // '/AgriMetrics/js/reports.js', // REMOVE THIS if you have production.js
  '/AgriMetrics/firebase/firebase-config.js',
  '/AgriMetrics/firebase/firebase-auth.js',
  '/AgriMetrics/firebase/firebase-firestore.js',
  '/AgriMetrics/modules/core.js',
  '/AgriMetrics/modules/auth.js',
  '/AgriMetrics/modules/dashboard.js',
  '/AgriMetrics/modules/profile.js',
  '/AgriMetrics/modules/feed-records.js',
  '/AgriMetrics/manifest.json',
  '/AgriMetrics/icons/icon-192x192.png',
  '/AgriMetrics/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Cache addAll error:', error);
        });
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
          console.log('Fetch failed; returning offline page instead.', error);
          // You could return a custom offline page here
        });
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Check if user is authenticated and sync pending data
  if (window.authManager && window.authManager.auth.currentUser) {
    const userId = window.authManager.auth.currentUser.uid;
    // Sync pending data with Firestore
    if (window.AutoSyncManager) {
      await window.AutoSyncManager.processPendingSyncs();
    }
  }
}
