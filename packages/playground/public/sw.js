/// <reference lib="webworker" />

const CACHE_VERSION = 'jspaint-v22'

// Derive the `programs/` prefix from the worker's registration scope so the
// service worker cache rule works whether the app is served at `/` or under
// a subpath like `/murasaki/` (GitHub Pages).
const PROGRAMS_PREFIX = new URL('programs/', self.registration.scope).pathname

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only cache resources under `<base>/programs/`
  if (!url.pathname.startsWith(PROGRAMS_PREFIX)) {
    return
  }

  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) {
          return cached
        }
        return fetch(event.request).then((response) => {
          // Only cache successful responses
          if (response.ok) {
            cache.put(event.request, response.clone())
          }
          return response
        })
      }),
    ),
  )
})
