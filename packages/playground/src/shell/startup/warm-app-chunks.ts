import { useEffect } from 'react'
import { getSystemAppChunkLoaders } from '../../contexts/process/directory'

/** Warm at most this many chunks at once so the freshly-mounted desktop stays responsive. */
const WARM_CONCURRENCY = 2
/** Fall back to warming even if the browser never reports an idle period. */
const IDLE_TIMEOUT_MS = 2000

function scheduleIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = window.setTimeout(run, 200)
  return () => window.clearTimeout(handle)
}

/**
 * Warms system apps' lazy JS chunks in the background once the desktop is up.
 *
 * A real operating system doesn't load every applet into memory at boot — it
 * just starts the shell. The web equivalent of "already on local disk" is a
 * warmed module chunk, so we prefetch each system window's chunk during idle
 * time after boot. System windows then open instantly instead of showing an
 * in-window loading state, without bloating the initial bundle. External apps
 * (iframes, remote bundles) are intentionally excluded and keep their launch
 * splash.
 */
export function useWarmSystemAppChunks(enabled: boolean): void {
  useEffect(() => {
    if (!enabled)
      return

    const loaders = getSystemAppChunkLoaders()
    if (loaders.length === 0)
      return

    let cancelled = false
    const cancels = new Set<() => void>()
    let cursor = 0

    const pump = (): void => {
      if (cancelled || cursor >= loaders.length)
        return
      const loader = loaders[cursor]
      cursor += 1
      const cancel = scheduleIdle(() => {
        cancels.delete(cancel)
        void loader()
          .catch(() => undefined)
          .finally(() => {
            if (!cancelled)
              pump()
          })
      })
      cancels.add(cancel)
    }

    for (let i = 0; i < Math.min(WARM_CONCURRENCY, loaders.length); i += 1)
      pump()

    return () => {
      cancelled = true
      cancels.forEach(cancel => cancel())
      cancels.clear()
    }
  }, [enabled])
}
