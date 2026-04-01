import { useEffect, useRef } from 'react'

// ─── Theme colors ────────────────────────────────────────────────────────────

interface ScrollbarColors {
  face: string
  highlight: string
  light: string
  shadow: string
  frame: string
}

function readThemeColors(): ScrollbarColors {
  const s = getComputedStyle(document.documentElement)
  const get = (v: string, fb: string): string => s.getPropertyValue(v).trim() || fb
  return {
    face: get('--button-face', '#d4d0c8'),
    highlight: get('--button-hilight', '#ffffff'),
    light: get('--button-light', '#dfdfdf'),
    shadow: get('--button-shadow', '#808080'),
    frame: get('--button-dk-shadow', '#0a0a0a'),
  }
}

// ─── Style helpers ───────────────────────────────────────────────────────────

function encodeSvgColor(c: string): string {
  return c.replace('#', '%23')
}

function raisedShadow(c: ScrollbarColors): string {
  return [
    `inset -1px -1px ${c.frame}`,
    `inset 1px 1px ${c.light}`,
    `inset -2px -2px ${c.shadow}`,
    `inset 2px 2px ${c.highlight}`,
  ].join(', ')
}

function sunkenShadow(c: ScrollbarColors): string {
  return [
    `inset -1px -1px ${c.highlight}`,
    `inset 1px 1px ${c.frame}`,
    `inset -2px -2px ${c.light}`,
    `inset 2px 2px ${c.shadow}`,
  ].join(', ')
}

function checkerBg(c: ScrollbarColors): string {
  const f = encodeSvgColor(c.face)
  return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='2' height='2'><rect fill='${f}' x='0' y='0' width='1' height='1'/><rect fill='${f}' x='1' y='1' width='1' height='1'/></svg>")`
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function createDiv(styles: Partial<CSSStyleDeclaration>): HTMLDivElement {
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

function createArrowSvg(dir: string, color: string): SVGSVGElement {
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
  path.setAttribute('fill', color)
  svg.appendChild(path)
  svg.setAttribute('data-murasaki-arrow', dir)
  return svg
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BAR_SIZE = 16
const SCROLL_STEP = 40
const REPEAT_MS = 50

// ─── Scrollbar instance (plain object + functions) ───────────────────────────

interface ScrollbarState {
  target: HTMLElement
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
  cleanups: Array<() => void>
}

// ── Build arrow button ──

function buildButton(c: ScrollbarColors, dir: string): HTMLDivElement {
  const btn = createDiv({
    position: 'relative',
    width: `${BAR_SIZE}px`,
    height: `${BAR_SIZE}px`,
    cursor: 'default',
    backgroundColor: c.face,
    boxSizing: 'border-box',
    flexShrink: '0',
  })
  btn.style.boxShadow = raisedShadow(c)
  btn.appendChild(createArrowSvg(dir, c.frame))

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
  const c = readThemeColors()

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

  const vUp = buildButton(c, 'up')

  const vDown = createDiv({
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: `${BAR_SIZE}px`,
    height: `${BAR_SIZE}px`,
    cursor: 'default',
    backgroundColor: c.face,
    boxSizing: 'border-box',
    flexShrink: '0',
  })
  vDown.style.boxShadow = raisedShadow(c)
  vDown.appendChild(createArrowSvg('down', c.frame))
  vDown.setAttribute('data-murasaki-btn', 'vdown')

  const vTrack = createDiv({
    position: 'absolute',
    top: `${BAR_SIZE}px`,
    bottom: `${BAR_SIZE}px`,
    left: '0',
    right: '0',
    backgroundColor: c.light,
    backgroundImage: checkerBg(c),
    backgroundRepeat: 'repeat',
    cursor: 'default',
  })
  vTrack.setAttribute('data-murasaki-track', 'v')

  const vThumb = createDiv({
    position: 'absolute',
    left: '0',
    width: `${BAR_SIZE}px`,
    minHeight: `${BAR_SIZE}px`,
    backgroundColor: c.face,
    boxShadow: raisedShadow(c),
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

  const hLeft = buildButton(c, 'left')
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
    backgroundColor: c.face,
    boxSizing: 'border-box',
  })
  hRight.style.boxShadow = raisedShadow(c)
  hRight.appendChild(createArrowSvg('right', c.frame))
  hRight.setAttribute('data-murasaki-btn', 'hright')

  const hTrack = createDiv({
    position: 'absolute',
    left: `${BAR_SIZE}px`,
    right: `${BAR_SIZE}px`,
    top: '0',
    bottom: '0',
    backgroundColor: c.light,
    backgroundImage: checkerBg(c),
    backgroundRepeat: 'repeat',
    cursor: 'default',
  })
  hTrack.setAttribute('data-murasaki-track', 'h')

  const hThumb = createDiv({
    position: 'absolute',
    top: '0',
    height: `${BAR_SIZE}px`,
    minWidth: `${BAR_SIZE}px`,
    backgroundColor: c.face,
    boxShadow: raisedShadow(c),
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
    backgroundColor: c.face,
    zIndex: '101',
    display: 'none',
  })
  corner.setAttribute('data-murasaki-corner', '')

  // Append to parent
  const parent = target.parentNode as HTMLElement
  if (parent && getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative'
  }
  parent.appendChild(vBar)
  parent.appendChild(hBar)
  parent.appendChild(corner)

  // Hide native scrollbar
  target.style.scrollbarWidth = 'none'
  ;(target.style as unknown as Record<string, string>).msOverflowStyle = 'none'
  target.style.setProperty('scrollbar-width', 'none', 'important')

  const hideStyle = document.createElement('style')
  hideStyle.textContent = ''
  document.head.appendChild(hideStyle)
  updateHideSelector(target, hideStyle)

  return {
    target,
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
    cleanups: [],
  }
}

// ── Hide native ::-webkit-scrollbar via injected <style> ──

function updateHideSelector(target: HTMLElement, styleEl: HTMLStyleElement): void {
  const tag = target.tagName?.toLowerCase() ?? ''
  let sel = ''

  if (tag === 'body' || tag === 'html') {
    sel = tag
  }
  else if (target.id) {
    sel = `#${target.id}`
  }
  else if (target.className && typeof target.className === 'string') {
    const first = target.className.trim().split(/\s+/)[0]
    if (first) {
      sel = `.${first}`
    }
  }

  if (sel) {
    styleEl.textContent
      = `${sel}::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}`
  }
}

// ── Sync scrollbar layout with scroll state ──

function syncLayout(s: ScrollbarState): void {
  const t = s.target
  const hasV = t.scrollHeight > t.clientHeight
  const hasH = t.scrollWidth > t.clientWidth

  s.vBar.style.display = hasV ? 'block' : 'none'
  s.hBar.style.display = hasH ? 'block' : 'none'
  s.corner.style.display = hasV && hasH ? 'block' : 'none'

  // Padding so content doesn't sit behind the scrollbar
  t.style.paddingRight = hasV ? `${BAR_SIZE}px` : '0'
  t.style.paddingBottom = hasH ? `${BAR_SIZE}px` : '0'
  t.style.boxSizing = 'border-box'

  if (hasV) {
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
  let intervalId: ReturnType<typeof setInterval> | null = null

  const onDown = (e: MouseEvent): void => {
    e.preventDefault()
    const c = readThemeColors()
    btn.style.boxShadow = sunkenShadow(c)

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

    const c = readThemeColors()
    btn.style.boxShadow = raisedShadow(c)

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
  const t = s.target

  // Scroll → sync layout
  const onScroll = (): void => {
    syncLayout(s)
  }
  t.addEventListener('scroll', onScroll)
  s.cleanups.push(() => t.removeEventListener('scroll', onScroll))

  // ResizeObserver
  if (window.ResizeObserver) {
    let rafId: number | null = null
    s.resizeObs = new ResizeObserver(() => {
      if (rafId == null) {
        rafId = requestAnimationFrame(() => {
          rafId = null
          syncLayout(s)
        })
      }
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
    syncLayout(s)
  })
  s.mutationObs.observe(t, { childList: true, subtree: true, characterData: true })

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
  s.resizeObs?.disconnect()
  s.mutationObs?.disconnect()

  for (const fn of s.cleanups) {
    fn()
  }
  s.cleanups = []

  s.hideStyle.parentNode?.removeChild(s.hideStyle)
  s.vBar.parentNode?.removeChild(s.vBar)
  s.hBar.parentNode?.removeChild(s.hBar)
  s.corner.parentNode?.removeChild(s.corner)

  s.target.style.paddingRight = ''
  s.target.style.paddingBottom = ''
  s.target.style.scrollbarWidth = ''
}

// ── Create scrollbar instance ──

function createScrollbar(target: HTMLElement): ScrollbarState {
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
