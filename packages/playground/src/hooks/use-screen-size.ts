import { useCallback, useSyncExternalStore } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, writeJsonStorageItem } from '../lib/persistence'

export interface ScreenSize {
  width: number
  height: number
}

export interface ScreenSizePreset {
  label: string
  width: number
  height: number
}

export const SCREEN_SIZE_PRESETS: ScreenSizePreset[] = [
  { label: '640 × 480', width: 640, height: 480 },
  { label: '800 × 600', width: 800, height: 600 },
  { label: '1024 × 768', width: 1024, height: 768 },
  { label: '1280 × 1024', width: 1280, height: 1024 },
  { label: '1600 × 1200', width: 1600, height: 1200 },
]

const DEFAULT_SIZE: ScreenSize = { width: 1024, height: 768 }

const PRESET_KEYS = new Set(
  SCREEN_SIZE_PRESETS.map(p => `${p.width}x${p.height}`),
)

const listenersByKey = new Map<string, Set<() => void>>()

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function isValidPreset(size: ScreenSize): boolean {
  return PRESET_KEYS.has(`${size.width}x${size.height}`)
}

function parseStoredScreenSize(value: unknown): ScreenSize | null {
  if (!value || typeof value !== 'object')
    return null

  const { width, height } = value as Partial<ScreenSize>

  if (
    typeof width !== 'number'
    || typeof height !== 'number'
    || !Number.isFinite(width)
    || !Number.isFinite(height)
    || width <= 0
    || height <= 0
  ) {
    return null
  }

  const candidate: ScreenSize = { width, height }
  return isValidPreset(candidate) ? candidate : null
}

function readSettings(): ScreenSize {
  return readJsonStorageItem(
    'local',
    PLAYGROUND_STORAGE_KEYS.screenSize,
    parseStoredScreenSize,
  ) ?? DEFAULT_SIZE
}

function emit(key: string): void {
  for (const listener of listenersFor(key)) listener()
}

export function areScreenSizesEqual(a: ScreenSize, b: ScreenSize): boolean {
  return a.width === b.width && a.height === b.height
}

export function useScreenSize(): [ScreenSize, (next: ScreenSize) => void] {
  const storageKey = PLAYGROUND_STORAGE_KEYS.screenSize

  const subscribe = useCallback((callback: () => void) => {
    const set = listenersFor(storageKey)
    set.add(callback)
    return () => {
      set.delete(callback)
    }
  }, [storageKey])

  const getSnapshot = useCallback((): string => {
    return JSON.stringify(readSettings())
  }, [])

  const defaultSerialized = JSON.stringify(DEFAULT_SIZE)
  const getServerSnapshot = useCallback((): string => defaultSerialized, [defaultSerialized])

  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const size: ScreenSize = parseStoredScreenSize(JSON.parse(serialized) as unknown) ?? DEFAULT_SIZE

  const setSize = (next: ScreenSize): void => {
    if (!isValidPreset(next))
      return
    writeJsonStorageItem('local', storageKey, { width: next.width, height: next.height })
    emit(storageKey)
  }

  return [size, setSize]
}
