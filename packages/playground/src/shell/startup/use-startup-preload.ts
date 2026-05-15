import { useEffect, useState } from 'react'
import { assetPath } from '../../lib/asset-path'
import { ASSET_MANIFEST_PUBLIC_PATH, uniquePaths } from '../../lib/playground-assets'
import { getCriticalAssetPaths, getWarmAssetPaths } from './startup-assets'

/** Concurrent image preloads for the blocking critical group. */
const CRITICAL_CONCURRENCY = 8
/** Lower concurrency for background warmup so it doesn't fight foreground work. */
const WARM_CONCURRENCY = 4
/** Minimum splash time so the startup screen isn't a sub-frame flash. */
const MIN_SPLASH_MS = 450
/** Maximum time we block on critical preload before letting the desktop in. */
const CRITICAL_BUDGET_MS = 3000

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

interface AssetManifest {
  version: string
  groups: {
    critical?: string[]
    warm?: string[]
    programs?: string[]
  }
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

async function fetchManifest(signal: AbortSignal): Promise<AssetManifest | null> {
  try {
    const response = await fetch(assetPath(ASSET_MANIFEST_PUBLIC_PATH), { cache: 'no-cache', signal })
    return response.ok ? (await response.json()) as AssetManifest : null
  }
  catch {
    return null
  }
}

function decodeImage(image: HTMLImageElement): Promise<void> {
  return image.decode ? image.decode().catch(() => undefined) : Promise.resolve()
}

function preloadImage(path: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      resolve()
      return
    }

    const image = new Image()
    let onAbort: () => void = () => {}

    const settle = (error?: Error): void => {
      image.onload = null
      image.onerror = null
      signal.removeEventListener('abort', onAbort)
      if (error) {
        reject(error)
        return
      }
      resolve()
    }
    onAbort = () => {
      settle()
    }

    image.decoding = 'async'
    image.onload = () => {
      decodeImage(image).then(() => settle())
    }
    image.onerror = () => settle(new Error(`Unable to preload ${path}`))
    signal.addEventListener('abort', onAbort, { once: true })
    image.src = assetPath(path)
  })
}

interface PreloadOptions {
  signal: AbortSignal
  concurrency: number
  onStart?: (path: string) => void
  onComplete?: (path: string, error?: Error) => void
}

async function preloadAll(paths: readonly string[], options: PreloadOptions): Promise<void> {
  let cursor = 0
  const workers = Math.min(options.concurrency, paths.length)

  await Promise.all(Array.from({ length: workers }, async () => {
    while (!options.signal.aborted) {
      const index = cursor
      cursor += 1
      const path = paths[index]
      if (path == null)
        return

      options.onStart?.(path)
      try {
        await preloadImage(path, options.signal)
        options.onComplete?.(path)
      }
      catch (err) {
        options.onComplete?.(path, err instanceof Error ? err : new Error(`Unable to preload ${path}`))
      }
    }
  }))
}

function criticalFrom(manifest: AssetManifest | null): string[] {
  const fromManifest = manifest?.groups.critical ?? []
  if (fromManifest.length > 0) {
    return uniquePaths([...fromManifest, ...getCriticalAssetPaths()])
  }
  return getCriticalAssetPaths()
}

function warmFrom(manifest: AssetManifest | null, critical: readonly string[]): string[] {
  const fromManifest = manifest?.groups.warm ?? []
  const seen = new Set(critical)
  const candidates = fromManifest.length > 0 ? uniquePaths(fromManifest) : getWarmAssetPaths()
  return candidates.filter(path => !seen.has(path))
}

/**
 * Drives the playground startup splash: fetch manifest → preload critical
 * icons/images with bounded concurrency → mark ready → continue warm
 * preload in the background. Individual asset failures are non-fatal.
 */
export function useStartupPreload(): StartupPreloadState {
  const [state, setState] = useState<StartupPreloadState>(INITIAL_STATE)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    void (async () => {
      const manifest = await fetchManifest(controller.signal)
      const critical = criticalFrom(manifest)
      const warm = warmFrom(manifest, critical)
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

      const criticalRun = preloadAll(critical, {
        signal: controller.signal,
        concurrency: CRITICAL_CONCURRENCY,
        onStart: (path) => {
          if (mounted)
            setState(prev => ({ ...prev, currentAsset: path }))
        },
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
        await preloadAll(warm, {
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
