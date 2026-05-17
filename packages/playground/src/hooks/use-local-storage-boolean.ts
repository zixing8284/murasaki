import { useCallback, useSyncExternalStore } from 'react'
import { readBooleanStorageItem, writeBooleanStorageItem } from '../lib/persistence'

/**
 * Boolean-valued, localStorage-backed store with cross-instance sync.
 *
 * Semantics:
 * - Default `true` when the key is absent or any value other than `'false'`
 *   is stored (preserves prior bespoke-hook behaviour).
 * - Writes notify all subscribers in the current tab so they re-read.
 * - Each key gets its own listener set so unrelated keys do not wake each
 *   other up.
 */

const listenersByKey = new Map<string, Set<() => void>>()

function listenersFor(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function getServerSnapshot(): boolean {
  return true
}

export function useLocalStorageBoolean(
  storageKey: string,
): [boolean, (enabled: boolean) => void] {
  const subscribe = useCallback((callback: () => void) => {
    const set = listenersFor(storageKey)
    set.add(callback)
    return () => {
      set.delete(callback)
    }
  }, [storageKey])

  const getSnapshot = useCallback(
    (): boolean => readBooleanStorageItem('local', storageKey),
    [storageKey],
  )

  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setEnabled = useCallback((value: boolean) => {
    writeBooleanStorageItem('local', storageKey, value)
    for (const listener of listenersFor(storageKey)) listener()
  }, [storageKey])

  return [enabled, setEnabled]
}
