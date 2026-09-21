import { useEffect, useState } from 'react'
import { fetchAssetManifest, preloadImages, tierPaths } from '../../lib/asset-provisioner'
import { isImageAsset } from '../../lib/asset-tiers'
import { uniquePaths } from '../../lib/playground-assets'

/** Concurrent image preloads for the blocking critical group. */
const CRITICAL_CONCURRENCY = 8
/** Lower concurrency for background warmup so it doesn't fight foreground work. */
const WARM_CONCURRENCY = 4
/** Minimum splash time so the startup screen isn't a sub-frame flash. */
const MIN_SPLASH_MS = 2460
/** Maximum time we block on critical preload before letting the desktop in. */
const CRITICAL_BUDGET_MS = 8000

export type StartupPhase = 'manifest' | 'critical' | 'ready' | 'warm'

export interface StartupPreloadState {
  phase: StartupPhase
  ready: boolean
  loaded: number
  total: number
  currentAsset: string | null
  /** Asset paths that failed to preload. Non-fatal; surfaced for debugging. */
  errors: string[]
}

const INITIAL_STATE: StartupPreloadState = {
  phase: 'manifest',
  ready: false,
  loaded: 0,
  total: 0,
  currentAsset: null,
  errors: [],
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

/**
 * Drives the playground startup splash: fetch manifest → preload the critical
 * image tier with bounded concurrency → mark ready → continue warming the
 * warm tier in the background. Offline caching of every tier is delegated to
 * the service worker via the provisioner; individual asset failures here are
 * non-fatal.
 */
export function useStartupPreload(): StartupPreloadState {
  const [state, setState] = useState<StartupPreloadState>(INITIAL_STATE)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    void (async () => {
      const manifest = await fetchAssetManifest(controller.signal)
      // Only images gate first paint; cursors and other non-image critical
      // assets are cached for offline by the service worker, not decoded here.
      const critical = uniquePaths(tierPaths(manifest, 'critical')).filter(isImageAsset)
      const seen = new Set(critical)
      const warm = uniquePaths(tierPaths(manifest, 'warm')).filter(path => isImageAsset(path) && !seen.has(path))
      const start = performance.now()
      let loaded = 0

      if (!mounted || controller.signal.aborted)
        return

      setState(prev => ({
        ...prev,
        phase: 'critical',
        loaded: 0,
        total: critical.length,
        currentAsset: critical[0] ?? null,
      }))

      const criticalRun = preloadImages(critical, {
        signal: controller.signal,
        concurrency: CRITICAL_CONCURRENCY,
        onComplete: (path, error) => {
          loaded += 1
          if (!mounted)
            return
          setState(prev => ({
            ...prev,
            loaded: Math.min(loaded, critical.length),
            currentAsset: path,
            errors: error ? [...prev.errors, path] : prev.errors,
          }))
        },
      })

      const elapsed = performance.now() - start
      const minWait = delay(Math.max(0, MIN_SPLASH_MS - elapsed))
      await Promise.all([minWait, Promise.race([criticalRun, delay(CRITICAL_BUDGET_MS)])])

      if (!mounted || controller.signal.aborted)
        return

      setState(prev => ({ ...prev, phase: 'ready', ready: true, currentAsset: null }))

      // Continue warming in the background — independent of desktop entry.
      void criticalRun.then(async () => {
        if (!mounted || controller.signal.aborted || warm.length === 0)
          return
        setState(prev => ({ ...prev, phase: 'warm' }))
        await preloadImages(warm, {
          signal: controller.signal,
          concurrency: WARM_CONCURRENCY,
        })
      })
    })()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  return state
}
