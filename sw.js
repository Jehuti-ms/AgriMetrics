// sw.js - Update with correct paths
const CACHE_NAME = 'agrimetrics-v1.5';
const urlsToCache = [
  '/AgriMetrics/',
  '/AgriMetrics/index.html',
  '/AgriMetrics/css/styles.css',
  
  // Firebase
  '/AgriMetrics/firebase/firebase-config.js',
  '/AgriMetrics/firebase/firebase-auth.js',
  '/AgriMetrics/firebase/firebase-firestore.js',
  
  // All modules from modules folder
  '/AgriMetrics/modules/framework.js',
  '/AgriMetrics/modules/core.js',
  '/AgriMetrics/modules/auth.js',
  '/AgriMetrics/modules/dashboard.js',
  '/AgriMetrics/modules/income-expenses.js',
  '/AgriMetrics/modules/inventory-check.js',
  '/AgriMetrics/modules/feed-record.js',
  '/AgriMetrics/modules/broiler-mortality.js',
  '/AgriMetrics/modules/orders.js',
  '/AgriMetrics/modules/sales-record.js',
  '/AgriMetrics/modules/reports.js',
  '/AgriMetrics/modules/profile.js',
  
  // app.js from root
  '/AgriMetrics/app.js',
  
  // Manifest
  '/AgriMetrics/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caching app shell');
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
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
