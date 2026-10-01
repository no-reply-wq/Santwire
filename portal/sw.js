// Sant Wires — Minimal Service Worker
// Purpose: PWA install eligibility only.
// Does NOT cache any app content, auth data, or Google Apps Script responses.

const CACHE_NAME = 'santwires-shell-v2';

const SHELL_FILES = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  if (
    url.indexOf('script.google.com') !== -1 ||
    url.indexOf('googleusercontent.com') !== -1 ||
    url.indexOf('googleapis.com') !== -1 ||
    url.indexOf('accounts.google.com') !== -1
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});