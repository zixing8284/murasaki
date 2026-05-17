import { useCallback, useState } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, writeJsonStorageItem } from '../lib/persistence'

const DEFAULT_VISIBLE_COUNT = 2

interface StoredQuickLaunchState {
  visibleCount: number
}

function parseStoredQuickLaunchState(value: unknown): StoredQuickLaunchState | null {
  if (!value || typeof value !== 'object')
    return null
  const visibleCount = (value as Partial<StoredQuickLaunchState>).visibleCount
  if (typeof visibleCount !== 'number' || !Number.isFinite(visibleCount))
    return null
  return { visibleCount: Math.max(0, Math.round(visibleCount)) }
}

export function usePersistentQuickLaunchVisibleCount(
  defaultVisibleCount = DEFAULT_VISIBLE_COUNT,
): [number, (visibleCount: number) => void] {
  const [quickLaunchVisibleCount, setQuickLaunchVisibleCount] = useState(() => {
    return readJsonStorageItem(
      'local',
      PLAYGROUND_STORAGE_KEYS.taskbarQuickLaunchVisibleCount,
      parseStoredQuickLaunchState,
    )?.visibleCount ?? defaultVisibleCount
  })

  const persistVisibleCount = useCallback((nextVisibleCount: number) => {
    const rounded = Math.max(0, Math.round(nextVisibleCount))
    setQuickLaunchVisibleCount(rounded)
    writeJsonStorageItem('local', PLAYGROUND_STORAGE_KEYS.taskbarQuickLaunchVisibleCount, {
      visibleCount: rounded,
    } satisfies StoredQuickLaunchState)
  }, [])

  return [quickLaunchVisibleCount, persistVisibleCount]
}
