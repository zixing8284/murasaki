import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────

export const BAR_SIZE = 16
export const BTN_HEIGHT = 17
const SCROLL_STEP = 40
const REPEAT_MS = 50

// ─── Scroll metrics (updated imperatively for performance) ───────────────────

export interface ScrollMetrics {
  hasVertical: boolean
  hasHorizontal: boolean
  vThumbTop: number
  vThumbHeight: number
  hThumbLeft: number
  hThumbWidth: number
}

const EMPTY_METRICS: ScrollMetrics = {
  hasVertical: false,
  hasHorizontal: false,
  vThumbTop: 0,
  vThumbHeight: 0,
  hThumbLeft: 0,
  hThumbWidth: 0,
}

// ─── Compute layout from native scroll metrics ──────────────────────────────

function computeMetrics(
  el: HTMLElement,
  vTrackH: number,
  hTrackW: number,
): ScrollMetrics {
  const hasV = el.scrollHeight > el.clientHeight
  const hasH = el.scrollWidth > el.clientWidth

  let vThumbTop = 0
  let vThumbHeight = 0
  if (hasV && vTrackH > 0) {
    const ratio = el.clientHeight / el.scrollHeight
    vThumbHeight = Math.max(BAR_SIZE, vTrackH * ratio)
    const travel = vTrackH - vThumbHeight
    const maxScroll = el.scrollHeight - el.clientHeight
    vThumbTop = maxScroll > 0 ? (el.scrollTop / maxScroll) * travel : 0
  }

  let hThumbLeft = 0
  let hThumbWidth = 0
  if (hasH && hTrackW > 0) {
    const ratio = el.clientWidth / el.scrollWidth
    hThumbWidth = Math.max(BAR_SIZE, hTrackW * ratio)
    const travel = hTrackW - hThumbWidth
    const maxScroll = el.scrollWidth - el.clientWidth
    hThumbLeft = maxScroll > 0 ? (el.scrollLeft / maxScroll) * travel : 0
  }

  return { hasVertical: hasV, hasHorizontal: hasH, vThumbTop, vThumbHeight, hThumbLeft, hThumbWidth }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseScrollStateResult {
  /** Current scroll metrics (triggers re-render only for visibility changes) */
  metrics: ScrollMetrics
  /** Ref for the vertical track element — needed for metric computation */
  vTrackRef: React.RefObject<HTMLDivElement | null>
  /** Ref for the horizontal track element — needed for metric computation */
  hTrackRef: React.RefObject<HTMLDivElement | null>
  /** Imperative sync — call from scroll/resize handlers. Updates metrics ref + triggers re-render if visibility changed. */
  syncLayout: () => void
  /** Scroll the viewport by arrow step */
  scrollStep: (axis: 'v' | 'h', direction: -1 | 1) => void
  /** Scroll the viewport by page */
  scrollPage: (axis: 'v' | 'h', direction: -1 | 1) => void
  /** Begin thumb drag. Returns cleanup. */
  startDrag: (axis: 'v' | 'h', startMousePos: number) => void
  /** Auto-repeat helper for arrow buttons: calls action on interval while held. */
  startRepeat: (action: () => void) => () => void
  /** Hide native scrollbar style element ID */
  scrollbarId: string
}

// Module-level counter for unique per-element scrollbar IDs.
let _idCounter = 0

export function useScrollState(
  viewportRef: React.RefObject<HTMLDivElement | null>,
): UseScrollStateResult {
  const vTrackRef = useRef<HTMLDivElement>(null)
  const hTrackRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState<ScrollMetrics>(EMPTY_METRICS)
  const metricsRef = useRef<ScrollMetrics>(EMPTY_METRICS)
  const rafIdRef = useRef<number | null>(null)
  const [scrollbarId] = useState(() => String(++_idCounter))

  // ── Sync layout ──
  const syncLayout = useCallback(() => {
    const el = viewportRef.current
    if (!el) return

    const vTrackH = vTrackRef.current?.clientHeight ?? 0
    const hTrackW = hTrackRef.current?.clientWidth ?? 0
    const next = computeMetrics(el, vTrackH, hTrackW)

    // Always update the ref (used by imperative drag/thumb positioning)
    metricsRef.current = next

    // Only trigger React re-render when visibility or thumb geometry changed.
    // Comparing individual fields avoids object identity churn.
    setMetrics((prev) => {
      if (
        prev.hasVertical === next.hasVertical
        && prev.hasHorizontal === next.hasHorizontal
        && prev.vThumbTop === next.vThumbTop
        && prev.vThumbHeight === next.vThumbHeight
        && prev.hThumbLeft === next.hThumbLeft
        && prev.hThumbWidth === next.hThumbWidth
      ) {
        return prev
      }
      return next
    })
  }, [viewportRef])

  // ── Hide native scrollbar + observe scroll/resize/mutation ──
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    // Hide native scrollbar
    el.style.setProperty('scrollbar-width', 'none', 'important')
    el.style.setProperty('-ms-overflow-style', 'none')
    el.setAttribute('data-murasaki-scrollbar-id', scrollbarId)

    const hideStyle = document.createElement('style')
    hideStyle.textContent = `[data-murasaki-scrollbar-id="${scrollbarId}"]::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}`
    document.head.appendChild(hideStyle)

    // Initial sync
    syncLayout()

    // Scroll listener
    const onScroll = (): void => { syncLayout() }
    el.addEventListener('scroll', onScroll, { passive: true })

    // ResizeObserver
    let resizeObs: ResizeObserver | null = null
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(() => {
        if (rafIdRef.current != null) return
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null
          syncLayout()
        })
      })
      resizeObs.observe(el)
      if (el.parentNode instanceof HTMLElement) {
        resizeObs.observe(el.parentNode)
      }
      Array.from(el.children).forEach((child) => {
        resizeObs!.observe(child)
      })
    }

    // MutationObserver — content changes
    let mutRafId: number | null = null
    const mutObs = new MutationObserver(() => {
      if (mutRafId != null) return
      mutRafId = requestAnimationFrame(() => {
        mutRafId = null
        syncLayout()
      })
    })
    mutObs.observe(el, { childList: true, subtree: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObs?.disconnect()
      mutObs.disconnect()
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current)
      if (mutRafId != null) cancelAnimationFrame(mutRafId)
      hideStyle.parentNode?.removeChild(hideStyle)
      el.style.removeProperty('scrollbar-width')
      el.style.removeProperty('-ms-overflow-style')
      el.removeAttribute('data-murasaki-scrollbar-id')
    }
  }, [viewportRef, scrollbarId, syncLayout])

  // ── Scroll actions ──
  const scrollStep = useCallback((axis: 'v' | 'h', direction: -1 | 1) => {
    const el = viewportRef.current
    if (!el) return
    if (axis === 'v') el.scrollTop += direction * SCROLL_STEP
    else el.scrollLeft += direction * SCROLL_STEP
    syncLayout()
  }, [viewportRef, syncLayout])

  const scrollPage = useCallback((axis: 'v' | 'h', direction: -1 | 1) => {
    const el = viewportRef.current
    if (!el) return
    if (axis === 'v') el.scrollTop += direction * el.clientHeight
    else el.scrollLeft += direction * el.clientWidth
    syncLayout()
  }, [viewportRef, syncLayout])

  // ── Thumb drag ──
  const startDrag = useCallback((axis: 'v' | 'h', startMousePos: number) => {
    const el = viewportRef.current
    if (!el) return

    const startScroll = axis === 'v' ? el.scrollTop : el.scrollLeft

    const onMove = (ev: MouseEvent): void => {
      const delta = (axis === 'v' ? ev.clientY : ev.clientX) - startMousePos
      const trackSize = axis === 'v'
        ? (vTrackRef.current?.clientHeight ?? 0)
        : (hTrackRef.current?.clientWidth ?? 0)
      const thumbSize = axis === 'v'
        ? metricsRef.current.vThumbHeight
        : metricsRef.current.hThumbWidth
      const scrollSize = axis === 'v'
        ? el.scrollHeight - el.clientHeight
        : el.scrollWidth - el.clientWidth
      const travel = trackSize - thumbSize
      if (travel <= 0) return
      const scrollDelta = (delta / travel) * scrollSize

      if (axis === 'v') el.scrollTop = startScroll + scrollDelta
      else el.scrollLeft = startScroll + scrollDelta
      syncLayout()
    }

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [viewportRef, syncLayout])

  // ── Auto-repeat for arrow buttons ──
  const startRepeat = useCallback((action: () => void): (() => void) => {
    action()
    const id = setInterval(action, REPEAT_MS)
    return () => clearInterval(id)
  }, [])

  // ── Sync on first layout (after DOM is ready) ──
  useLayoutEffect(() => {
    syncLayout()
  })

  return {
    metrics,
    vTrackRef,
    hTrackRef,
    syncLayout,
    scrollStep,
    scrollPage,
    startDrag,
    startRepeat,
    scrollbarId,
  }
}
