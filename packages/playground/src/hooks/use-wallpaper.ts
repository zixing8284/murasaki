import type { WallpaperMode, WallpaperSettings } from '../lib/wallpapers'
import { useCallback, useSyncExternalStore } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, writeJsonStorageItem } from '../lib/persistence'
import { isCustomWallpaperId } from '../lib/wallpaper-storage'
import { getDefaultWallpaperSettings, getWallpaperEntry, WALLPAPERS } from '../lib/wallpapers'

const storageKey = PLAYGROUND_STORAGE_KEYS.wallpaper

const listenersByKey = new Map<string, Set<() => void>>()

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function isValidMode(value: unknown): value is WallpaperMode {
  return value === 'tiled' || value === 'centered' || value === 'stretch' || value === 'fill'
}

function parseStoredWallpaperSettings(value: unknown): WallpaperSettings | null {
  if (!value || typeof value !== 'object')
    return null

  const { id, mode } = value as Partial<WallpaperSettings>

  if (typeof id !== 'string' || !isValidMode(mode))
    return null

  // Validate the id is a known wallpaper or a custom one
  if (!isCustomWallpaperId(id) && !WALLPAPERS.some(w => w.id === id))
    return null

  return { id, mode }
}

function readSettings(): WallpaperSettings {
  return readJsonStorageItem(
    'local',
    storageKey,
    parseStoredWallpaperSettings,
  ) ?? getDefaultWallpaperSettings()
}

function emit(key: string): void {
  for (const listener of listenersFor(key)) listener()
}

export function areWallpaperSettingsEqual(a: WallpaperSettings, b: WallpaperSettings): boolean {
  return a.id === b.id && a.mode === b.mode
}

export function useWallpaper(): [WallpaperSettings, (next: WallpaperSettings) => void] {
  const subscribe = useCallback((callback: () => void) => {
    const set = listenersFor(storageKey)
    set.add(callback)
    return () => {
      set.delete(callback)
    }
  }, [])

  const getSnapshot = useCallback((): string => {
    return JSON.stringify(readSettings())
  }, [])

  const defaultSerialized = JSON.stringify(getDefaultWallpaperSettings())
  const getServerSnapshot = useCallback((): string => defaultSerialized, [defaultSerialized])

  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const settings: WallpaperSettings = parseStoredWallpaperSettings(JSON.parse(serialized) as unknown) ?? getDefaultWallpaperSettings()

  const setSettings = (next: WallpaperSettings): void => {
    if (!isCustomWallpaperId(next.id) && !getWallpaperEntry(next.id))
      return

    writeJsonStorageItem('local', storageKey, { id: next.id, mode: next.mode })
    emit(storageKey)
  }

  return [settings, setSettings]
}
