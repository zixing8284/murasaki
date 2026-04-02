import { useEffect, useRef } from 'react'

// File flow (top to bottom):
// 1) Define reusable style constants and tiny DOM builders.
// 2) Build scrollbar DOM parts (bars, tracks, thumbs, arrow buttons, corner).
// 3) Keep custom scrollbar geometry synced with native scroll state.
// 4) Wire interactions (arrow hold-repeat, track page jump, thumb dragging).
// 5) Observe size/content changes and re-sync when layout changes.
// 6) Tear everything down on cleanup.
// 7) Expose all of this through `useScrollbar`.

// ─── Style helpers (CSS variable-based, auto-responds to theme changes) ──────

const RAISED_SHADOW = [
  'inset -1px -1px var(--button-dk-shadow)',
  'inset 1px 1px var(--button-light)',
  'inset -2px -2px var(--button-shadow)',
  'inset 2px 2px var(--button-hilight)',
].join(', ')

const SUNKEN_SHADOW = [
  'inset -1px -1px var(--button-hilight)',
  'inset 1px 1px var(--button-dk-shadow)',
  'inset -2px -2px var(--button-light)',
  'inset 2px 2px var(--button-shadow)',
].join(', ')

// 2×2 checker pattern using conic-gradient — supports CSS variables natively
const CHECKER_BG = 'repeating-conic-gradient(var(--button-face) 0% 25%, transparent 0% 50%) 0 0 / 2px 2px'

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function createDiv(styles: Partial<CSSStyleDeclaration>): HTMLDivElement {
  // Small helper to create and style elements in one place.
  const d = document.createElement('div')
  Object.assign(d.style, styles)
  return d
}

const ARROW_PATHS: Record<string, string> = {
  up: 'M8,6h-1v1h-1v1h-1v1h-1v1h7v-1h-1v-1h-1v-1h-1v-1Z',
  down: 'M11,6h-7v1h1v1h1v1h1v1h1v-1h1v-1h1v-1h1v-1Z',
  left: 'M9,4h-1v1h-1v1h-1v1h-1v1h1v1h1v1h1v1h1v-7Z',
  right: 'M7,4h-1v7h1v-1h1v-1h1v-1h1v-1h-1v-1h-1v-1h-1v-1Z',
}

function createArrowSvg(dir: string): SVGSVGElement {
  // Build a pixel-style arrow icon and center it inside a 16px button.
  const ns = 'http://www.w3.org/2000/svg'
  const isVert = dir === 'up' || dir === 'down'
  const h = isVert ? 17 : 16

  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '16')
  svg.setAttribute('height', String(h))
  svg.setAttribute('viewBox', `0 0 16 ${h}`)
  svg.setAttribute('shape-rendering', 'crispEdges')
  svg.style.cssText
    = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;display:block;overflow:visible;'

  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', ARROW_PATHS[dir] ?? '')
  path.setAttribute('fill', 'currentColor')
  svg.appendChild(path)
  svg.setAttribute('data-murasaki-arrow', dir)
  return svg
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BAR_SIZE = 16
const SCROLL_STEP = 40
const REPEAT_MS = 50

// ─── Scrollbar instance (plain object + functions) ───────────────────────────

// Module-level counter for unique per-element scrollbar IDs.
let _scrollbarIdCounter = 0

interface ScrollbarState {
  target: HTMLElement
  scrollbarId: string
  vBar: HTMLDivElement
  hBar: HTMLDivElement
  corner: HTMLDivElement
  vThumb: HTMLDivElement
  hThumb: HTMLDivElement
  vTrack: HTMLDivElement
  hTrack: HTMLDivElement
  vUp: HTMLDivElement
  vDown: HTMLDivElement
  hLeft: HTMLDivElement
  hRight: HTMLDivElement
  hideStyle: HTMLStyleElement
  resizeObs: ResizeObserver | null
  mutationObs: MutationObserver | null
  resizeRafId: number | null
  mutationRafId: number | null
  cleanups: Array<() => void>
  // Original style values captured before mutation, for full restore in destroy()
  origPaddingRight: string
  origPaddingBottom: string
  origBoxSizing: string
  origMsOverflowStyle: string
  origScrollbarWidth: string
  parent: HTMLElement | null
  origParentPosition: string | null
}

// ── Build arrow button ──

function buildButton(dir: string): HTMLDivElement {
  // Shared constructor for arrow buttons so v/h controls stay consistent.
  const btn = createDiv({
    position: 'relative',
    width: `${BAR_SIZE}px`,
    height: `${BAR_SIZE}px`,
    cursor: 'default',
    backgroundColor: 'var(--button-face)',
    color: 'var(--button-dk-shadow)',
    boxSizing: 'border-box',
    flexShrink: '0',
  })
  btn.style.boxShadow = RAISED_SHADOW
  btn.appendChild(createArrowSvg(dir))

  const btnName = dir === 'up'
    ? 'vup'
    : dir === 'down'
      ? 'vdown'
      : dir === 'left'
        ? 'hleft'
        : 'hright'
  btn.setAttribute('data-murasaki-btn', btnName)
  return btn
}

// ── Build all scrollbar DOM elements ──

function buildScrollbarDom(target: HTMLElement): ScrollbarState {
  // Build visual structure first, then append everything beside the target.

  // Vertical bar
  const vBar = createDiv({
    position: 'absolute',
    top: '0',
    right: '0',
    width: `${BAR_SIZE}px`,
    bottom: 'auto',
    zIndex: '100',
    display: 'none',
    boxSizing: 'border-box',
  })
  vBar.setAttribute('data-murasaki-vbar', '')

  const vUp = buildButton('up')

  const vDown = createDiv({
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: `${BAR_SIZE}px`,
    height: `${BAR_SIZE}px`,
    cursor: 'default',
    backgroundColor: 'var(--button-face)',
    color: 'var(--button-dk-shadow)',
    boxSizing: 'border-box',
    flexShrink: '0',
  })
  vDown.style.boxShadow = RAISED_SHADOW
  vDown.appendChild(createArrowSvg('down'))
  vDown.setAttribute('data-murasaki-btn', 'vdown')

  const vTrack = createDiv({
    position: 'absolute',
    top: `${BAR_SIZE}px`,
    bottom: `${BAR_SIZE}px`,
    left: '0',
    right: '0',
    backgroundColor: 'var(--button-light)',
    background: CHECKER_BG,
    cursor: 'default',
  })
  vTrack.setAttribute('data-murasaki-track', 'v')

  const vThumb = createDiv({
    position: 'absolute',
    left: '0',
    width: `${BAR_SIZE}px`,
    minHeight: `${BAR_SIZE}px`,
    backgroundColor: 'var(--button-face)',
    boxShadow: RAISED_SHADOW,
    cursor: 'default',
    boxSizing: 'border-box',
  })
  vThumb.setAttribute('data-murasaki-thumb', 'v')

  vTrack.appendChild(vThumb)
  vBar.appendChild(vUp)
  vBar.appendChild(vTrack)
  vBar.appendChild(vDown)

  // Horizontal bar
  const hBar = createDiv({
    position: 'absolute',
    bottom: '0',
    left: '0',
    height: `${BAR_SIZE}px`,
    right: `${BAR_SIZE}px`,
    zIndex: '100',
    display: 'none',
    boxSizing: 'border-box',
  })
  hBar.setAttribute('data-murasaki-hbar', '')

  const hLeft = buildButton('left')
  hLeft.style.position = 'absolute'
  hLeft.style.left = '0'
  hLeft.style.top = '0'

  const hRight = createDiv({
    position: 'absolute',
    right: '0',
    top: '0',
    width: `${BAR_SIZE}px`,
    height: `${BAR_SIZE}px`,
    cursor: 'default',
    backgroundColor: 'var(--button-face)',
    color: 'var(--button-dk-shadow)',
    boxSizing: 'border-box',
  })
  hRight.style.boxShadow = RAISED_SHADOW
  hRight.appendChild(createArrowSvg('right'))
  hRight.setAttribute('data-murasaki-btn', 'hright')

  const hTrack = createDiv({
    position: 'absolute',
    left: `${BAR_SIZE}px`,
    right: `${BAR_SIZE}px`,
    top: '0',
    bottom: '0',
    backgroundColor: 'var(--button-light)',
    background: CHECKER_BG,
    cursor: 'default',
  })
  hTrack.setAttribute('data-murasaki-track', 'h')

  const hThumb = createDiv({
    position: 'absolute',
    top: '0',
    height: `${BAR_SIZE}px`,
    minWidth: `${BAR_SIZE}px`,
    backgroundColor: 'var(--button-face)',
    boxShadow: RAISED_SHADOW,
    cursor: 'default',
    boxSizing: 'border-box',
  })
  hThumb.setAttribute('data-murasaki-thumb', 'h')

  hTrack.appendChild(hThumb)
  hBar.appendChild(hLeft)
  hBar.appendChild(hTrack)
  hBar.appendChild(hRight)

  // Corner
  const corner = createDiv({
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: `${BAR_SIZE}px`,
    height: `${BAR_SIZE}px`,
    backgroundColor: 'var(--button-face)',
    zIndex: '101',
    display: 'none',
  })
  corner.setAttribute('data-murasaki-corner', '')

  // Append to parent
  const parent = target.parentNode as HTMLElement

  // Capture style originals before any mutation for full restore in destroy()
  const origPaddingRight = target.style.paddingRight
  const origPaddingBottom = target.style.paddingBottom
  const origBoxSizing = target.style.boxSizing
  const origMsOverflowStyle = target.style.getPropertyValue('-ms-overflow-style')
  const origScrollbarWidth = target.style.getPropertyValue('scrollbar-width')

  let origParentPosition: string | null = null
  if (parent) {
    const parentComputedPosition = getComputedStyle(parent).position
    if (parentComputedPosition === 'static') {
      origParentPosition = parent.style.position
      parent.style.position = 'relative'
    }
  }
  parent.appendChild(vBar)
  parent.appendChild(hBar)
  parent.appendChild(corner)

  // Assign a unique attribute so the injected ::-webkit-scrollbar rule targets
  // only this element and not all elements that happen to share the same class.
  const scrollbarId = String(++_scrollbarIdCounter)
  target.dataset['murasakiScrollbarId'] = scrollbarId

  // Hide native scrollbar
  target.style.setProperty('-ms-overflow-style', 'none')
  target.style.setProperty('scrollbar-width', 'none', 'important')

  const hideStyle = document.createElement('style')
  hideStyle.textContent
    = `[data-murasaki-scrollbar-id="${scrollbarId}"]::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}`
  document.head.appendChild(hideStyle)

  return {
    target,
    scrollbarId,
    vBar,
    hBar,
    corner,
    vThumb,
    hThumb,
    vTrack,
    hTrack,
    vUp,
    vDown,
    hLeft,
    hRight,
    hideStyle,
    resizeObs: null,
    mutationObs: null,
    resizeRafId: null,
    mutationRafId: null,
    cleanups: [],
    origPaddingRight,
    origPaddingBottom,
    origBoxSizing,
    origMsOverflowStyle,
    origScrollbarWidth,
    parent,
    origParentPosition,
  }
}

// ── Sync scrollbar layout with scroll state ──

function syncLayout(s: ScrollbarState): void {
  // Source of truth: native scroll metrics from target.
  // We only render custom visuals that mirror those metrics.
  const t = s.target
  const hasV = t.scrollHeight > t.clientHeight
  const hasH = t.scrollWidth > t.clientWidth

  s.vBar.style.display = hasV ? 'block' : 'none'
  s.hBar.style.display = hasH ? 'block' : 'none'
  s.corner.style.display = hasV && hasH ? 'block' : 'none'

  // Padding so content doesn't sit behind the scrollbar
  t.style.paddingRight = hasV ? `${BAR_SIZE}px` : s.origPaddingRight
  t.style.paddingBottom = hasH ? `${BAR_SIZE}px` : s.origPaddingBottom
  t.style.boxSizing = 'border-box'

  if (hasV) {
    // Vertical thumb size = viewport/content ratio, position = scroll progress.
    const vHeight = hasH ? t.clientHeight - BAR_SIZE : t.clientHeight
    s.vBar.style.height = `${vHeight}px`
    s.vBar.style.bottom = 'auto'

    const trackH = s.vTrack.clientHeight
    const ratio = t.clientHeight / t.scrollHeight
    const thumbH = Math.max(BAR_SIZE, trackH * ratio)
    const travel = trackH - thumbH
    const maxScroll = t.scrollHeight - t.clientHeight
    const pos = maxScroll > 0 ? (t.scrollTop / maxScroll) * travel : 0

    s.vThumb.style.height = `${thumbH}px`
    s.vThumb.style.top = `${pos}px`
  }

  if (hasH) {
    // Horizontal thumb uses the same ratio/progress mapping as vertical.
    const hWidth = hasV ? t.clientWidth - BAR_SIZE : t.clientWidth
    s.hBar.style.width = `${hWidth}px`
    s.hBar.style.right = 'auto'

    const trackW = s.hTrack.clientWidth
    const ratio = t.clientWidth / t.scrollWidth
    const thumbW = Math.max(BAR_SIZE, trackW * ratio)
    const travel = trackW - thumbW
    const maxScroll = t.scrollWidth - t.clientWidth
    const pos = maxScroll > 0 ? (t.scrollLeft / maxScroll) * travel : 0

    s.hThumb.style.width = `${thumbW}px`
    s.hThumb.style.left = `${pos}px`
  }
}

// ── Arrow button behavior (click + auto-repeat on hold) ──

function addButtonBehavior(
  s: ScrollbarState,
  btn: HTMLDivElement,
  action: () => void,
): void {
  // Press behavior: immediate action + hold-to-repeat, with pressed visual state.
  let intervalId: ReturnType<typeof setInterval> | null = null

  const onDown = (e: MouseEvent): void => {
    e.preventDefault()
    btn.style.boxShadow = SUNKEN_SHADOW

    const arrow = btn.querySelector<SVGSVGElement>('[data-murasaki-arrow]')
    if (arrow) {
      arrow.style.transform = 'translate(calc(-50% + 1px), calc(-50% + 1px))'
    }

    action()
    intervalId = setInterval(action, REPEAT_MS)
  }

  const onUp = (): void => {
    if (intervalId == null) {
      return
    }
    clearInterval(intervalId)
    intervalId = null

    btn.style.boxShadow = RAISED_SHADOW

    const arrow = btn.querySelector<SVGSVGElement>('[data-murasaki-arrow]')
    if (arrow) {
      arrow.style.transform = 'translate(-50%, -50%)'
    }
  }

  btn.addEventListener('mousedown', onDown)
  document.addEventListener('mouseup', onUp)
  s.cleanups.push(() => {
    btn.removeEventListener('mousedown', onDown)
    document.removeEventListener('mouseup', onUp)
  })
}

// ── Thumb drag behavior ──

function addDragBehavior(
  s: ScrollbarState,
  thumb: HTMLDivElement,
  axis: 'h' | 'v',
): void {
  // Drag behavior maps mouse delta in track space to native scroll delta.
  const t = s.target

  const onDown = (e: MouseEvent): void => {
    e.preventDefault()
    const startMouse = axis === 'v' ? e.clientY : e.clientX
    const startScroll = axis === 'v' ? t.scrollTop : t.scrollLeft

    const onMove = (ev: MouseEvent): void => {
      const delta = (axis === 'v' ? ev.clientY : ev.clientX) - startMouse
      const track = axis === 'v' ? s.vTrack : s.hTrack
      const thumbSize = axis === 'v'
        ? Number.parseFloat(s.vThumb.style.height)
        : Number.parseFloat(s.hThumb.style.width)
      const trackSize = axis === 'v' ? track.clientHeight : track.clientWidth
      const scrollSize = axis === 'v'
        ? t.scrollHeight - t.clientHeight
        : t.scrollWidth - t.clientWidth
      const travel = trackSize - thumbSize
      if (travel <= 0) {
        return
      }
      const scrollDelta = (delta / travel) * scrollSize

      if (axis === 'v') {
        t.scrollTop = startScroll + scrollDelta
      }
      else {
        t.scrollLeft = startScroll + scrollDelta
      }
      syncLayout(s)
    }

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  thumb.addEventListener('mousedown', onDown)
  s.cleanups.push(() => thumb.removeEventListener('mousedown', onDown))
}

// ── Bind all events ──

function bindEvents(s: ScrollbarState): void {
  // Central wiring point for all runtime behaviors and observers.
  const t = s.target

  // Scroll → sync layout
  const onScroll = (): void => {
    syncLayout(s)
  }
  t.addEventListener('scroll', onScroll)
  s.cleanups.push(() => t.removeEventListener('scroll', onScroll))

  // ResizeObserver
  if (window.ResizeObserver) {
    s.resizeObs = new ResizeObserver(() => {
      s.resizeRafId ??= requestAnimationFrame(() => {
        s.resizeRafId = null
        syncLayout(s)
      })
    })
    s.resizeObs.observe(t)
    if (t.parentNode instanceof HTMLElement) {
      s.resizeObs.observe(t.parentNode)
    }
    Array.from(t.children).forEach((child) => {
      s.resizeObs!.observe(child)
    })
  }

  // MutationObserver — content changes
  s.mutationObs = new MutationObserver(() => {
    if (s.mutationRafId != null) return
    s.mutationRafId = requestAnimationFrame(() => {
      s.mutationRafId = null
      syncLayout(s)
    })
  })
  s.mutationObs.observe(t, { childList: true, subtree: true })

  // Arrow buttons
  addButtonBehavior(s, s.vUp, () => {
    t.scrollTop -= SCROLL_STEP
    syncLayout(s)
  })
  addButtonBehavior(s, s.vDown, () => {
    t.scrollTop += SCROLL_STEP
    syncLayout(s)
  })
  addButtonBehavior(s, s.hLeft, () => {
    t.scrollLeft -= SCROLL_STEP
    syncLayout(s)
  })
  addButtonBehavior(s, s.hRight, () => {
    t.scrollLeft += SCROLL_STEP
    syncLayout(s)
  })

  // Track click → page scroll
  const onVTrack = (e: MouseEvent): void => {
    if (e.target === s.vThumb) {
      return
    }
    const rect = s.vTrack.getBoundingClientRect()
    const thumbTop = Number.parseFloat(s.vThumb.style.top) || 0
    if (e.clientY - rect.top < thumbTop) {
      t.scrollTop -= t.clientHeight
    }
    else {
      t.scrollTop += t.clientHeight
    }
    syncLayout(s)
  }
  s.vTrack.addEventListener('mousedown', onVTrack)
  s.cleanups.push(() => s.vTrack.removeEventListener('mousedown', onVTrack))

  const onHTrack = (e: MouseEvent): void => {
    if (e.target === s.hThumb) {
      return
    }
    const rect = s.hTrack.getBoundingClientRect()
    const thumbLeft = Number.parseFloat(s.hThumb.style.left) || 0
    if (e.clientX - rect.left < thumbLeft) {
      t.scrollLeft -= t.clientWidth
    }
    else {
      t.scrollLeft += t.clientWidth
    }
    syncLayout(s)
  }
  s.hTrack.addEventListener('mousedown', onHTrack)
  s.cleanups.push(() => s.hTrack.removeEventListener('mousedown', onHTrack))

  // Thumb drag
  addDragBehavior(s, s.vThumb, 'v')
  addDragBehavior(s, s.hThumb, 'h')
}

// ── Destroy / cleanup ──

function destroy(s: ScrollbarState): void {
  // Reverse everything created by `createScrollbar` in deterministic order.
  s.resizeObs?.disconnect()
  s.mutationObs?.disconnect()

  // Cancel any pending animation frames so syncLayout can't fire on torn-down state
  if (s.resizeRafId != null) {
    cancelAnimationFrame(s.resizeRafId)
    s.resizeRafId = null
  }
  if (s.mutationRafId != null) {
    cancelAnimationFrame(s.mutationRafId)
    s.mutationRafId = null
  }

  for (const fn of s.cleanups) {
    fn()
  }
  s.cleanups = []

  s.hideStyle.parentNode?.removeChild(s.hideStyle)
  s.vBar.parentNode?.removeChild(s.vBar)
  s.hBar.parentNode?.removeChild(s.hBar)
  s.corner.parentNode?.removeChild(s.corner)

  // Restore all mutated target styles to their pre-scrollbar values
  s.target.style.paddingRight = s.origPaddingRight
  s.target.style.paddingBottom = s.origPaddingBottom
  s.target.style.boxSizing = s.origBoxSizing
  if (s.origScrollbarWidth) {
    s.target.style.setProperty('scrollbar-width', s.origScrollbarWidth)
  }
  else {
    s.target.style.removeProperty('scrollbar-width')
  }
  if (s.origMsOverflowStyle) {
    s.target.style.setProperty('-ms-overflow-style', s.origMsOverflowStyle)
  }
  else {
    s.target.style.removeProperty('-ms-overflow-style')
  }

  // Restore parent position if it was changed by this scrollbar instance
  if (s.parent && s.origParentPosition !== null) {
    s.parent.style.position = s.origParentPosition
  }

  delete s.target.dataset['murasakiScrollbarId']
}

// ── Create scrollbar instance ──

function createScrollbar(target: HTMLElement): ScrollbarState {
  // One-time setup pipeline used by the hook effect.
  const state = buildScrollbarDom(target)
  syncLayout(state)
  bindEvents(state)
  return state
}

// ─── React Hook ──────────────────────────────────────────────────────────────

export interface UseScrollbarOptions {
  /** Disable the custom scrollbar. Defaults to `false`. */
  disabled?: boolean
}

/**
 * Attaches a Windows 98-style custom DOM scrollbar to a scrollable element.
 *
 * - Hides the native scrollbar via `scrollbar-width: none`
 * - Builds overlay scrollbar DOM (thumb, track, arrow buttons, corner)
 * - Auto-syncs on scroll, resize, and content mutation
 * - Supports arrow-click (with auto-repeat), track-click (page scroll),
 *   and thumb drag
 * - Reads theme colors from CSS custom properties
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ref = useRef<HTMLDivElement>(null)
 *   useScrollbar(ref)
 *   return <div ref={ref} style={{ overflow: 'auto', height: 200 }}>…</div>
 * }
 * ```
 */
export function useScrollbar(
  ref: React.RefObject<HTMLElement | null>,
  options: UseScrollbarOptions = {},
): void {
  const { disabled = false } = options
  const stateRef = useRef<ScrollbarState | null>(null)

  useEffect(() => {
    // Effect lifecycle:
    // - mount/enabled: create custom scrollbar around current target
    // - unmount/disable/deps change: destroy and restore native state
    if (disabled || !ref.current) {
      return
    }

    const state = createScrollbar(ref.current)
    stateRef.current = state

    return () => {
      destroy(state)
      stateRef.current = null
    }
  }, [ref, disabled])
}
