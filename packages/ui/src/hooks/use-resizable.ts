import { useCallback, useEffect, useRef, useState } from 'react'

import { applyLinear, getScreenFromLocalMatrix, scaleMagnitude } from '../lib/pointer-transform'

/** Minimum pointer movement (px) before a resize is considered started */
const RESIZE_THRESHOLD = 3

interface Size {
  width: number
  height: number
}

export interface UseResizableOptions {
  /**
   * Container element to constrain resize boundaries.
   * - If null/undefined: constrain to viewport
   * - If an element: constrain to that element's bounds
   */
  container?: HTMLElement | null
  /** Enable/disable resizing */
  resizable?: boolean
  /** Minimum width in px (default: 200) */
  minWidth?: number
  /** Minimum height in px (default: 120) */
  minHeight?: number
  /** Maximum width in px (default: unlimited) */
  maxWidth?: number
  /** Maximum height in px (default: unlimited) */
  maxHeight?: number
  /** Called when resize starts/stops — prefer over Effect-based onResizeChange in consuming components */
  onResizeChange?: (resizing: boolean) => void
}

/**
 * Generic hook to enable resize behavior on any element.
 * Resizes the target element by dragging a handle element (typically bottom-right grip).
 *
 * Constrains dimensions within the specified min/max and container/viewport boundaries.
 *
 * @param options - Configuration options
 * @returns Object containing ref callbacks and resize state
 *
 * @example
 * ```tsx
 * const { setTargetRef, setResizeRef, resizing } = useResizable<HTMLDivElement, HTMLDivElement>({
 *   resizable: true,
 *   minWidth: 200,
 *   minHeight: 100,
 * });
 * return (
 *   <div ref={setTargetRef} style={{ width: 400, height: 300 }}>
 *     <p>Content</p>
 *     <div ref={setResizeRef} className="cursor-nwse-resize">⊿</div>
 *   </div>
 * );
 * ```
 */
export function useResizable<
  TTarget extends HTMLElement = HTMLElement,
  THandle extends HTMLElement = HTMLElement,
>(options: UseResizableOptions = {}): {
  resizing: boolean
  setResizeRef: (el: THandle | null) => void
  setTargetRef: (el: TTarget | null) => void
  sizeRef: React.RefObject<Size>
  resetSize: () => void
} {
  const {
    container = null,
    resizable = true,
    minWidth = 200,
    minHeight = 120,
    maxWidth,
    maxHeight,
    onResizeChange,
  } = options

  const targetRef = useRef<TTarget | null>(null)
  // Use useState so changes trigger useEffect re-run (same pattern as useDraggable)
  const [handleElement, setHandleElement] = useState<THandle | null>(null)
  const [resizing, setResizing] = useState(false)
  const sizeRef = useRef<Size>({ width: 0, height: 0 })

  // Store cleanup function for document-level event listeners
  const cleanupRef = useRef<(() => void) | null>(null)

  // Identifier of the touch that currently owns a resize, so extra fingers and
  // stray touches are ignored for the duration of the gesture.
  const activeTouchIdRef = useRef<number | null>(null)

  // Latest-callback ref — same pattern as useDraggable. Keeps onResizeChange
  // current without making onPointerdown depend on it, so re-renders mid-resize
  // never orphan live document-level pointermove/pointerup listeners.
  const onResizeChangeRef = useRef(onResizeChange)
  useEffect(() => {
    onResizeChangeRef.current = onResizeChange
  }, [onResizeChange])

  const setTargetRef = useCallback((el: TTarget | null) => {
    targetRef.current = el
    // Re-apply stored size when element is re-mounted (e.g., after minimize/restore)
    if (el) {
      const { width, height } = sizeRef.current
      if (width > 0 && height > 0) {
        el.style.width = `${width.toString()}px`
        el.style.height = `${height.toString()}px`
      }
    }
  }, [])

  const setResizeRef = useCallback((el: THandle | null) => {
    setHandleElement(el)
  }, [])

  const resetSize = (): void => {
    sizeRef.current = { width: 0, height: 0 }
    if (targetRef.current) {
      targetRef.current.style.width = ''
      targetRef.current.style.height = ''
    }
  }

  // Shared resize core for both input paths. Computes the size constraints once
  // at gesture start and returns closures to apply movement (past a small start
  // threshold) and to finish. Same math for mouse, pen and touch, including under
  // a scaled/rotated ancestor.
  const beginResizeGesture = useCallback(
    (downX: number, downY: number): { move: (clientX: number, clientY: number) => void, finish: () => void } | null => {
      const target = targetRef.current
      if (!target)
        return null

      // Map pointer deltas from screen pixels into the target's local size space
      // so resizing tracks the pointer under a scaled/rotated ancestor. Identity
      // (scale 1, no rotation) reduces this to the plain screen-pixel behavior.
      const screenFromLocal = getScreenFromLocalMatrix(target)
      const localFromScreen = screenFromLocal.inverse()
      const scale = scaleMagnitude(screenFromLocal)

      const targetRect = target.getBoundingClientRect()
      const initWidth = target.offsetWidth
      const initHeight = target.offsetHeight

      // Calculate maximum allowed dimensions (in local px) based on container/viewport
      let maxAllowedWidth: number
      let maxAllowedHeight: number

      if (container) {
        const containerRect = container.getBoundingClientRect()
        maxAllowedWidth = (containerRect.right - targetRect.left) / scale
        maxAllowedHeight = (containerRect.bottom - targetRect.top) / scale
      }
      else {
        const { clientWidth, clientHeight } = document.documentElement
        maxAllowedWidth = (clientWidth - targetRect.left) / scale
        maxAllowedHeight = (clientHeight - targetRect.top) / scale
      }

      // Apply user-specified max constraints
      if (maxWidth != null) {
        maxAllowedWidth = Math.min(maxAllowedWidth, maxWidth)
      }
      if (maxHeight != null) {
        maxAllowedHeight = Math.min(maxAllowedHeight, maxHeight)
      }

      // Ensure minimum constraints always win over container limits.
      // If the container is smaller than minWidth/minHeight the element is
      // allowed to overflow rather than being forced below its minimum size.
      if (maxAllowedWidth < minWidth)
        maxAllowedWidth = minWidth
      if (maxAllowedHeight < minHeight)
        maxAllowedHeight = minHeight

      let hasResizeStarted = false

      const move = (clientX: number, clientY: number): void => {
        if (!hasResizeStarted) {
          if (Math.abs(clientX - downX) < RESIZE_THRESHOLD && Math.abs(clientY - downY) < RESIZE_THRESHOLD)
            return
          hasResizeStarted = true
          setResizing(true)
          onResizeChangeRef.current?.(true)
        }

        // Convert the screen-space pointer delta into local size space.
        const delta = applyLinear(localFromScreen, clientX - downX, clientY - downY)
        const newWidth = Math.min(Math.max(initWidth + delta.x, minWidth), maxAllowedWidth)
        const newHeight = Math.min(Math.max(initHeight + delta.y, minHeight), maxAllowedHeight)

        sizeRef.current = { width: newWidth, height: newHeight }
        target.style.width = `${newWidth.toString()}px`
        target.style.height = `${newHeight.toString()}px`
      }

      const finish = (): void => {
        if (hasResizeStarted) {
          setResizing(false)
          onResizeChangeRef.current?.(false)
        }
      }

      return { move, finish }
    },
    [container, minWidth, minHeight, maxWidth, maxHeight],
  )

  // Mouse/pen path. Touch is handled by the native touchstart listener below.
  const onPointerdown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === 'touch')
        return
      // Only start resizing with the primary button (left mouse button)
      if (e.button !== 0)
        return

      const gesture = beginResizeGesture(e.clientX, e.clientY)
      if (!gesture)
        return

      // Prevent text selection during resize
      e.preventDefault()
      e.stopPropagation()

      const pointerId = e.pointerId
      // Capture the pointer to the grip so pointermove keeps flowing over other
      // windows' iframes and off the small handle — smooth, unstuck resizing.
      const gripEl = e.currentTarget as HTMLElement
      try {
        gripEl.setPointerCapture(pointerId)
      }
      catch {}

      // Save original cursor and set resize cursor on body to prevent flicker
      const originalCursor = document.body.style.cursor
      document.body.style.cursor = 'var(--cursor-nwse-resize, nwse-resize)'

      const onPointermove = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId)
          return
        gesture.move(e.clientX, e.clientY)
      }

      const onPointerup = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId)
          return
        gesture.finish()
        document.body.style.cursor = originalCursor
        document.removeEventListener('pointermove', onPointermove)
        document.removeEventListener('pointerup', onPointerup)
        document.removeEventListener('pointercancel', onPointerup)
        try {
          gripEl.releasePointerCapture(pointerId)
        }
        catch {}
        cleanupRef.current = null
      }

      // Store cleanup for use in useEffect cleanup
      cleanupRef.current = () => {
        document.body.style.cursor = originalCursor
        document.removeEventListener('pointermove', onPointermove)
        document.removeEventListener('pointerup', onPointerup)
        document.removeEventListener('pointercancel', onPointerup)
      }

      document.addEventListener('pointermove', onPointermove)
      document.addEventListener('pointerup', onPointerup)
      document.addEventListener('pointercancel', onPointerup)
    },
    [beginResizeGesture],
  )

  // Native touch path — a native touchstart targets the element under the touch
  // coordinates, immune to Chrome's touch-adjustment target-snapping, so touches
  // that clip the grip's edges still start a resize. Touch events implicitly
  // capture to the start target, keeping moves flowing across iframes.
  const onTouchstart = useCallback(
    (e: TouchEvent) => {
      if (activeTouchIdRef.current !== null)
        return
      const touch = e.changedTouches[0]
      if (!touch)
        return

      const gesture = beginResizeGesture(touch.clientX, touch.clientY)
      if (!gesture)
        return

      const touchId = touch.identifier
      activeTouchIdRef.current = touchId

      const findTouch = (list: TouchList): null | Touch => {
        for (let i = 0; i < list.length; i++) {
          const t = list[i]
          if (t && t.identifier === touchId)
            return t
        }
        return null
      }

      const onTouchmove = (ev: TouchEvent): void => {
        const t = findTouch(ev.changedTouches)
        if (!t)
          return
        ev.preventDefault()
        gesture.move(t.clientX, t.clientY)
      }

      const onTouchend = (ev: TouchEvent): void => {
        if (!findTouch(ev.changedTouches))
          return
        gesture.finish()
        document.removeEventListener('touchmove', onTouchmove)
        document.removeEventListener('touchend', onTouchend)
        document.removeEventListener('touchcancel', onTouchend)
        activeTouchIdRef.current = null
        cleanupRef.current = null
      }

      cleanupRef.current = () => {
        document.removeEventListener('touchmove', onTouchmove)
        document.removeEventListener('touchend', onTouchend)
        document.removeEventListener('touchcancel', onTouchend)
        activeTouchIdRef.current = null
      }

      document.addEventListener('touchmove', onTouchmove, { passive: false })
      document.addEventListener('touchend', onTouchend)
      document.addEventListener('touchcancel', onTouchend)
    },
    [beginResizeGesture],
  )

  useEffect(() => {
    if (resizable && handleElement) {
      handleElement.addEventListener('pointerdown', onPointerdown)
      handleElement.addEventListener('touchstart', onTouchstart, { passive: true })
      return () => {
        handleElement.removeEventListener('pointerdown', onPointerdown)
        handleElement.removeEventListener('touchstart', onTouchstart)
        // Clean up document-level listeners if component unmounts during resize
        cleanupRef.current?.()
        cleanupRef.current = null
      }
    }
    return undefined
  }, [resizable, handleElement, onPointerdown, onTouchstart])

  return {
    /** Whether the element is currently being resized */
    resizing,
    /** Ref callback to attach to the resize handle element */
    setResizeRef,
    /** Ref callback to attach to the target element that will be resized */
    setTargetRef,
    /** Internal size state ref */
    sizeRef,
    /** Reset size to initial state (remove inline width/height) */
    resetSize,
  }
}
