/**
 * Webamp Milkdrop integration.
 *
 * Lazy-loads `butterchurn.min.js` and (optionally) `butterchurn-presets.min.js`
 * the first time the user opens the Milkdrop window, then drives preset
 * selection and cycling. Mirrors daedalOS's lazy-load behavior.
 *
 * Bug fix tracked here:
 *   - "Milkdrop appears at desktop top-left on first open." Webamp's
 *     unseeded milkdrop position defaults to (0, 0). The loader hook
 *     pre-seeds milkdrop adjacent to main on init via
 *     `computeStackPositions`. This hook additionally repositions
 *     milkdrop adjacent to the *current* main position on every
 *     close→open transition, so opening milkdrop after the user has
 *     moved main still places it sensibly.
 *
 * Preset blacklist:
 *   - The hardcoded `BROKEN_PRESETS` set lives in `functions.ts`.
 *   - Additional preset names are loaded from `sessionStorage` on init
 *     and merged into the selection guard. We do not currently auto-
 *     detect crashing presets at runtime; the storage layer is in place
 *     for a future extension. The static + history-recency guards
 *     already eliminate the most common crash path.
 */

import type { WebampCI, WebampWindowKey } from './functions'
import { useEffect } from 'react'
import {
  findMilkdropSpot,
  getButterchurnGlobal,
  getButterchurnPresetsGlobal,
  hasBundledMilkdropAssets,
  loadButterchurnPresetsScript,
  loadButterchurnScript,
  pickPresetIndex,
  PRESET_CYCLE_MS,
} from './functions'

const BLACKLIST_STORAGE_KEY = 'webamp:milkdrop-blacklist:v1'
const BLACKLIST_MAX = 200

interface ButterchurnPreset {
  name: string
  preset: unknown
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  }
  catch {
    return null
  }
}

function readBlacklist(): Set<string> {
  const storage = safeStorage()
  if (!storage)
    return new Set()
  try {
    const raw = storage.getItem(BLACKLIST_STORAGE_KEY)
    if (!raw)
      return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed))
      return new Set()
    return new Set(parsed.filter((v): v is string => typeof v === 'string'))
  }
  catch {
    return new Set()
  }
}

function writeBlacklist(blacklist: ReadonlySet<string>): void {
  const storage = safeStorage()
  if (!storage)
    return
  try {
    const arr = Array.from(blacklist).slice(-BLACKLIST_MAX)
    storage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(arr))
  }
  catch {
    // ignore quota / private mode
  }
}

/** Append a preset name to the session-scoped blacklist. */
export function markPresetBroken(name: string): void {
  const blacklist = readBlacklist()
  if (blacklist.has(name))
    return
  blacklist.add(name)
  writeBlacklist(blacklist)
}

function dispatchSelectedPreset(webamp: WebampCI, blacklist: ReadonlySet<string>): void {
  const index = pickPresetIndex(webamp.store.getState(), blacklist)
  if (index < 0)
    return
  webamp.store.dispatch({ addToHistory: true, index, type: 'PRESET_REQUESTED' })
  webamp.store.dispatch({ index, type: 'SELECT_PRESET_AT_INDEX' })
}

function isWindowOpen(webamp: WebampCI, key: WebampWindowKey): boolean {
  return Boolean(webamp.store.getState().windows?.genWindows?.[key]?.open)
}

function isMilkdropLive(webamp: WebampCI): boolean {
  const state = webamp.store.getState()
  return Boolean(state.windows?.genWindows?.milkdrop?.open && state.milkdrop?.butterchurn)
}

function hasPresets(webamp: WebampCI): boolean {
  return Boolean(webamp.store.getState().milkdrop?.presets?.length)
}

/**
 * Reposition milkdrop adjacent to (or below) the current main window
 * using the multi-strategy `findMilkdropSpot` helper. Used on
 * close→open transitions so milkdrop never appears at desktop top-left
 * and never naively overlaps the main column with its larger canvas.
 */
function repositionMilkdropAdjacentToMain(
  webamp: WebampCI,
  host: HTMLElement | null,
): void {
  const state = webamp.store.getState()
  const main = state.windows?.genWindows?.main?.position
  if (!main)
    return
  const milkdrop = findMilkdropSpot(main, host)
  // Only milkdrop in the dispatch — don't disturb playlist/main.
  webamp.store.dispatch({
    absolute: false,
    positions: { milkdrop },
    type: 'UPDATE_WINDOW_POSITIONS',
  })
}

export function useWebampMilkdrop(
  instance: WebampCI | null,
  containerRef: { current: HTMLDivElement | null },
): void {
  useEffect(() => {
    if (!instance)
      return undefined

    let disposed = false
    let butterchurnLoaded = false
    let cycleTimerId = 0
    let repositionFrameId = 0
    let lastMilkdropOpen = isWindowOpen(instance, 'milkdrop')
    const blacklist = readBlacklist()

    const scheduleCycle = (): void => {
      window.clearInterval(cycleTimerId)
      cycleTimerId = window.setInterval(() => {
        if (!disposed && isMilkdropLive(instance))
          dispatchSelectedPreset(instance, blacklist)
      }, PRESET_CYCLE_MS)
    }

    const activateExistingPresets = (): boolean => {
      if (!hasPresets(instance))
        return false
      dispatchSelectedPreset(instance, blacklist)
      scheduleCycle()
      return true
    }

    const registerPresets = (): void => {
      if (activateExistingPresets() || hasBundledMilkdropAssets(instance))
        return
      void loadButterchurnPresetsScript()
        .then(() => {
          if (disposed)
            return
          const presetsObj = getButterchurnPresetsGlobal()
          if (!presetsObj)
            return
          const presets: ButterchurnPreset[] = Object.entries(presetsObj).map(
            ([name, preset]) => ({ name, preset }),
          )
          instance.store.dispatch({ presets, type: 'GOT_BUTTERCHURN_PRESETS' })
          dispatchSelectedPreset(instance, blacklist)
          scheduleCycle()
        })
        .catch(() => {
          // Optional file; leave milkdrop empty if missing.
        })
    }

    const ensureButterchurn = (): void => {
      if (butterchurnLoaded)
        return
      if (instance.store.getState().milkdrop?.butterchurn) {
        butterchurnLoaded = true
        registerPresets()
        return
      }
      butterchurnLoaded = true
      void loadButterchurnScript()
        .then(() => {
          if (disposed)
            return
          const butterchurn = getButterchurnGlobal()
          if (!butterchurn) {
            butterchurnLoaded = false
            return
          }
          instance.store.dispatch({ butterchurn, type: 'GOT_BUTTERCHURN' })
          registerPresets()
        })
        .catch(() => {
          butterchurnLoaded = false
        })
    }

    // Watch milkdrop open transitions to (a) reposition adjacent to
    // current main on every close→open, and (b) trigger butterchurn
    // load on first open.
    const storeUnsubscribe = instance.store.subscribe(() => {
      if (disposed)
        return
      const milkdropOpen = isWindowOpen(instance, 'milkdrop')
      if (milkdropOpen && !lastMilkdropOpen) {
        // Mark the edge before dispatching anything. `subscribe` fires
        // synchronously for nested dispatches, so if we reposition here
        // first, the UPDATE_WINDOW_POSITIONS dispatch re-enters this same
        // callback while `lastMilkdropOpen` is still false and we recurse
        // until Webamp crashes with a stack overflow.
        lastMilkdropOpen = true
        window.cancelAnimationFrame(repositionFrameId)
        repositionFrameId = window.requestAnimationFrame(() => {
          if (!disposed)
            repositionMilkdropAdjacentToMain(instance, containerRef.current)
        })
        ensureButterchurn()
        return
      }
      lastMilkdropOpen = milkdropOpen
    })

    const presetsUnsubscribe = instance._actionEmitter.on('GOT_BUTTERCHURN_PRESETS', () => {
      if (!disposed && isMilkdropLive(instance))
        activateExistingPresets()
    })

    // Advance preset on track change (only if milkdrop is currently live).
    const trackUnsubscribe = instance.onTrackDidChange(() => {
      if (!disposed && isMilkdropLive(instance))
        dispatchSelectedPreset(instance, blacklist)
    })

    return () => {
      disposed = true
      window.cancelAnimationFrame(repositionFrameId)
      window.clearInterval(cycleTimerId)
      storeUnsubscribe()
      presetsUnsubscribe()
      trackUnsubscribe()
    }
  }, [instance, containerRef])
}
