/**
 * Webamp position persistence (session-scoped).
 *
 * Stores the main-window x/y to `sessionStorage` so reopening Webamp
 * within the same browser session restores the user's chosen position
 * instead of always re-centering. Scoped to the session (not localStorage)
 * to keep the playground feeling stateless across hard reloads, matching
 * the project's general persistence philosophy while still removing the
 * "position resets on every open" UX papercut.
 *
 * Structure:
 *   - Pure functions `readStoredMainPosition` / `writeStoredMainPosition`
 *     are imported by `webamp-loader.ts` for the initial position seed.
 *   - The `useWebampPersistence` hook subscribes to Webamp's
 *     `UPDATE_WINDOW_POSITIONS` action emitter and writes the latest
 *     main coords (debounced) to storage.
 */

import type { Point, WebampCI } from './functions'
import { useEffect } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, removeStorageItem, writeJsonStorageItem } from '../../../lib/persistence'
import {
  clearStoredSkinMuseumUrl,
} from './functions'

const WRITE_DEBOUNCE_MS = 200

interface StoredPosition {
  main: Point
}

function parseStoredPosition(value: unknown): StoredPosition | null {
  if (!value || typeof value !== 'object')
    return null
  const main = (value as Partial<StoredPosition>).main
  if (!main || typeof main.x !== 'number' || typeof main.y !== 'number')
    return null
  if (!Number.isFinite(main.x) || !Number.isFinite(main.y))
    return null
  return { main: { x: main.x, y: main.y } }
}

export function readStoredMainPosition(): Point | null {
  return readJsonStorageItem('session', PLAYGROUND_STORAGE_KEYS.webampPosition, parseStoredPosition)?.main ?? null
}

export function writeStoredMainPosition(main: Point): void {
  writeJsonStorageItem('session', PLAYGROUND_STORAGE_KEYS.webampPosition, { main } satisfies StoredPosition)
}

export function clearStoredMainPosition(): void {
  removeStorageItem('session', PLAYGROUND_STORAGE_KEYS.webampPosition)
}

/**
 * Subscribe to Webamp's `UPDATE_WINDOW_POSITIONS` actions and persist the
 * main-window position (debounced). The hook is a no-op until the Webamp
 * instance is ready; once it is, it attaches via the action emitter and
 * cleans up on unmount.
 *
 * Reading the position on init is the loader's responsibility — see
 * `webamp-loader.ts` which calls `readStoredMainPosition()` before the
 * initial `UPDATE_WINDOW_POSITIONS` dispatch.
 */
export function useWebampPersistence(instance: WebampCI | null): void {
  useEffect(() => {
    if (!instance)
      return undefined

    let timer = 0

    const unsubscribePosition = instance._actionEmitter.on('UPDATE_WINDOW_POSITIONS', () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const main = instance.store.getState().windows?.genWindows?.main
        if (main?.position)
          writeStoredMainPosition(main.position)
      }, WRITE_DEBOUNCE_MS)
    })

    const unsubscribeDefaultSkin = instance._actionEmitter.on('LOAD_DEFAULT_SKIN', () => {
      clearStoredSkinMuseumUrl()
    })

    return () => {
      window.clearTimeout(timer)
      unsubscribePosition()
      unsubscribeDefaultSkin()
    }
  }, [instance])
}
