/**
 * Unified runtime asset provisioner — the single entry point for every asset
 * behavior in the playground.
 *
 * - Registers the service worker (production only) and bridges its cache
 *   progress + update events to the window.
 * - `ensureCached(tiers)` asks the SW to background-cache manifest tiers into
 *   Cache Storage for offline use.
 * - `preloadImages(paths)` decodes images into the HTTP cache so first paint
 *   is flash-free.
 * - `fetchAssetManifest()` reads the versioned, tiered manifest that this
 *   module and the SW share.
 *
 * Callers never reason about "service worker vs Image" or "which cache" —
 * they pick a tier and call one function.
 */

import type { AssetTier } from './asset-tiers'
import { assetPath } from './asset-path'
import { isImageAsset } from './asset-tiers'
import { ASSET_MANIFEST_PUBLIC_PATH } from './playground-assets'

const CACHE_WARM_MESSAGE = 'MURASAKI_CACHE_WARM'
const CACHE_PROGRESS_MESSAGE = 'MURASAKI_CACHE_PROGRESS'
export const SW_CACHE_PROGRESS_EVENT = 'sw-cache-progress'

export interface SwCacheProgressDetail {
  loaded: number
  total: number
  path: string | null
}

export interface AssetManifest {
  version: string
  groups: Record<AssetTier, string[]>
}

/** De-duplicated public paths for a manifest tier (empty when absent). */
export function tierPaths(manifest: AssetManifest | null, tier: AssetTier): string[] {
  return manifest?.groups?.[tier] ?? []
}

/** Fetch the versioned, tiered asset manifest shared with the service worker. */
export async function fetchAssetManifest(signal?: AbortSignal): Promise<AssetManifest | null> {
  try {
    const response = await fetch(assetPath(ASSET_MANIFEST_PUBLIC_PATH), { cache: 'no-cache', signal })
    return response.ok ? (await response.json()) as AssetManifest : null
  }
  catch {
    return null
  }
}

/** Ask the active service worker to warm the given manifest tiers for offline use. */
export function ensureCached(tiers: ReadonlyArray<AssetTier> = ['critical', 'warm']): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const message = { type: CACHE_WARM_MESSAGE, groups: tiers }
  const controller = navigator.serviceWorker.controller

  if (controller) {
    controller.postMessage(message)
    return
  }

  navigator.serviceWorker.ready
    .then(reg => reg.active?.postMessage(message))
    .catch((err) => {
      console.warn('SW cache warmup failed:', err)
    })
}

export interface PreloadOptions {
  signal: AbortSignal
  concurrency: number
  onComplete?: (path: string, error?: Error) => void
}

/**
 * Decode images into the HTTP cache with bounded concurrency. Non-image paths
 * are skipped (they are provisioned for offline via `ensureCached`), and
 * individual failures are non-fatal.
 */
export async function preloadImages(paths: readonly string[], options: PreloadOptions): Promise<void> {
  const images = paths.filter(isImageAsset)
  let cursor = 0
  const workers = Math.min(options.concurrency, images.length)

  await Promise.all(Array.from({ length: workers }, async () => {
    while (!options.signal.aborted) {
      const index = cursor
      cursor += 1
      const path = images[index]
      if (path == null)
        return

      try {
        await decodeImage(path, options.signal)
        options.onComplete?.(path)
      }
      catch (err) {
        options.onComplete?.(path, err instanceof Error ? err : new Error(`Unable to preload ${path}`))
      }
    }
  }))
}

function decodeImage(path: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      resolve()
      return
    }

    const image = new Image()
    const settle = (error?: Error): void => {
      image.onload = null
      image.onerror = null
      error ? reject(error) : resolve()
    }

    image.decoding = 'async'
    image.onload = () => image.decode().catch(() => undefined).then(() => settle())
    image.onerror = () => settle(new Error(`Unable to preload ${path}`))
    signal.addEventListener('abort', () => {
      image.src = ''
      settle()
    }, { once: true })
    image.src = assetPath(path)
  })
}

// ---------------------------------------------------------------------------
// Service worker registration + client bridge (production only).
//
// Registered relative to Vite's runtime `base` so the SW scope matches the
// deployed subpath (e.g. `/murasaki/` on GitHub Pages).
// ---------------------------------------------------------------------------

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller
  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  navigator.serviceWorker.register(swUrl).catch((err) => {
    console.warn('SW registration failed:', err)
  })

  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event.data as { type?: string, payload?: SwCacheProgressDetail } | null
    if (data?.type === CACHE_PROGRESS_MESSAGE && data.payload) {
      window.dispatchEvent(new CustomEvent<SwCacheProgressDetail>(SW_CACHE_PROGRESS_EVENT, { detail: data.payload }))
    }
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      window.dispatchEvent(new CustomEvent('sw-update'))
    }
  })
}
