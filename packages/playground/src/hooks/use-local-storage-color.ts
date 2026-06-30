import { useCallback, useSyncExternalStore } from 'react'
import { readStorageItem, writeStorageItem } from '../lib/persistence'

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

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string')
    return null

  const normalized = value.trim().toLowerCase()
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : null
}

function emit(key: string): void {
  for (const listener of listenersFor(key)) listener()
}

export function useLocalStorageColor(storageKey: string, defaultValue: string): [string, (nextColor: string) => void] {
  const readColor = useCallback((): string => {
    return normalizeHexColor(readStorageItem('local', storageKey)) ?? defaultValue
  }, [storageKey, defaultValue])

  const subscribe = useCallback((callback: () => void) => {
    const set = listenersFor(storageKey)
    set.add(callback)
    return () => {
      set.delete(callback)
    }
  }, [storageKey])

  const getSnapshot = useCallback((): string => readColor(), [readColor])
  const getServerSnapshot = useCallback((): string => defaultValue, [defaultValue])

  const color = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setColor = useCallback((nextColor: string): void => {
    const normalized = normalizeHexColor(nextColor)
    if (!normalized)
      return

    writeStorageItem('local', storageKey, normalized)
    emit(storageKey)
  }, [storageKey])

  return [color, setColor]
}
