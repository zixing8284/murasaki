import { useCallback, useSyncExternalStore } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, writeJsonStorageItem } from '../lib/persistence'

export interface CrtTuningSettings {
  scanlineOpacity: number
  jitterAmount: number
  rollDuration: number
  rollOpacity: number
}

const defaultCrtTuningSettings: CrtTuningSettings = {
  scanlineOpacity: 0.24,
  jitterAmount: 0.28,
  rollDuration: 18,
  rollOpacity: 0.08,
}

interface StoredCrtTuningSettings {
  scanlineOpacity: number
  jitterAmount: number
  rollDuration: number
  rollOpacity: number
}

const listenersByKey = new Map<string, Set<() => void>>()

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function parseStoredCrtTuningSettings(value: unknown): StoredCrtTuningSettings | null {
  if (!value || typeof value !== 'object')
    return null

  const {
    scanlineOpacity,
    jitterAmount,
    rollDuration,
    rollOpacity,
  } = value as Partial<StoredCrtTuningSettings>

  if (
    typeof scanlineOpacity !== 'number'
    || typeof jitterAmount !== 'number'
    || typeof rollDuration !== 'number'
    || typeof rollOpacity !== 'number'
    || !Number.isFinite(scanlineOpacity)
    || !Number.isFinite(jitterAmount)
    || !Number.isFinite(rollDuration)
    || !Number.isFinite(rollOpacity)
  ) {
    return null
  }

  return {
    scanlineOpacity: clamp(scanlineOpacity, 0, 0.6),
    jitterAmount: clamp(jitterAmount, 0, 2),
    rollDuration: clamp(rollDuration, 8, 40),
    rollOpacity: clamp(rollOpacity, 0, 0.25),
  }
}

function readSettings(): CrtTuningSettings {
  return readJsonStorageItem(
    'local',
    PLAYGROUND_STORAGE_KEYS.crtTuning,
    parseStoredCrtTuningSettings,
  ) ?? defaultCrtTuningSettings
}

function emit(key: string): void {
  for (const listener of listenersFor(key)) listener()
}

export function areCrtTuningSettingsEqual(a: CrtTuningSettings, b: CrtTuningSettings): boolean {
  return a.scanlineOpacity === b.scanlineOpacity
    && a.jitterAmount === b.jitterAmount
    && a.rollDuration === b.rollDuration
    && a.rollOpacity === b.rollOpacity
}

export function useCrtTuning(): [CrtTuningSettings, (nextSettings: CrtTuningSettings) => void] {
  const storageKey = PLAYGROUND_STORAGE_KEYS.crtTuning

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

  const defaultSerialized = JSON.stringify(defaultCrtTuningSettings)
  const getServerSnapshot = useCallback((): string => defaultSerialized, [defaultSerialized])

  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const settings: CrtTuningSettings = parseStoredCrtTuningSettings(JSON.parse(serialized) as unknown) ?? defaultCrtTuningSettings

  const setSettings = (nextSettings: CrtTuningSettings): void => {
    const normalized = {
      scanlineOpacity: clamp(nextSettings.scanlineOpacity, 0, 0.6),
      jitterAmount: clamp(nextSettings.jitterAmount, 0, 2),
      rollDuration: clamp(nextSettings.rollDuration, 8, 40),
      rollOpacity: clamp(nextSettings.rollOpacity, 0, 0.25),
    } satisfies StoredCrtTuningSettings
    writeJsonStorageItem('local', storageKey, normalized)
    emit(storageKey)
  }

  return [settings, setSettings]
}
