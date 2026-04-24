import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { useProcessActions, useProcesses } from '../../../contexts/process'

// ---------------------------------------------------------------------------
// Minimal surface of the Webamp public API we rely on.
// Mirrors https://github.com/captbaritone/webamp (UMD global `window.Webamp`).
// ---------------------------------------------------------------------------

interface WebampTrack {
  metaData?: { title?: string, artist?: string }
  url: string
  duration?: number
}

interface WebampOptions {
  initialTracks?: WebampTrack[]
  initialSkin?: { url: string }
  availableSkins?: Array<{ name: string, url: string }>
  enableHotkeys?: boolean
  zIndex?: number
}

interface WebampGenWindow {
  open?: boolean
  position?: { x: number, y: number }
}

interface WebampState {
  windows?: { genWindows?: Record<string, WebampGenWindow | undefined> }
  milkdrop?: {
    butterchurn?: unknown
    presets?: Array<{ name?: string }>
    presetHistory?: number[]
  }
}

export interface WebampCI {
  renderWhenReady: (el: HTMLElement) => Promise<void>
  onWillClose: (cb: (cancel: () => void) => void) => () => void
  onMinimize: (cb: () => void) => () => void
  onTrackDidChange: (cb: (track: WebampTrack | null) => void) => () => void
  close: () => void
  play: () => void
  pause: () => void
  setTracksToPlay: (tracks: WebampTrack[]) => void
  setSkinFromUrl: (url: string) => void
  store: {
    dispatch: (action: unknown) => void
    getState: () => WebampState
    subscribe: (listener: () => void) => () => void
  }
}

interface ButterchurnPreset {
  name: string
  preset: unknown
}

type ButterchurnPresets = Record<string, unknown>

type WebampCtor = new (options: WebampOptions) => WebampCI

declare global {
  interface Window {
    Webamp?: WebampCtor
    butterchurn?: unknown
    butterchurnPresets?: unknown
  }
}

const WEBAMP_SCRIPT_SRC = '/programs/webamp/webamp.bundle.min.js'
const BUTTERCHURN_SCRIPT_SRC = '/programs/webamp/butterchurn.min.js'
const BUTTERCHURN_PRESETS_SCRIPT_SRC = '/programs/webamp/butterchurn-presets.min.js'
const MAIN_WINDOW_SELECTOR = '#main-window'
const PLAYLIST_WINDOW_SELECTOR = '#playlist-window'

// Approximate Webamp window size — matches daedalOS `BASE_WINDOW_SIZE`.
const BASE_WINDOW = { width: 275, height: 116 }

// Preset cycle interval — matches daedalOS.
const PRESET_CYCLE_MS = 20_000

// Presets that are known to misbehave; mirrors daedalOS `BROKEN_PRESETS`.
const BROKEN_PRESETS = new Set<string>([
  'Flexi - alien fish pond',
  'Geiss - Spiral Artifact',
])

const DEFAULT_INITIAL_TRACKS: WebampTrack[] = [
  {
    metaData: { artist: 'DJ Mike Llama', title: 'Llama Whippin\' Intro' },
    url: 'https://dn721609.ca.archive.org/0/items/llamawhippinintrobydjmikellama/demo.mp3',
  },
]

const DEFAULT_SKINS = [
  {
    name: 'Expensive Hi-Fi',
    url: 'https://archive.org/cors/winampskin_Expensive_Hi-Fi_1_2/ExpensiveHi-Fi.wsz',
  },
  {
    name: 'Green Dimension V2',
    url: 'https://archive.org/cors/winampskin_Green-Dimension-V2/Green-Dimension-V2.wsz',
  },
  {
    name: 'Mac OSX v1.5 (Aqua)',
    url: 'https://archive.org/cors/winampskin_mac_os_x_1_5-aqua/mac_os_x_1_5-aqua.wsz',
  },
]

let webampScriptPromise: Promise<WebampCtor> | null = null
let butterchurnScriptPromise: Promise<void> | null = null
let butterchurnPresetsScriptPromise: Promise<void> | null = null

function loadScriptOnce(src: string, dataKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Webamp requires a browser environment'))
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-${dataKey}="true"]`)
    const script = existing ?? document.createElement('script')

    if (!existing) {
      script.src = src
      script.async = true
      script.dataset[dataKey] = 'true'
      document.head.append(script)
    }

    if (script.dataset.loaded === 'true') {
      resolve()
      return
    }

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => {
      reject(new Error(`Failed to load script: ${src}`))
    }, { once: true })
  })
}

function loadWebampScript(): Promise<WebampCtor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Webamp requires a browser environment'))
  }

  if (window.Webamp) {
    return Promise.resolve(window.Webamp)
  }

  webampScriptPromise ??= loadScriptOnce(WEBAMP_SCRIPT_SRC, 'webampLoader')
    .then(() => {
      if (window.Webamp)
        return window.Webamp

      throw new Error('Webamp global not found after script load')
    })
    .catch((error) => {
      webampScriptPromise = null
      throw error
    })

  return webampScriptPromise
}

function loadButterchurnScript(): Promise<void> {
  butterchurnScriptPromise ??= loadScriptOnce(BUTTERCHURN_SCRIPT_SRC, 'butterchurnLoader')
    .catch((error) => {
      butterchurnScriptPromise = null
      throw error
    })

  return butterchurnScriptPromise
}

function loadButterchurnPresetsScript(): Promise<void> {
  butterchurnPresetsScriptPromise ??= loadScriptOnce(
    BUTTERCHURN_PRESETS_SCRIPT_SRC,
    'butterchurnPresetsLoader',
  ).catch((error) => {
    butterchurnPresetsScriptPromise = null
    throw error
  })

  return butterchurnPresetsScriptPromise
}

function unwrapDefault(value: unknown): unknown {
  if (value && typeof value === 'object' && 'default' in value) {
    return (value as { default: unknown }).default
  }
  return value
}

function getButterchurnGlobal(): unknown {
  return unwrapDefault(window.butterchurn)
}

function getButterchurnPresetsGlobal(): ButterchurnPresets | null {
  const raw = unwrapDefault(window.butterchurnPresets)
  return raw && typeof raw === 'object' ? (raw as ButterchurnPresets) : null
}

function haltEvent(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
}

// --- Milkdrop helpers (mirrors daedalOS `functions.ts`) --------------------

function pickPresetIndex(webamp: WebampCI): number {
  const state = webamp.store.getState()
  const presets = state.milkdrop?.presets ?? []
  const history = state.milkdrop?.presetHistory ?? []
  if (presets.length === 0)
    return -1

  // Avoid both broken presets and any of the last 5 choices.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const index = Math.floor(Math.random() * presets.length)
    const preset = presets[index]
    if (!preset?.name)
      continue
    if (BROKEN_PRESETS.has(preset.name))
      continue
    if (history.slice(-5).includes(index))
      continue
    return index
  }
  return Math.floor(Math.random() * presets.length)
}

function loadButterchurnPreset(webamp: WebampCI): void {
  const index = pickPresetIndex(webamp)
  if (index < 0)
    return
  webamp.store.dispatch({ addToHistory: true, index, type: 'PRESET_REQUESTED' })
  webamp.store.dispatch({ index, type: 'SELECT_PRESET_AT_INDEX' })
}

function centeredMainPosition(container: HTMLElement | null): { x: number, y: number } {
  const w = container?.clientWidth ?? window.innerWidth
  const h = container?.clientHeight ?? window.innerHeight
  // Center assuming main + playlist stack vertically (2 × BASE_WINDOW height).
  const x = Math.max(0, Math.round((w - BASE_WINDOW.width) / 2))
  const y = Math.max(0, Math.round((h - BASE_WINDOW.height * 2) / 2))
  return { x, y }
}

function updateWebampPosition(webamp: WebampCI, container: HTMLElement | null): void {
  const { x, y } = centeredMainPosition(container)
  const { width, height } = BASE_WINDOW
  webamp.store.dispatch({
    absolute: false,
    positions: {
      main: { x, y },
      milkdrop: { x: -width, y: -height },
      playlist: { x, y: y + height },
    },
    type: 'UPDATE_WINDOW_POSITIONS',
  })
}

// --- Bounds clamp (pure helpers) -------------------------------------------
//
// Webamp clamps its own drag against `window.innerWidth/Height`. In the
// playground the Webamp host is smaller than the viewport (desktop border
// + taskbar), so Webamp's internal clamp is too permissive on the right
// and bottom. daedalOS doesn't need this because its desktop fills the
// viewport and the taskbar visually covers any overflow via z-index.
//
// We treat the union bbox of all open Webamp windows as one draggable
// unit (playlist/EQ/milkdrop snap to main, so moving them separately
// would let satellites escape while main stays anchored) and shift them
// by a shared delta when the bbox exits the host rect.

const WEBAMP_WINDOW_KEYS = ['main', 'playlist', 'milkdrop', 'equalizer'] as const
type WebampWindowKey = typeof WEBAMP_WINDOW_KEYS[number]

interface Size { width: number, height: number }
interface Point { x: number, y: number }
interface WindowRect extends Point, Size { key: WebampWindowKey }
interface BBox { minX: number, minY: number, maxX: number, maxY: number }

function webampWindowElementId(key: WebampWindowKey): string {
  return key === 'main' ? 'main-window' : `${key}-window`
}

function collectOpenWindowRects(
  state: WebampState,
  sizeOf: (key: WebampWindowKey) => Size,
): WindowRect[] {
  const genWindows = state.windows?.genWindows
  if (!genWindows)
    return []

  const rects: WindowRect[] = []
  for (const key of WEBAMP_WINDOW_KEYS) {
    const win = genWindows[key]
    if (!win?.open || !win.position)
      continue
    const { width, height } = sizeOf(key)
    rects.push({ key, x: win.position.x, y: win.position.y, width, height })
  }
  return rects
}

function unionBBox(rects: readonly WindowRect[]): BBox | null {
  if (rects.length === 0)
    return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const r of rects) {
    if (r.x < minX)
      minX = r.x
    if (r.y < minY)
      minY = r.y
    if (r.x + r.width > maxX)
      maxX = r.x + r.width
    if (r.y + r.height > maxY)
      maxY = r.y + r.height
  }
  return { minX, minY, maxX, maxY }
}

// Returns the (dx, dy) needed to pull `bbox` back inside `[0, viewport]`.
// If the bbox is larger than the viewport on an axis, min side wins so
// the cluster pins to top/left instead of cutting off bottom/right.
function computeClampDelta(bbox: BBox, viewport: Size): Point {
  let dx = 0
  let dy = 0
  if (bbox.maxX > viewport.width)
    dx = viewport.width - bbox.maxX
  if (bbox.minX + dx < 0)
    dx = -bbox.minX
  if (bbox.maxY > viewport.height)
    dy = viewport.height - bbox.maxY
  if (bbox.minY + dy < 0)
    dy = -bbox.minY
  return { x: dx, y: dy }
}

function shiftRects(
  rects: readonly WindowRect[],
  delta: Point,
): Record<string, Point> {
  const next: Record<string, Point> = {}
  for (const r of rects)
    next[r.key] = { x: r.x + delta.x, y: r.y + delta.y }
  return next
}

function domSizeReader(root: HTMLElement | null): (key: WebampWindowKey) => Size {
  return (key) => {
    const el = root?.querySelector<HTMLElement>(`#${webampWindowElementId(key)}`)
    return {
      width: el?.offsetWidth || BASE_WINDOW.width,
      height: el?.offsetHeight || BASE_WINDOW.height,
    }
  }
}

export interface UseWebampResult {
  instanceRef: RefObject<WebampCI | null>
}

/**
 * Instantiate and mount a Webamp player inside `containerRef`.
 *
 * Bridges Webamp's internal events to the playground's `ProcessContext`:
 *   - `onWillClose`      -> `actions.close(windowId)`
 *   - `onMinimize`       -> `actions.minimize(windowId)`
 *   - `onTrackDidChange` -> `actions.title(windowId, artist - title)`
 *
 * Milkdrop follows the daedalOS pattern:
 *   - Equalizer is closed, Milkdrop is enabled but not yet populated.
 *   - When the user opens the Milkdrop window, `butterchurn.min.js` is
 *     loaded from /programs/webamp/ and handed to the Webamp store.
 *   - If `butterchurn-presets.min.js` is present in the same folder, a
 *     preset pool is registered and a random preset is selected, with
 *     rotation every 20 s. Track changes also trigger a preset change.
 *
 * The `butterchurn-presets.min.js` file is optional: without it, Webamp's
 * Milkdrop menu item is still enabled but the visualiser will stay empty.
 *
 * Minimize state flows the other way: when the process is minimised from
 * the taskbar, the `#webamp` element is hidden via CSS `display`.
 */
export function useWebamp(
  windowId: string,
  containerRef: RefObject<HTMLDivElement | null>,
): UseWebampResult {
  const { close, minimize, title } = useProcessActions()
  const { processes } = useProcesses()
  const process = processes[windowId]
  const minimized = process?.minimized ?? false

  const instanceRef = useRef<WebampCI | null>(null)

  // Latest-callback refs so the init effect can stay mount-only.
  const closeRef = useRef(close)
  const minimizeRef = useRef(minimize)
  const titleRef = useRef(title)

  useEffect(() => {
    closeRef.current = close
    minimizeRef.current = minimize
    titleRef.current = title
  }, [close, minimize, title])

  useEffect(() => {
    const container = containerRef.current
    if (!container)
      return

    let disposed = false
    const cleanups: Array<() => void> = []
    let cycleTimerId = 0

    const scheduleCycle = (webamp: WebampCI): void => {
      window.clearInterval(cycleTimerId)
      cycleTimerId = window.setInterval(() => {
        loadButterchurnPreset(webamp)
      }, PRESET_CYCLE_MS)
    }

    const registerPresetsIfAvailable = (webamp: WebampCI): void => {
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
          webamp.store.dispatch({ presets, type: 'GOT_BUTTERCHURN_PRESETS' })
          loadButterchurnPreset(webamp)
          scheduleCycle(webamp)
        })
        .catch(() => {
          // Presets script is optional; leave Milkdrop empty.
        })
    }

    const loadMilkdropWhenNeeded = (webamp: WebampCI): void => {
      const unsubscribe = webamp.store.subscribe(() => {
        if (disposed)
          return
        const state = webamp.store.getState()
        const milkdropOpen = state.windows?.genWindows?.milkdrop?.open
        const hasButterchurn = Boolean(state.milkdrop?.butterchurn)
        if (!milkdropOpen || hasButterchurn)
          return

        unsubscribe()

        void loadButterchurnScript()
          .then(() => {
            if (disposed)
              return
            const butterchurn = getButterchurnGlobal()
            if (!butterchurn)
              return

            webamp.store.dispatch({ butterchurn, type: 'GOT_BUTTERCHURN' })
            registerPresetsIfAvailable(webamp)
          })
          .catch(() => {
            // Milkdrop remains unavailable when the local script is missing.
          })
      })

      cleanups.push(unsubscribe)
    }

    loadWebampScript()
      .then((Webamp) => {
        if (disposed || !containerRef.current)
          return undefined

        const webamp = new Webamp({
          initialTracks: DEFAULT_INITIAL_TRACKS,
          availableSkins: DEFAULT_SKINS,
          enableHotkeys: true,
        })

        instanceRef.current = webamp

        cleanups.push(webamp.onWillClose((cancel) => {
          // Cancel Webamp's own removal; ProcessContext controls unmounting.
          cancel()
          closeRef.current(windowId)
        }))

        cleanups.push(webamp.onMinimize(() => {
          minimizeRef.current(windowId)
        }))

        cleanups.push(webamp.onTrackDidChange((track) => {
          // On track change, advance the Milkdrop preset if Milkdrop is live.
          const instance = instanceRef.current
          if (instance) {
            const state = instance.store.getState()
            if (state.windows?.genWindows?.milkdrop?.open && state.milkdrop?.butterchurn) {
              loadButterchurnPreset(instance)
            }
          }

          if (!track) {
            titleRef.current(windowId, 'Webamp')
            return
          }
          const { title: t, artist } = track.metaData ?? {}
          const display = [artist, t].filter(Boolean).join(' - ') || 'Webamp'
          titleRef.current(windowId, display)
        }))

        return webamp.renderWhenReady(containerRef.current).then(() => {
          if (disposed)
            return

          // Webamp always appends its `#webamp` element to `document.body`
          // via a layout effect (see webamp.bundle.min.js). Re-parent it
          // into our host so it shares the desktop's stacking context and
          // coordinate system, matching daedalOS's `StyledWebamp` pattern.
          const webampEl = document.querySelector<HTMLDivElement>('#webamp')
          if (webampEl && containerRef.current && webampEl.parentElement !== containerRef.current) {
            containerRef.current.append(webampEl)
          }
          if (webampEl) {
            // Fill the host so child window `position: absolute` coords
            // are resolved against the desktop area (matches system
            // windows, which are clamped to the same container bounds).
            // Pointer-events scoping lives in `playground.css`:
            // `#webamp` is pointer-transparent so the full-area wrapper
            // does not cover desktop icons, and `#webamp > *` re-enables
            // events on each Webamp window.
            webampEl.style.position = 'absolute'
            webampEl.style.inset = '0'
          }

          // daedalOS parity: close EQ, enable Milkdrop menu, center the
          // window stack (host-relative), and attach a lazy Milkdrop
          // loader. Deferred a frame so Webamp's own `renderWhenReady`
          // layout effects have committed before we override positions.
          webamp.store.dispatch({ type: 'CLOSE_WINDOW', windowId: 'equalizer' })
          webamp.store.dispatch({ open: false, type: 'ENABLE_MILKDROP' })
          const rafId = window.requestAnimationFrame(() => {
            if (disposed)
              return
            updateWebampPosition(webamp, containerRef.current)
          })
          cleanups.push(() => window.cancelAnimationFrame(rafId))
          loadMilkdropWhenNeeded(webamp)

          // Keep the Webamp cluster inside the host. Webamp's internal
          // drag clamp uses `window.innerWidth/Height`, which is larger
          // than our desktop area; without this correction the user can
          // drag windows past the right/bottom edges. The math is in
          // pure helpers (`collectOpenWindowRects` → `unionBBox` →
          // `computeClampDelta` → `shiftRects`); this subscriber is
          // only glue + dispatch.
          const readSize = domSizeReader(webampEl)
          const clampUnsubscribe = webamp.store.subscribe(() => {
            if (disposed)
              return
            const host = containerRef.current
            if (!host)
              return

            const rects = collectOpenWindowRects(webamp.store.getState(), readSize)
            const bbox = unionBBox(rects)
            if (!bbox)
              return

            const delta = computeClampDelta(bbox, {
              width: host.clientWidth,
              height: host.clientHeight,
            })
            if (delta.x === 0 && delta.y === 0)
              return

            webamp.store.dispatch({
              absolute: false,
              positions: shiftRects(rects, delta),
              type: 'UPDATE_WINDOW_POSITIONS',
            })
          })
          cleanups.push(clampUnsubscribe)

          // Prevent the browser from navigating when files are dropped on
          // the Webamp main / playlist windows.
          const windows = webampEl
            ? [
                webampEl.querySelector<HTMLDivElement>(MAIN_WINDOW_SELECTOR),
                webampEl.querySelector<HTMLDivElement>(PLAYLIST_WINDOW_SELECTOR),
              ]
            : []
          windows.forEach((el) => {
            if (!el)
              return
            el.addEventListener('dragover', haltEvent)
            cleanups.push(() => el.removeEventListener('dragover', haltEvent))
          })
        })
      })
      .catch((err) => {
        console.error('[webamp] failed to initialise', err)
      })

    return () => {
      disposed = true
      window.clearInterval(cycleTimerId)
      cleanups.forEach(fn => fn())

      // Webamp's internal layout-effect cleanup removes `#webamp` from
      // `document.body`. Since we moved it into our container, put it
      // back before Webamp tears down to avoid a NotFoundError.
      const webampEl = document.querySelector<HTMLDivElement>('#webamp')
      if (webampEl && webampEl.parentElement && webampEl.parentElement !== document.body) {
        document.body.append(webampEl)
      }

      try {
        instanceRef.current?.close()
      }
      catch {
        // ignore cleanup errors
      }
      instanceRef.current = null
    }
    // Init runs exactly once on mount; `windowId` changes would require a remount.
  }, [containerRef, windowId])

  // Toggle visibility of the Webamp DOM when the process is minimised.
  useEffect(() => {
    const webampEl = document.querySelector<HTMLElement>('#webamp')
    if (!webampEl)
      return
    webampEl.style.display = minimized ? 'none' : ''
  }, [minimized])

  return { instanceRef }
}
