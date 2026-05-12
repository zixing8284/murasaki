/**
 * Pure helpers and shared types for the Webamp adapter.
 *
 * No React, no DOM mutations, no module-level side effects beyond the
 * declaration of constants. Functions here are unit-testable in isolation
 * and are imported by the focused hooks (`webamp-loader`, `webamp-bounds`,
 * `webamp-milkdrop`, `webamp-persistence`) and by the host component.
 *
 * Mirrors daedalOS's `components/apps/Webamp/functions.ts` shape but
 * scoped to the playground's bordered-desktop layout (which requires a
 * cluster bounds clamp daedalOS does not need — see `webamp-bounds.ts`).
 */

import { assetPath } from '../../../lib/asset-path'

// ---------------------------------------------------------------------------
// Webamp public + private surface we rely on.
// `_actionEmitter` is technically internal but stable across versions and
// used the same way by daedalOS for years; keeping it documented here.
// ---------------------------------------------------------------------------

export interface WebampTrack {
  metaData?: { title?: string, artist?: string }
  url: string
  duration?: number
}

export interface WebampSkinOption {
  name: string
  url: string
  defaultName?: string
  loading?: boolean
  skinUrl?: string
}

export interface WebampOptions {
  initialTracks?: WebampTrack[]
  initialSkin?: { url: string }
  availableSkins?: WebampSkinOption[]
  enableHotkeys?: boolean
  requireButterchurnPresets?: () => Promise<Array<{ name: string, butterchurnPresetObject: unknown }>>
  zIndex?: number
}

interface WebampPrivateOptions {
  __butterchurnOptions?: unknown
  requireButterchurnPresets?: unknown
}

export interface WebampGenWindow {
  open?: boolean
  position?: { x: number, y: number }
}

export interface WebampState {
  windows?: {
    browserWindowSize?: Size
    genWindows?: Record<string, WebampGenWindow | undefined>
  }
  milkdrop?: {
    butterchurn?: unknown
    presets?: Array<{ name?: string }>
    presetHistory?: number[]
  }
}

export interface WebampBrowserWindowSizeChangedAction extends Size {
  type: 'BROWSER_WINDOW_SIZE_CHANGED'
}

export interface WebampUpdateWindowPositionsAction {
  absolute?: boolean
  positions: Record<string, Point>
  type: 'UPDATE_WINDOW_POSITIONS'
}

/**
 * Action emitter callback receives the dispatched action object. Returns
 * an unsubscribe function. This is `webamp._actionEmitter.on(...)`.
 */
export type WebampEmitterUnsubscribe = () => void
export interface WebampActionEmitter {
  on: (event: string, listener: (action: unknown) => void) => WebampEmitterUnsubscribe
}

export interface WebampCI {
  renderWhenReady: (el: HTMLElement) => Promise<void>
  onWillClose: (cb: (cancel: () => void) => void) => () => void
  onMinimize: (cb: () => void) => () => void
  onTrackDidChange: (cb: (track: WebampTrack | null) => void) => () => void
  close: () => void
  play: () => void
  pause: () => void
  skinIsLoaded: () => Promise<void>
  setTracksToPlay: (tracks: WebampTrack[]) => void
  setSkinFromUrl: (url: string) => void
  options?: WebampOptions & WebampPrivateOptions
  store: {
    dispatch: (action: unknown) => void
    getState: () => WebampState
    subscribe: (listener: () => void) => () => void
  }
  /** Internal but stable; see comment above. */
  _actionEmitter: WebampActionEmitter
}

export type WebampCtor = new (options: WebampOptions) => WebampCI

declare global {
  interface Window {
    Webamp?: WebampCtor
    butterchurn?: unknown
    butterchurnPresets?: unknown
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const WEBAMP_SCRIPT_SRC = assetPath('/programs/webamp/webamp.bundle.min.js')
export const WEBAMP_BUTTERCHURN_MODULE_SRC = assetPath('/programs/webamp/webamp.butterchurn-bundle.min.mjs')
export const BUTTERCHURN_SCRIPT_SRC = assetPath('/programs/webamp/butterchurn.min.js')
export const BUTTERCHURN_PRESETS_SCRIPT_SRC = assetPath('/programs/webamp/butterchurn-presets.min.js')

export const MAIN_WINDOW_SELECTOR = '#main-window'
export const PLAYLIST_WINDOW_SELECTOR = '#playlist-window'

/** Approximate Webamp window size — matches daedalOS `BASE_WINDOW_SIZE`. */
export const BASE_WINDOW = { width: 275, height: 116 } as const

/**
 * Conservative size estimate for the Milkdrop visualizer window. Webamp's
 * butterchurn canvas is significantly larger than `BASE_WINDOW` (the
 * generic 275×116 placeholder) and is opaque, so naive adjacent placement
 * using BASE_WINDOW lets it visually cover main/playlist on open. We use
 * this estimate when picking a milkdrop spot so it lands somewhere it
 * does not overlap the main column.
 */
export const MILKDROP_ESTIMATED_SIZE = { width: 290, height: 200 } as const

/**
 * Constructor `zIndex` passed to Webamp so its body-level context menu
 * portal (z-index = this + 1) paints above every playground window.
 * The host element creates its own stacking context, so this large
 * internal value never escapes to compete with regular windows.
 */
export const WEBAMP_INTERNAL_Z_INDEX = 1_000_000

/** Preset cycle interval — matches daedalOS. */
export const PRESET_CYCLE_MS = 20_000

/** Hardcoded broken presets known to crash butterchurn; mirrors daedalOS. */
export const BROKEN_PRESETS: ReadonlySet<string> = new Set([
  'Flexi - alien fish pond',
  'Geiss - Spiral Artifact',
])

export const DEFAULT_INITIAL_TRACKS: WebampTrack[] = [
  {
    metaData: { artist: 'DJ Mike Llama', title: 'Llama Whippin\' Intro' },
    url: 'https://dn721609.ca.archive.org/0/items/llamawhippinintrobydjmikellama/demo.mp3',
  },
]

interface WebampSkinMuseumResponse {
  data?: {
    skins?: {
      nodes?: Array<{ download_url?: string }>
    }
  }
}

interface StoredSkinMuseumSkin {
  url: string
}

const WINAMP_SKIN_MUSEUM_GRAPHQL_URL = 'https://skins.webamp.org/graphql'
const WINAMP_SKIN_MUSEUM_DEFAULT_NAME = 'Random (Winamp Skin Museum)'
const WINAMP_SKIN_MUSEUM_MAX_OFFSET = 1000
const WINAMP_SKIN_MUSEUM_STORAGE_KEY = 'webamp:skin-museum:last-success:v1'
const WINAMP_SKIN_MUSEUM_FALLBACK_URL = 'https://archive.org/cors/winampskin_Expensive_Hi-Fi_1_2/ExpensiveHi-Fi.wsz?source=skin-museum-fallback'
let recentRandomSkinMuseumUrlAccess: { at: number, url: string } | null = null

function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  }
  catch {
    return null
  }
}

export function readStoredSkinMuseumUrl(): string | null {
  const storage = safeLocalStorage()
  if (!storage)
    return null

  try {
    const raw = storage.getItem(WINAMP_SKIN_MUSEUM_STORAGE_KEY)
    if (!raw)
      return null
    const parsed = JSON.parse(raw) as Partial<StoredSkinMuseumSkin>

    return typeof parsed.url === 'string' && parsed.url.length > 0
      ? parsed.url
      : null
  }
  catch {
    return null
  }
}

export function readStoredSkinMuseumInitialSkin(): { url: string } | undefined {
  const url = readStoredSkinMuseumUrl()
  return url ? { url } : undefined
}

export function writeStoredSkinMuseumUrl(url: string): void {
  const storage = safeLocalStorage()
  if (!storage)
    return

  try {
    storage.setItem(
      WINAMP_SKIN_MUSEUM_STORAGE_KEY,
      JSON.stringify({ url } satisfies StoredSkinMuseumSkin),
    )
  }
  catch {
    // Quota / private mode — ignore.
  }
}

export function clearStoredSkinMuseumUrl(): void {
  const storage = safeLocalStorage()
  if (!storage)
    return

  try {
    storage.removeItem(WINAMP_SKIN_MUSEUM_STORAGE_KEY)
  }
  catch {
    // ignore
  }
}

function noteRandomSkinMuseumUrlAccess(url: string): void {
  recentRandomSkinMuseumUrlAccess = { at: Date.now(), url }
}

export function consumeRecentRandomSkinMuseumUrlAccess(maxAgeMs: number): string | null {
  const recent = recentRandomSkinMuseumUrlAccess
  recentRandomSkinMuseumUrlAccess = null

  if (!recent)
    return null
  if (Date.now() - recent.at > maxAgeMs)
    return null

  return recent.url
}

function createWebampSkinMuseumQuery(offset: number): string {
  return `
    query {
      skins(filter: APPROVED, first: 1, offset: ${offset}) {
        nodes {
          download_url
        }
      }
    }
  `
}

async function fetchRandomWinampSkinMuseumUrl(): Promise<string | null> {
  const response = await fetch(WINAMP_SKIN_MUSEUM_GRAPHQL_URL, {
    body: JSON.stringify({
      query: createWebampSkinMuseumQuery(
        Math.floor(Math.random() * WINAMP_SKIN_MUSEUM_MAX_OFFSET),
      ),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok)
    return null

  const payload = await response.json() as WebampSkinMuseumResponse
  const nextUrl = payload.data?.skins?.nodes?.[0]?.download_url

  return typeof nextUrl === 'string' && nextUrl.length > 0 ? nextUrl : null
}

function createRandomWinampSkinMuseumSkin(): WebampSkinOption {
  return {
    defaultName: WINAMP_SKIN_MUSEUM_DEFAULT_NAME,
    loading: false,
    skinUrl: '',
    get name(): string {
      if (typeof window === 'undefined' || this.loading)
        return this.defaultName ?? WINAMP_SKIN_MUSEUM_DEFAULT_NAME

      this.loading = true

      void fetchRandomWinampSkinMuseumUrl()
        .then((nextUrl) => {
          if (nextUrl) {
            // Buffer the freshly fetched URL in memory so that the very
            // next user click on this menu entry resolves to a real skin.
            // Persistence is intentionally deferred to the `url` getter
            // (which only fires on actual selection) — otherwise just
            // hovering the menu would silently overwrite the user's
            // last-applied random skin and re-randomize on every reopen.
            this.skinUrl = nextUrl
          }
        })
        .catch(() => {
          // Keep the previous random skin or fallback URL when the museum API fails.
        })
        .finally(() => {
          this.loading = false
        })

      return this.defaultName ?? WINAMP_SKIN_MUSEUM_DEFAULT_NAME
    },
    get url(): string {
      const nextUrl = this.skinUrl || WINAMP_SKIN_MUSEUM_FALLBACK_URL
      // Webamp reads `url` synchronously when the user clicks this entry
      // and dispatches `setSkinFromUrl(url)`. Persisting here means the
      // stored URL only changes on explicit selection, so reopening
      // Webamp restores exactly what the user last picked.
      writeStoredSkinMuseumUrl(nextUrl)
      noteRandomSkinMuseumUrlAccess(nextUrl)
      return nextUrl
    },
  }
}

export const DEFAULT_SKINS: WebampSkinOption[] = [
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
  createRandomWinampSkinMuseumSkin(),
]

// ---------------------------------------------------------------------------
// Geometry types (used by bounds + position seeding).
// ---------------------------------------------------------------------------

export interface Size { width: number, height: number }
export interface Point { x: number, y: number }

export const WEBAMP_WINDOW_KEYS = ['main', 'playlist', 'milkdrop', 'equalizer'] as const
export type WebampWindowKey = typeof WEBAMP_WINDOW_KEYS[number]

export interface WindowRect extends Point, Size { key: WebampWindowKey }
export interface BBox { minX: number, minY: number, maxX: number, maxY: number }

export function webampWindowElementId(key: WebampWindowKey): string {
  return key === 'main' ? 'main-window' : `${key}-window`
}

// ---------------------------------------------------------------------------
// Script loaders (idempotent, module-scoped promises so HMR + remounts
// never trigger a second <script> tag).
// ---------------------------------------------------------------------------

let webampScriptPromise: Promise<WebampCtor> | null = null
let butterchurnScriptPromise: Promise<void> | null = null
let butterchurnPresetsScriptPromise: Promise<void> | null = null
let staticModuleId = 0

function loadScriptOnce(src: string, dataKey: string): Promise<void> {
  if (typeof window === 'undefined')
    return Promise.reject(new Error('Webamp requires a browser environment'))

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

export function loadWebampScript(): Promise<WebampCtor> {
  if (typeof window === 'undefined')
    return Promise.reject(new Error('Webamp requires a browser environment'))

  webampScriptPromise ??= importStaticModule<unknown>(WEBAMP_BUTTERCHURN_MODULE_SRC)
    .then((module) => {
      const ctor = unwrapDefault(module)
      if (typeof ctor === 'function')
        return ctor as WebampCtor
      throw new Error('Webamp Butterchurn module did not export a constructor')
    })
    .catch(() => {
      if (window.Webamp)
        return window.Webamp
      return loadScriptOnce(WEBAMP_SCRIPT_SRC, 'webampLoader')
        .then(() => {
          if (window.Webamp)
            return window.Webamp
          throw new Error('Webamp global not found after script load')
        })
    })
    .catch((error) => {
      webampScriptPromise = null
      throw error
    })

  return webampScriptPromise
}

export function loadButterchurnScript(): Promise<void> {
  butterchurnScriptPromise ??= loadScriptOnce(BUTTERCHURN_SCRIPT_SRC, 'butterchurnLoader')
    .catch((error) => {
      butterchurnScriptPromise = null
      throw error
    })
  return butterchurnScriptPromise
}

export function loadButterchurnPresetsScript(): Promise<void> {
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
  if (value && typeof value === 'object' && 'default' in value)
    return (value as { default: unknown }).default
  return value
}

function importStaticModule<T>(src: string): Promise<T> {
  if (typeof window === 'undefined')
    return Promise.reject(new Error('Webamp requires a browser environment'))

  const href = new URL(src, window.location.href).href
  const key = `__webampStaticModule${staticModuleId += 1}`
  const eventName = `${key}:load`
  const registry = window as unknown as Record<string, unknown>

  return new Promise<T>((resolve, reject) => {
    const script = document.createElement('script')

    function cleanup(): void {
      window.removeEventListener(eventName, onLoad)
      delete registry[key]
      script.remove()
    }

    function onLoad(): void {
      const value = registry[key]
      cleanup()
      resolve(value as T)
    }

    script.type = 'module'
    script.textContent = [
      `import moduleDefault from ${JSON.stringify(href)};`,
      `window[${JSON.stringify(key)}] = moduleDefault;`,
      `window.dispatchEvent(new Event(${JSON.stringify(eventName)}));`,
    ].join('\n')
    window.addEventListener(eventName, onLoad, { once: true })
    script.addEventListener('error', () => {
      cleanup()
      reject(new Error(`Failed to load module: ${src}`))
    }, { once: true })
    document.head.append(script)
  })
}

export function getButterchurnGlobal(): unknown {
  return unwrapDefault(window.butterchurn)
}

export function getButterchurnPresetsGlobal(): Record<string, unknown> | null {
  const raw = unwrapDefault(window.butterchurnPresets)
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null
}

export function hasBundledMilkdropAssets(webamp: WebampCI): boolean {
  return Boolean(webamp.options?.__butterchurnOptions || webamp.options?.requireButterchurnPresets)
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

export function getWebampElement(): HTMLDivElement | null {
  return document.querySelector<HTMLDivElement>('#webamp')
}

function haltEvent(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * Block the browser's default file-drop navigation on the Webamp main
 * and playlist windows. We do not currently route dropped files into
 * Webamp, but without this guard the browser would navigate away when a
 * user drops a file onto the player.
 */
export function bindWebampDropGuards(webampEl: HTMLDivElement | null): () => void {
  const windows = webampEl
    ? [
        webampEl.querySelector<HTMLDivElement>(MAIN_WINDOW_SELECTOR),
        webampEl.querySelector<HTMLDivElement>(PLAYLIST_WINDOW_SELECTOR),
      ]
    : []
  const attached = windows.filter((el): el is HTMLDivElement => el !== null)

  attached.forEach((el) => {
    el.addEventListener('dragover', haltEvent)
    el.addEventListener('drop', haltEvent)
  })

  return () => {
    attached.forEach((el) => {
      el.removeEventListener('dragover', haltEvent)
      el.removeEventListener('drop', haltEvent)
    })
  }
}

/**
 * Returns a function that resolves the rendered DOM size of a Webamp
 * sub-window, falling back to `BASE_WINDOW` when the element does not
 * exist (e.g. window is closed). Used by the bounds clamp.
 */
export function domSizeReader(root: HTMLElement | null): (key: WebampWindowKey) => Size {
  return (key) => {
    const el = root?.querySelector<HTMLElement>(`#${webampWindowElementId(key)}`)
    return {
      width: el?.offsetWidth || BASE_WINDOW.width,
      height: el?.offsetHeight || BASE_WINDOW.height,
    }
  }
}

// ---------------------------------------------------------------------------
// Position math
// ---------------------------------------------------------------------------

/**
 * Centered initial main-window position assuming main + playlist stack
 * vertically. Falls back to viewport size when no host is provided.
 */
export function centerPosition(host: HTMLElement | null): Point {
  const w = host?.clientWidth ?? window.innerWidth
  const h = host?.clientHeight ?? window.innerHeight
  return {
    x: Math.max(0, Math.round((w - BASE_WINDOW.width) / 2)),
    y: Math.max(0, Math.round((h - BASE_WINDOW.height * 2) / 2)),
  }
}

/**
 * Compute positions for the whole Webamp cluster (main, playlist,
 * milkdrop) given the desired main-window position and the host size.
 *
 * Layout:
 *   - Playlist sits directly below main.
 *   - Milkdrop is placed by `findMilkdropSpot` so it does not overlap
 *     the main column (Webamp's milkdrop canvas renders much larger
 *     than `BASE_WINDOW`, so naive adjacent placement would cover the
 *     player on first open).
 */
export function computeStackPositions(
  main: Point,
  host: HTMLElement | null,
): { main: Point, playlist: Point, milkdrop: Point } {
  return {
    main,
    playlist: { x: main.x, y: main.y + BASE_WINDOW.height },
    milkdrop: findMilkdropSpot(main, host),
  }
}

/**
 * Pick a sensible milkdrop position relative to the main column. Uses
 * `MILKDROP_ESTIMATED_SIZE` for fit checks because Webamp's actual
 * canvas size isn't measurable until after React renders the open
 * window. Tried in order:
 *
 *   1. Right of the main column, if it fits horizontally.
 *   2. Left of the main column, if it fits horizontally.
 *   3. Below the playlist, if it fits vertically.
 *   4. Above main, if it fits vertically.
 *   5. Top-right of the host, even if it overflows — never (0, 0).
 */
export function findMilkdropSpot(
  main: Point,
  host: HTMLElement | null,
): Point {
  const hostW = host?.clientWidth ?? window.innerWidth
  const hostH = host?.clientHeight ?? window.innerHeight
  const { width: mdW, height: mdH } = MILKDROP_ESTIMATED_SIZE
  const { width: mainW, height: mainH } = BASE_WINDOW
  const stackH = mainH * 2 // main + playlist

  // 1. Right of main.
  if (main.x + mainW + mdW <= hostW)
    return { x: main.x + mainW, y: clampY(main.y, mdH, hostH) }
  // 2. Left of main.
  if (main.x - mdW >= 0)
    return { x: main.x - mdW, y: clampY(main.y, mdH, hostH) }
  // 3. Below playlist.
  if (main.y + stackH + mdH <= hostH)
    return { x: clampX(main.x, mdW, hostW), y: main.y + stackH }
  // 4. Above main.
  if (main.y - mdH >= 0)
    return { x: clampX(main.x, mdW, hostW), y: main.y - mdH }
  // 5. Top-right corner — guaranteed non-zero so the user can find and drag it.
  return { x: Math.max(0, hostW - mdW), y: 0 }
}

function clampX(x: number, w: number, hostW: number): number {
  return Math.max(0, Math.min(x, hostW - w))
}

function clampY(y: number, h: number, hostH: number): number {
  return Math.max(0, Math.min(y, hostH - h))
}

// ---------------------------------------------------------------------------
// Bounds clamp (pure)
// ---------------------------------------------------------------------------

export function collectOpenWindowRects(
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

export function unionBBox(rects: readonly WindowRect[]): BBox | null {
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

/**
 * Returns the (dx, dy) needed to pull `bbox` back inside `[0, viewport]`.
 * If the bbox is larger than the viewport on an axis, the min side wins
 * so the cluster pins to top/left instead of cutting off bottom/right.
 */
export function computeClampDelta(bbox: BBox, viewport: Size): Point {
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

export function shiftRects(
  rects: readonly WindowRect[],
  delta: Point,
): Record<string, Point> {
  const next: Record<string, Point> = {}
  for (const r of rects)
    next[r.key] = { x: r.x + delta.x, y: r.y + delta.y }
  return next
}

/**
 * Tell Webamp that its effective browser window is the playground
 * desktop host, not the real document viewport. Webamp's own live drag
 * math reads this reducer state, so this is the primary bounds bridge.
 */
export function dispatchWebampBrowserWindowSize(
  instance: WebampCI,
  host: HTMLElement | null,
): boolean {
  if (!host)
    return false
  const width = host.clientWidth
  const height = host.clientHeight
  if (width <= 0 || height <= 0)
    return false

  const current = instance.store.getState().windows?.browserWindowSize
  if (current?.width === width && current.height === height)
    return false

  instance.store.dispatch({
    height,
    type: 'BROWSER_WINDOW_SIZE_CHANGED',
    width,
  } satisfies WebampBrowserWindowSizeChangedAction)
  return true
}

/**
 * Fallback convergence clamp for any window positions that still escape
 * the host. This is intentionally separate from the primary viewport
 * bridge above: live drag should be bounded by Webamp's own state, while
 * this catches resize/race/third-party edge cases after the fact.
 */
export function clampOpenWindowsToHost(
  instance: WebampCI,
  host: HTMLElement | null,
  root: HTMLElement | null = getWebampElement(),
): boolean {
  if (!host)
    return false
  // Guard against the host being hidden (display: none / minimize) —
  // clientWidth/Height become 0, which would incorrectly push every window
  // to (0, 0) via computeClampDelta. Skip the clamp until the host is
  // visible again; positions written to storage are restored on the next
  // visible-state syncNow pass.
  const hostW = host.clientWidth
  const hostH = host.clientHeight
  if (hostW <= 0 || hostH <= 0)
    return false

  const rects = collectOpenWindowRects(instance.store.getState(), domSizeReader(root))
  const bbox = unionBBox(rects)
  if (!bbox)
    return false

  const delta = computeClampDelta(bbox, { width: hostW, height: hostH })
  if (delta.x === 0 && delta.y === 0)
    return false

  instance.store.dispatch({
    absolute: false,
    positions: shiftRects(rects, delta),
    type: 'UPDATE_WINDOW_POSITIONS',
  } satisfies WebampUpdateWindowPositionsAction)
  return true
}

// ---------------------------------------------------------------------------
// Milkdrop preset selection (pure)
// ---------------------------------------------------------------------------

/**
 * Pick a non-broken preset index, avoiding both the static blacklist and
 * the last 5 entries of presetHistory. Returns -1 if no presets exist.
 * Accepts an optional dynamic blacklist (e.g. session-persisted).
 */
export function pickPresetIndex(
  state: WebampState,
  extraBlacklist: ReadonlySet<string> = new Set<string>(),
): number {
  const presets = state.milkdrop?.presets ?? []
  const history = state.milkdrop?.presetHistory ?? []
  if (presets.length === 0)
    return -1

  const recent = new Set(history.slice(-5))
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const index = Math.floor(Math.random() * presets.length)
    const name = presets[index]?.name
    if (!name)
      continue
    if (BROKEN_PRESETS.has(name) || extraBlacklist.has(name))
      continue
    if (recent.has(index))
      continue
    return index
  }
  return Math.floor(Math.random() * presets.length)
}
