const CACHE_NAME = 'flag-explorer-v1';
const urlsToCache = ['/', '/app.js', '/style.css', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) return response;
      return fetch(e.request).then(r => {
        // Cache flag images
        if (e.request.url.includes('flagcdn.com') || e.request.url.includes('wikimedia.org')) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return r;
      });
    })
  );
});
