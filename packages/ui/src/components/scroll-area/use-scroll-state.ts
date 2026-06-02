import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

import { BAR_SIZE, REPEAT_MS, SCROLL_STEP } from './scroll-area-constants'

// ─── Re-export constants for consumers ───────────────────────────────────────

export { BAR_SIZE, BTN_HEIGHT } from './scroll-area-constants'

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

function areMetricsEqual(a: ScrollMetrics, b: ScrollMetrics): boolean {
  return a.hasVertical === b.hasVertical
    && a.hasHorizontal === b.hasHorizontal
    && a.vThumbTop === b.vThumbTop
    && a.vThumbHeight === b.vThumbHeight
    && a.hThumbLeft === b.hThumbLeft
    && a.hThumbWidth === b.hThumbWidth
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
  const metricsRef = useRef<ScrollMetrics>(EMPTY_METRICS)
  const listenersRef = useRef(new Set<() => void>())
  const rafIdRef = useRef<number | null>(null)
  const [scrollbarId] = useState(() => String(++_idCounter))

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const getMetricsSnapshot = useCallback(() => metricsRef.current, [])

  const metrics = useSyncExternalStore(subscribe, getMetricsSnapshot, getMetricsSnapshot)

  // ── Sync layout ──
  const syncLayout = useCallback(() => {
    const el = viewportRef.current
    if (!el)
      return

    const vTrackH = vTrackRef.current?.clientHeight ?? 0
    const hTrackW = hTrackRef.current?.clientWidth ?? 0
    const next = computeMetrics(el, vTrackH, hTrackW)
    const prev = metricsRef.current

    if (areMetricsEqual(prev, next))
      return

    metricsRef.current = next
    listenersRef.current.forEach((listener) => {
      listener()
    })
  }, [viewportRef])

  const requestLayoutSync = useCallback(() => {
    if (rafIdRef.current != null)
      return

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null
      syncLayout()
    })
  }, [syncLayout])

  // ── Hide native scrollbar + observe scroll/resize/mutation ──
  useEffect(() => {
    const el = viewportRef.current
    if (!el)
      return

    // Hide native scrollbar
    el.style.setProperty('scrollbar-width', 'none', 'important')
    el.style.setProperty('-ms-overflow-style', 'none')
    el.setAttribute('data-murasaki-scrollbar-id', scrollbarId)

    const hideStyle = document.createElement('style')
    hideStyle.textContent = `[data-murasaki-scrollbar-id="${scrollbarId}"]::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}`
    document.head.appendChild(hideStyle)

    // Scroll listener
    const onScroll = (): void => {
      syncLayout()
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    // ResizeObserver
    let resizeObs: ResizeObserver | null = null
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(requestLayoutSync)
      resizeObs.observe(el)
      if (el.parentNode instanceof HTMLElement) {
        resizeObs.observe(el.parentNode)
      }
      Array.from(el.children).forEach((child) => {
        resizeObs!.observe(child)
      })
    }

    // MutationObserver — content changes
    const mutObs = new MutationObserver(requestLayoutSync)
    mutObs.observe(el, { childList: true, subtree: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObs?.disconnect()
      mutObs.disconnect()
      if (rafIdRef.current != null)
        cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
      hideStyle.parentNode?.removeChild(hideStyle)
      el.style.removeProperty('scrollbar-width')
      el.style.removeProperty('-ms-overflow-style')
      el.removeAttribute('data-murasaki-scrollbar-id')
    }
  }, [viewportRef, scrollbarId, syncLayout, requestLayoutSync])

  useLayoutEffect(() => {
    syncLayout()
  }, [syncLayout])

  useLayoutEffect(() => {
    if (!metrics.hasVertical && !metrics.hasHorizontal)
      return

    syncLayout()
  }, [metrics.hasVertical, metrics.hasHorizontal, syncLayout])

  // ── Scroll actions ──
  const scrollStep = (axis: 'v' | 'h', direction: -1 | 1): void => {
    const el = viewportRef.current
    if (!el)
      return

    if (axis === 'v') {
      el.scrollTop += direction * SCROLL_STEP
    }
    else {
      el.scrollLeft += direction * SCROLL_STEP
    }

    syncLayout()
  }

  const scrollPage = (axis: 'v' | 'h', direction: -1 | 1): void => {
    const el = viewportRef.current
    if (!el)
      return

    if (axis === 'v') {
      el.scrollTop += direction * el.clientHeight
    }
    else {
      el.scrollLeft += direction * el.clientWidth
    }

    syncLayout()
  }

  // ── Thumb drag ──
  const startDrag = (axis: 'v' | 'h', startMousePos: number): void => {
    const el = viewportRef.current
    if (!el)
      return

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
      if (travel <= 0)
        return
      const scrollDelta = (delta / travel) * scrollSize

      if (axis === 'v')
        el.scrollTop = startScroll + scrollDelta
      else el.scrollLeft = startScroll + scrollDelta
      syncLayout()
    }

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Auto-repeat for arrow buttons ──
  const startRepeat = (action: () => void): (() => void) => {
    action()
    const id = setInterval(action, REPEAT_MS)
    return () => clearInterval(id)
  }

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
