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
import {
  clearStoredSkinMuseumUrl,
} from './functions'

const STORAGE_KEY = 'webamp:position:v1'
const WRITE_DEBOUNCE_MS = 200

interface StoredPosition {
  main: Point
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  }
  catch {
    return null
  }
}

export function readStoredMainPosition(): Point | null {
  const storage = safeStorage()
  if (!storage)
    return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw)
      return null
    const parsed = JSON.parse(raw) as Partial<StoredPosition>
    const main = parsed.main
    if (!main || typeof main.x !== 'number' || typeof main.y !== 'number')
      return null
    if (!Number.isFinite(main.x) || !Number.isFinite(main.y))
      return null
    return { x: main.x, y: main.y }
  }
  catch {
    return null
  }
}

export function writeStoredMainPosition(main: Point): void {
  const storage = safeStorage()
  if (!storage)
    return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ main } satisfies StoredPosition))
  }
  catch {
    // Quota / private mode — silently drop.
  }
}

export function clearStoredMainPosition(): void {
  const storage = safeStorage()
  if (!storage)
    return
  try {
    storage.removeItem(STORAGE_KEY)
  }
  catch {
    // ignore
  }
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
