const CACHE_NAME = 'santwires-shell-v2';
const SHELL_FILES = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// URLs we must NEVER intercept — GAS / Google auth
const PASSTHROUGH = [
  'script.google.com',
  'googleusercontent.com',
  'googleapis.com',
  'accounts.google.com'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Always pass Google/GAS requests straight through — no caching
  for (var i = 0; i < PASSTHROUGH.length; i++) {
    if (url.indexOf(PASSTHROUGH[i]) !== -1) {
      return; // browser handles normally
    }
  }

  // For shell files: cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
