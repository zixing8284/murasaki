import { useEffect, useId, useRef } from 'react'

import { BAR_SIZE, BTN_HEIGHT, REPEAT_MS, SCROLL_STEP, THUMB_BOX_SHADOW, TRACK_BG_COLOR, TRACK_BG_IMAGE, TRACK_BG_SIZE } from './scroll-area-constants'

// File flow (top to bottom):
// 1) Define reusable style constants and tiny DOM builders.
// 2) Build scrollbar DOM parts (bars, tracks, thumbs, arrow buttons, corner).
// 3) Keep custom scrollbar geometry synced with native scroll state.
// 4) Wire interactions (arrow hold-repeat, track page jump, thumb dragging).
// 5) Observe size/content changes and re-sync when layout changes.
// 6) Tear everything down on cleanup.
// 7) Expose all of this through `useScrollbar`.

// ─── Style helpers (CSS variable-based, auto-responds to theme changes) ──────

// THUMB_BOX_SHADOW imported from scroll-area-constants
const RAISED_SHADOW = THUMB_BOX_SHADOW

// 2×2 checker pattern — uses shared constants for theme-adaptive track background
const CHECKER_BG = `${TRACK_BG_IMAGE} 0 0 / ${TRACK_BG_SIZE}`

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function createDiv(styles: Partial<CSSStyleDeclaration>): HTMLDivElement {
  // Small helper to create and style elements in one place.
  const d = document.createElement('div')
  Object.assign(d.style, styles)
  return d
}

// Arrow glyph paths extracted from the provided button-*.svg reference files.
const BUTTON_ARROW_PATHS: Record<string, string> = {
  up: 'M8 6H7V7H6V8H5V9H4V10H11V9H10V8H9V7H8V6Z',
  down: 'M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z',
  left: 'M9 4H8V5H7V6H6V7H5V8H6V9H7V10H8V11H9V4Z',
  right: 'M7 4H6V11H7V10H8V9H9V8H10V7H9V6H8V5H7V4Z',
}

// Border paths shared by all four button SVGs (16×17).
// Layer order matches the original SVG files exactly.
const BORDER_PATHS = [
  // tl-outer highlight
  { d: 'M15 0H0V1V16H1V1H15V0Z', varNormal: '--button-light', varPressed: '--button-dk-shadow' },
  // tl-inner highlight
  { d: 'M2 1H1V15H2V2H14V1H2Z', varNormal: '--button-hilight', varPressed: '--button-shadow' },
  // br-outer dark
  { d: 'M16 17H15H0V16H15V0H16V17Z', varNormal: '--button-dk-shadow', varPressed: '--button-hilight' },
  // br-inner shadow
  { d: 'M15 1H14V15H1V16H14H15V1Z', varNormal: '--button-shadow', varPressed: '--button-light' },
] as const

function createButtonSvg(dir: string): SVGSVGElement {
  // Build the complete button SVG: 3D border + face + arrow glyph.
  // All colors reference CSS variables for automatic theme adaptation.
  const ns = 'http://www.w3.org/2000/svg'

  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '16')
  svg.setAttribute('height', '17')
  svg.setAttribute('viewBox', '0 0 16 17')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('shape-rendering', 'crispEdges')
  svg.style.cssText = 'display:block;pointer-events:none;'

  // 1) Border paths (4 layers)
  for (const bp of BORDER_PATHS) {
    const p = document.createElementNS(ns, 'path')
    p.setAttribute('fill-rule', 'evenodd')
    p.setAttribute('clip-rule', 'evenodd')
    p.setAttribute('d', bp.d)
    p.setAttribute('fill', `var(${bp.varNormal})`)
    p.setAttribute('data-murasaki-border', bp.varNormal)
    p.setAttribute('data-murasaki-var-normal', bp.varNormal)
    p.setAttribute('data-murasaki-var-pressed', bp.varPressed)
    svg.appendChild(p)
  }

  // 2) Button face
  const face = document.createElementNS(ns, 'rect')
  face.setAttribute('x', '2')
  face.setAttribute('y', '2')
  face.setAttribute('width', '12')
  face.setAttribute('height', '13')
  face.setAttribute('fill', 'var(--button-face)')
  svg.appendChild(face)

  // 3) Arrow glyph
  const arrow = document.createElementNS(ns, 'path')
  arrow.setAttribute('fill-rule', 'evenodd')
  arrow.setAttribute('clip-rule', 'evenodd')
  arrow.setAttribute('d', BUTTON_ARROW_PATHS[dir] ?? '')
  arrow.setAttribute('fill', 'var(--button-text)')
  arrow.setAttribute('data-murasaki-arrow', dir)
  svg.appendChild(arrow)

  return svg
}

// ─── Constants ───────────────────────────────────────────────────────────────

// BAR_SIZE, BTN_HEIGHT, SCROLL_STEP, REPEAT_MS imported from scroll-area-constants

// ─── Scrollbar instance (plain object + functions) ───────────────────────────

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
  // The SVG itself renders the full 3D border + face + arrow glyph.
  const btn = createDiv({
    position: 'relative',
    width: `${BAR_SIZE}px`,
    height: `${BTN_HEIGHT}px`,
    cursor: 'default',
    boxSizing: 'border-box',
    flexShrink: '0',
    overflow: 'hidden',
  })
  btn.appendChild(createButtonSvg(dir))

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

function buildScrollbarDom(target: HTMLElement, scrollbarId: string): ScrollbarState {
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

  const vDown = buildButton('down')
  vDown.style.position = 'absolute'
  vDown.style.bottom = '0'
  vDown.style.left = '0'

  const vTrack = createDiv({
    position: 'absolute',
    top: `${BTN_HEIGHT}px`,
    bottom: `${BTN_HEIGHT}px`,
    left: '0',
    right: '0',
    backgroundColor: TRACK_BG_COLOR,
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
    height: `${BTN_HEIGHT}px`,
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

  const hRight = buildButton('right')
  hRight.style.position = 'absolute'
  hRight.style.right = '0'
  hRight.style.top = '0'

  const hTrack = createDiv({
    position: 'absolute',
    left: `${BAR_SIZE}px`,
    right: `${BAR_SIZE}px`,
    top: '0',
    bottom: '0',
    backgroundColor: TRACK_BG_COLOR,
    background: CHECKER_BG,
    cursor: 'default',
  })
  hTrack.setAttribute('data-murasaki-track', 'h')

  const hThumb = createDiv({
    position: 'absolute',
    top: '0',
    height: `${BTN_HEIGHT}px`,
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
    height: `${BTN_HEIGHT}px`,
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
  // ID is sourced from React's useId() to stay SSR-safe and avoid module-level
  // mutable state.
  target.setAttribute('data-murasaki-scrollbar-id', scrollbarId)

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
  t.style.paddingBottom = hasH ? `${BTN_HEIGHT}px` : s.origPaddingBottom
  t.style.boxSizing = 'border-box'

  if (hasV) {
    // Vertical thumb size = viewport/content ratio, position = scroll progress.
    const vHeight = hasH ? t.clientHeight - BTN_HEIGHT : t.clientHeight
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
  // Pressed state swaps border highlight ↔ shadow fills and shifts the arrow glyph 1px.
  let intervalId: ReturnType<typeof setInterval> | null = null
  const borderPaths = btn.querySelectorAll<SVGPathElement>('[data-murasaki-border]')
  const arrow = btn.querySelector<SVGPathElement>('[data-murasaki-arrow]')

  const onDown = (e: MouseEvent): void => {
    e.preventDefault()

    // Swap border fills to pressed state
    borderPaths.forEach((p) => {
      const pressedVar = p.getAttribute('data-murasaki-var-pressed')
      if (pressedVar) {
        p.setAttribute('fill', `var(${pressedVar})`)
      }
    })

    // Shift arrow glyph 1px right + 1px down
    if (arrow) {
      arrow.setAttribute('transform', 'translate(1,1)')
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

    // Restore border fills to normal state
    borderPaths.forEach((p) => {
      const normalVar = p.getAttribute('data-murasaki-var-normal')
      if (normalVar) {
        p.setAttribute('fill', `var(${normalVar})`)
      }
    })

    // Restore arrow position
    if (arrow) {
      arrow.removeAttribute('transform')
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

  // Scroll → sync layout (passive: handler only reads state, never preventDefault)
  const onScroll = (): void => {
    syncLayout(s)
  }
  t.addEventListener('scroll', onScroll, { passive: true })
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
    if (s.mutationRafId != null)
      return
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

  s.target.removeAttribute('data-murasaki-scrollbar-id')
}

// ── Create scrollbar instance ──

function createScrollbar(target: HTMLElement, scrollbarId: string): ScrollbarState {
  // One-time setup pipeline used by the hook effect.
  const state = buildScrollbarDom(target, scrollbarId)
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
 *   return (
 *     <div ref={ref} style={{ height: 200, width: 300 }}>
 *       <p>Long content that overflows…</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useScrollbar(
  ref: React.RefObject<HTMLElement | null>,
  options: UseScrollbarOptions = {},
): void {
  const { disabled = false } = options
  const stateRef = useRef<ScrollbarState | null>(null)
  const reactId = useId()

  useEffect(() => {
    // Effect lifecycle:
    // - mount/enabled: create custom scrollbar around current target
    // - unmount/disable/deps change: destroy and restore native state
    if (disabled || !ref.current) {
      return
    }

    const state = createScrollbar(ref.current, reactId)
    stateRef.current = state

    return () => {
      destroy(state)
      stateRef.current = null
    }
  }, [ref, disabled, reactId])
}
