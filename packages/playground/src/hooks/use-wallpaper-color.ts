import { useCallback, useSyncExternalStore } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readStorageItem, writeStorageItem } from '../lib/persistence'

const DEFAULT_WALLPAPER_COLOR = '#008080'
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const listenersByKey = new Map<string, Set<() => void>>()

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function normalizeWallpaperColor(value: unknown): string | null {
  if (typeof value !== 'string')
    return null

  const normalized = value.trim().toLowerCase()
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : null
}

function readWallpaperColor(storageKey: string): string {
  return normalizeWallpaperColor(readStorageItem('local', storageKey)) ?? DEFAULT_WALLPAPER_COLOR
}

function emit(storageKey: string): void {
  for (const listener of listenersFor(storageKey)) listener()
}

export function useWallpaperColor(): [string, (nextColor: string) => void] {
  const storageKey = PLAYGROUND_STORAGE_KEYS.wallpaperColor

  const subscribe = useCallback((callback: () => void) => {
    const set = listenersFor(storageKey)
    set.add(callback)
    return () => {
      set.delete(callback)
    }
  }, [storageKey])

  const getSnapshot = useCallback((): string => {
    return readWallpaperColor(storageKey)
  }, [storageKey])

  const getServerSnapshot = useCallback((): string => DEFAULT_WALLPAPER_COLOR, [])
  const color = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setColor = (nextColor: string): void => {
    const normalized = normalizeWallpaperColor(nextColor)
    if (!normalized)
      return

    writeStorageItem('local', storageKey, normalized)
    emit(storageKey)
  }

  return [color, setColor]
}
