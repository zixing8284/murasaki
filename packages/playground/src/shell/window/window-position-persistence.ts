/**
 * Window position persistence (session-scoped).
 *
 * Stores the last dragged position for singleton windows to sessionStorage so
 * re-opening a window within the same browser session restores the user's
 * chosen placement instead of reverting to the directory default.
 *
 * Only singleton windows are tracked — multi-instance windows use cascade
 * placement, where per-instance persistence would be ambiguous.
 *
 * The position is stored as absolute pixel coords relative to the desktop
 * container, matching the coordinate space `useDraggable` works in.
 * `BaseWindow` already clamps `defaultPosition` to the container bounds on
 * mount, so an out-of-range value (e.g. from a previous smaller screen) is
 * automatically corrected without extra logic here.
 */

import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, writeJsonStorageItem } from '../../lib/persistence'

interface StoredPosition {
  left: number
  top: number
}

type StoredPositionMap = Record<string, StoredPosition>

function parseStoredPositionMap(value: unknown): StoredPositionMap | null {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return null
  const result: StoredPositionMap = {}
  for (const [key, pos] of Object.entries(value as Record<string, unknown>)) {
    if (
      pos != null
      && typeof pos === 'object'
      && !Array.isArray(pos)
      && typeof (pos as Record<string, unknown>).left === 'number'
      && typeof (pos as Record<string, unknown>).top === 'number'
      && Number.isFinite((pos as StoredPosition).left)
      && Number.isFinite((pos as StoredPosition).top)
    ) {
      result[key] = {
        left: (pos as StoredPosition).left,
        top: (pos as StoredPosition).top,
      }
    }
  }
  return result
}

function readAll(): StoredPositionMap {
  return (
    readJsonStorageItem(
      'session',
      PLAYGROUND_STORAGE_KEYS.windowPositions,
      parseStoredPositionMap,
    ) ?? {}
  )
}

export function readWindowPosition(appId: string): StoredPosition | null {
  return readAll()[appId] ?? null
}

export function writeWindowPosition(appId: string, position: StoredPosition): void {
  const all = readAll()
  all[appId] = position
  writeJsonStorageItem('session', PLAYGROUND_STORAGE_KEYS.windowPositions, all)
}
