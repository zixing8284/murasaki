import { useCallback, useSyncExternalStore } from 'react'
import {
  PLAYGROUND_STORAGE_KEYS,
  readJsonStorageItem,
  removeStorageItem,
  writeJsonStorageItem,
} from '../lib/persistence'

/**
 * Screen scale level for the monitor(s). `'fit'` auto-scales the monitor to fill
 * the available viewport (side-by-side aware); a number is an explicit scale
 * applied to the native resolution, so higher presets always render larger and
 * the desktop keeps enough room for fixed-size windows.
 */
export type ScreenScale = 'fit' | number

export interface ScreenScaleOption {
  label: string
  value: ScreenScale
}

export const SCREEN_SCALE_OPTIONS: ScreenScaleOption[] = [
  { label: 'Fit', value: 'fit' },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
]

const DEFAULT_SCALE: ScreenScale = 1

const ALLOWED_SCALES = new Set<number>(
  SCREEN_SCALE_OPTIONS.map(o => o.value).filter((v): v is number => typeof v === 'number'),
)

const listenersByKey = new Map<string, Set<() => void>>()
const LEGACY_SCREEN_SCALE_KEY = 'murasaki-screen-' + 'z' + 'oom'

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function parseStoredScale(value: unknown): ScreenScale | null {
  if (value === 'fit')
    return 'fit'
  if (typeof value === 'number' && Number.isFinite(value) && ALLOWED_SCALES.has(value))
    return value
  return null
}

function readScale(): ScreenScale {
  const stored = readJsonStorageItem(
    'local',
    PLAYGROUND_STORAGE_KEYS.screenScale,
    parseStoredScale,
  )

  if (stored !== null)
    return stored

  const legacy = readJsonStorageItem('local', LEGACY_SCREEN_SCALE_KEY, parseStoredScale)
  if (legacy !== null) {
    // One-time migration: preserve existing users' setting under the new key.
    writeJsonStorageItem('local', PLAYGROUND_STORAGE_KEYS.screenScale, legacy)
    removeStorageItem('local', LEGACY_SCREEN_SCALE_KEY)
    return legacy
  }

  return DEFAULT_SCALE
}

function emit(key: string): void {
  for (const listener of listenersFor(key)) listener()
}

export function useScreenScale(): [ScreenScale, (next: ScreenScale) => void] {
  const storageKey = PLAYGROUND_STORAGE_KEYS.screenScale

  const subscribe = useCallback((callback: () => void) => {
    const set = listenersFor(storageKey)
    set.add(callback)
    return () => {
      set.delete(callback)
    }
  }, [storageKey])

  const getSnapshot = useCallback((): string => JSON.stringify(readScale()), [])

  const defaultSerialized = JSON.stringify(DEFAULT_SCALE)
  const getServerSnapshot = useCallback((): string => defaultSerialized, [defaultSerialized])

  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const scale: ScreenScale = parseStoredScale(JSON.parse(serialized) as unknown) ?? DEFAULT_SCALE

  const setScale = (next: ScreenScale): void => {
    if (parseStoredScale(next) === null)
      return
    writeJsonStorageItem('local', storageKey, next)
    emit(storageKey)
  }

  return [scale, setScale]
}
