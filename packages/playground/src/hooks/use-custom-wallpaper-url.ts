import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { getWallpaperImageBlob, isCustomWallpaperId } from '../lib/wallpaper-storage'

/**
 * Resolves a custom wallpaper id to an object URL.
 *
 * For built-in wallpapers (non-`custom:` ids) returns `null`.  For custom
 * wallpapers stored in IndexedDB the blob is fetched and an object URL is
 * created, which is revoked when the id changes or the component unmounts.
 *
 * Uses `useSyncExternalStore` so the URL is available synchronously on
 * re-render — no deferred / transition batching.
 */
export function useCustomWallpaperUrl(wallpaperId: string): string | null {
  const cacheRef = useRef(new Map<string, string>())
  const listenersRef = useRef(new Set<() => void>())
  const currentUrlRef = useRef<string | null>(null)

  // Kick off an async load when the id changes.
  useEffect(() => {
    if (!isCustomWallpaperId(wallpaperId)) {
      if (currentUrlRef.current !== null) {
        currentUrlRef.current = null
        for (const listener of listenersRef.current) listener()
      }
      return
    }

    // Already cached from a previous visit.
    if (cacheRef.current.has(wallpaperId)) {
      const cached = cacheRef.current.get(wallpaperId)!
      if (currentUrlRef.current !== cached) {
        currentUrlRef.current = cached
        for (const listener of listenersRef.current) listener()
      }
      return
    }

    let revoked = false

    getWallpaperImageBlob(wallpaperId)
      .then((blob) => {
        if (revoked || !blob)
          return

        const objectUrl = URL.createObjectURL(blob)
        cacheRef.current.set(wallpaperId, objectUrl)
        if (!revoked) {
          currentUrlRef.current = objectUrl
          for (const listener of listenersRef.current) listener()
        }
      })
      .catch(() => {
        // Silently ignore — the wallpaper may have been deleted.
      })

    return () => {
      revoked = true
    }
  }, [wallpaperId])

  // Revoke cached object URLs on unmount.
  useEffect(() => {
    const cache = cacheRef.current
    return () => {
      for (const url of cache.values()) {
        URL.revokeObjectURL(url)
      }
      cache.clear()
    }
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    listenersRef.current.add(callback)
    return () => {
      listenersRef.current.delete(callback)
    }
  }, [])

  const getSnapshot = useCallback((): string | null => {
    return currentUrlRef.current
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
