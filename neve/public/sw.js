/* Névé service worker — offline app shell for the installable PWA.
 * Strategy:
 *  - Navigations: network-first, fall back to the cached app shell when offline.
 *  - Hashed static assets (/_expo/, /assets/): cache-first (they are immutable).
 *  - Everything else same-origin: stale-while-revalidate.
 * Bump CACHE_VERSION on each deploy so old shells are evicted.
 */
var CACHE_VERSION = 'neve-v1';
var SHELL_CACHE = CACHE_VERSION + '-shell';
var RUNTIME_CACHE = CACHE_VERSION + '-runtime';

var SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      // Cache each shell asset individually so one failure can't abort the
      // whole set (cache.addAll is atomic — a single 404 discards everything).
      var shell = Promise.all(
        SHELL_ASSETS.map(function (asset) {
          return cache.add(asset).catch(function () {});
        })
      );
      // The entry JS bundle has a content hash in its name and the service
      // worker is not yet controlling the page on first load, so runtime
      // caching never sees it. Discover it from index.html and precache it,
      // otherwise an offline reload has HTML but no app code.
      var bundle = fetch('/index.html', { cache: 'no-cache' })
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var matches = html.match(/\/_expo\/static\/[^"']+\.js/g) || [];
          return Promise.all(
            matches.map(function (url) {
              return cache.add(url).catch(function () {});
            })
          );
        })
        .catch(function () {});
      return Promise.all([shell, bundle]);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key.indexOf(CACHE_VERSION) !== 0) {
            return caches.delete(key);
          }
          return null;
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isImmutableAsset(url) {
  return url.pathname.indexOf('/_expo/') === 0 || url.pathname.indexOf('/assets/') === 0;
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return; // Let cross-origin requests hit the network directly.
  }

  // App navigations → network-first, fall back to cached shell for offline use.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(SHELL_CACHE).then(function (cache) {
            cache.put('/index.html', copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match('/index.html').then(function (cached) {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Immutable hashed assets → cache-first.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) {
          return cached;
        }
        return fetch(request).then(function (response) {
          var copy = response.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        });
      })
    );
    return;
  }

  // Other same-origin GETs → stale-while-revalidate.
  event.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return cached;
        });
      return cached || network;
    })
  );
});
