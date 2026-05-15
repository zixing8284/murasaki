/// <reference lib="webworker" />

/**
 * Murasaki playground service worker.
 *
 * Cache strategy:
 * - `<base>/playground-assets.json` — network-first; the manifest version
 *   pins the asset cache name.
 * - `<base>/icons/`, `<base>/img/`, `<base>/assets/` — cache-first into a
 *   versioned cache keyed by the manifest version. Old versions are
 *   pruned on activate.
 * - `<base>/programs/` — HTML network-first, everything else
 *   stale-while-revalidate. Lets docs/JSPaint/Webamp launch instantly on
 *   repeat visits without serving a stale shell.
 * - Page navigations are not intercepted; the browser stays network-first
 *   on the app shell.
 *
 * Message API:
 * - `{ type: 'MURASAKI_CACHE_WARM', groups: ['critical', 'warm'] }`
 *   asks the SW to background-prefetch listed manifest groups.
 * - The SW posts `{ type: 'MURASAKI_CACHE_PROGRESS', payload }` back to
 *   the requesting client for UI progress display.
 */

const CACHE_PREFIX = 'murasaki-playground-'
const FALLBACK_ASSET_CACHE_NAME = `${CACHE_PREFIX}assets-runtime`
const PROGRAMS_CACHE_NAME = `${CACHE_PREFIX}programs-runtime`
const MANIFEST_PATH = 'playground-assets.json'
const CACHE_WARM_MESSAGE = 'MURASAKI_CACHE_WARM'
const CACHE_PROGRESS_MESSAGE = 'MURASAKI_CACHE_PROGRESS'

const ASSETS_PREFIX = new URL('assets/', self.registration.scope).pathname
const ICONS_PREFIX = new URL('icons/', self.registration.scope).pathname
const IMAGES_PREFIX = new URL('img/', self.registration.scope).pathname
const PROGRAMS_PREFIX = new URL('programs/', self.registration.scope).pathname
const MANIFEST_URL = new URL(MANIFEST_PATH, self.registration.scope).toString()
let assetManifestPromise

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(precacheManifestGroups(['critical']))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    deleteOldPlaygroundCaches().then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.origin !== self.location.origin || event.request.method !== 'GET') {
    return
  }

  if (url.toString() === MANIFEST_URL) {
    event.respondWith(networkFirst(event.request, FALLBACK_ASSET_CACHE_NAME))
    return
  }

  if (event.request.mode === 'navigate') {
    return
  }

  if (url.pathname.startsWith(ICONS_PREFIX) || url.pathname.startsWith(IMAGES_PREFIX) || url.pathname.startsWith(ASSETS_PREFIX)) {
    event.respondWith(getAssetCacheName().then(cacheName => cacheFirst(event.request, cacheName)))
    return
  }

  if (url.pathname.startsWith(PROGRAMS_PREFIX)) {
    if (isHtmlRequest(event.request, url)) {
      event.respondWith(networkFirst(event.request, PROGRAMS_CACHE_NAME))
      return
    }
    event.respondWith(staleWhileRevalidate(event.request, PROGRAMS_CACHE_NAME, event))
  }
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== CACHE_WARM_MESSAGE) {
    return
  }
  const groups = Array.isArray(data.groups) ? data.groups : ['critical', 'warm']
  event.waitUntil(precacheManifestGroups(groups, event.source))
})

async function loadAssetManifest() {
  if (!assetManifestPromise) {
    assetManifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then(response => (response.ok ? response.json() : null))
      .catch(() => null)
  }
  return assetManifestPromise
}

async function getAssetCacheName() {
  const manifest = await loadAssetManifest()
  return manifest?.version
    ? `${CACHE_PREFIX}assets-${manifest.version}`
    : FALLBACK_ASSET_CACHE_NAME
}

async function deleteOldPlaygroundCaches() {
  const manifest = await loadAssetManifest()
  if (!manifest?.version) {
    return
  }
  const keep = new Set([
    `${CACHE_PREFIX}assets-${manifest.version}`,
    PROGRAMS_CACHE_NAME,
    FALLBACK_ASSET_CACHE_NAME,
  ])
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter(name => name.startsWith(CACHE_PREFIX) && !keep.has(name))
      .map(name => caches.delete(name)),
  )
}

async function precacheManifestGroups(groups, client) {
  const manifest = await loadAssetManifest()
  if (!manifest) {
    return
  }
  const paths = uniquePaths(groups.flatMap(group => manifest.groups?.[group] ?? []))
  if (paths.length === 0) {
    return
  }
  const cacheName = await getAssetCacheName()
  const cache = await caches.open(cacheName)
  let loaded = 0

  postCacheProgress(client, { loaded, total: paths.length, path: null })

  await Promise.allSettled(paths.map(async (path) => {
    const request = new Request(scopedUrl(path), { cache: 'reload' })
    const cached = await cache.match(request)
    if (!cached) {
      const response = await fetch(request)
      if (shouldCacheResponse(response)) {
        await cache.put(request, response.clone())
      }
    }
    loaded += 1
    postCacheProgress(client, { loaded, total: paths.length, path })
  }))
}

function scopedUrl(path) {
  return new URL(path.replace(/^\/+/, ''), self.registration.scope).toString()
}

function uniquePaths(paths) {
  return Array.from(new Set(paths.filter(Boolean)))
}

function postCacheProgress(client, payload) {
  client?.postMessage({ type: CACHE_PROGRESS_MESSAGE, payload })
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) {
    return cached
  }
  const response = await fetch(request)
  if (shouldCacheResponse(response)) {
    await cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (shouldCacheResponse(response)) {
      await cache.put(request, response.clone())
    }
    return response
  }
  catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

async function staleWhileRevalidate(request, cacheName, event) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const updateCache = fetch(request).then(async (response) => {
    if (shouldCacheResponse(response)) {
      await cache.put(request, response.clone())
    }
    return response
  })
  if (cached) {
    event.waitUntil(updateCache.catch(() => undefined))
    return cached
  }
  return updateCache
}

function shouldCacheResponse(response) {
  return response.ok && (response.type === 'basic' || response.type === 'cors')
}

function isHtmlRequest(request, url) {
  return request.destination === 'document' || url.pathname.endsWith('.html')
}
