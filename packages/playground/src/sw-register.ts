/**
 * Service worker registration + lightweight client bridge.
 *
 * - Registers `sw.js` relative to Vite's runtime `base` so the SW scope
 *   matches the deployed subpath (e.g. `/murasaki/` on GitHub Pages).
 * - Re-dispatches `MURASAKI_CACHE_PROGRESS` messages from the SW as a
 *   typed CustomEvent for UI consumers.
 * - Exposes `warmServiceWorkerCache()` so the startup flow can ask the
 *   SW to background-cache manifest groups after the desktop is ready.
 */

const CACHE_WARM_MESSAGE = 'MURASAKI_CACHE_WARM'
const CACHE_PROGRESS_MESSAGE = 'MURASAKI_CACHE_PROGRESS'
export const SW_CACHE_PROGRESS_EVENT = 'sw-cache-progress'

export interface SwCacheProgressDetail {
  loaded: number
  total: number
  path: string | null
}

/** Ask the active service worker to warm given manifest groups in the background. */
export function warmServiceWorkerCache(groups: ReadonlyArray<'critical' | 'warm' | 'programs'> = ['critical', 'warm']): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const message = { type: CACHE_WARM_MESSAGE, groups }
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
