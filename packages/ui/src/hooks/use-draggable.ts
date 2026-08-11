import { useCallback, useEffect, useRef, useState } from 'react'

import { applyLinear, getScreenFromLocalMatrix } from '../lib/pointer-transform'

/** Minimum pointer movement (px) before a drag is considered started */
const DRAG_THRESHOLD = 3

interface Transform {
  offsetX: number
  offsetY: number
}

export interface UseDraggableOptions {
  /**
   * Container element to constrain dragging boundaries.
   * - If null/undefined: constrain to viewport
   * - If an element: constrain to that element's bounds
   */
  container?: HTMLElement | null
  /** Enable/disable dragging */
  draggable?: boolean
  /** Called when drag starts/stops — prefer over Effect-based onDragChange in consuming components */
  onDragChange?: (dragging: boolean) => void
  /**
   * When true, automatically re-clamp the target's position when the container
   * (or viewport) resizes, ensuring the top edge of the target stays within bounds
   * (i.e., the titlebar remains reachable). Only adjusts position, never size.
   */
  clampPositionOnResize?: boolean
}

/**
 * Generic hook to enable drag behavior on any element.
 * Moves the target element via CSS `transform: translate()` when the user
 * drags the handle element with the mouse.
 *
 * Constrains movement within the specified container boundaries or viewport.
 *
 * @param options - Configuration options
 * @returns Object containing ref callbacks to attach and drag state
 *
 * @example
 * ```tsx
 * const { setTargetRef, setDragRef, dragging } = useDraggable<HTMLDivElement, HTMLDivElement>({ draggable: true });
 * return (
 *   <div ref={setTargetRef}>
 *     <div ref={setDragRef} className="cursor-move">Drag Handle</div>
 *     <p>Content</p>
 *   </div>
 * );
 * ```
 */
export function useDraggable<
  TTarget extends HTMLElement = HTMLElement,
  TDrag extends HTMLElement = HTMLElement,
>(options: UseDraggableOptions = {}): {
  dragging: boolean
  setDragRef: (el: TDrag | null) => void
  setHandleRef: (el: HTMLElement | null) => void
  setTargetRef: (el: TTarget | null) => void
  transformRef: React.RefObject<Transform>
  resetPosition: () => void
} {
  const { container = null, draggable = true, onDragChange, clampPositionOnResize = false } = options

  const targetRef = useRef<null | TTarget>(null)
  // Use useState instead of useRef so that changes trigger useEffect re-run
  const [dragElement, setDragElement] = useState<TDrag | null>(null)
  const [dragging, setDragging] = useState(false)
  const transformRef = useRef<Transform>({ offsetX: 0, offsetY: 0 })

  // Store cleanup function for document-level event listeners
  const cleanupRef = useRef<(() => void) | null>(null)

  // Latest-callback ref — keeps onDragChange current without adding it to
  // onPointerdown's useCallback deps. If onDragChange were a dep, any re-render
  // that creates a new function reference (e.g. iframe load completing mid-drag)
  // would recreate onPointerdown, trigger the useEffect cleanup, and remove the
  // live document-level pointermove/pointerup listeners, orphaning the drag.
  const onDragChangeRef = useRef(onDragChange)
  useEffect(() => {
    onDragChangeRef.current = onDragChange
  }, [onDragChange])

  const setTargetRef = useCallback((el: TTarget | null) => {
    targetRef.current = el
    // Re-apply stored transform when element is re-mounted (e.g., after minimize/restore)
    if (el) {
      const { offsetX, offsetY } = transformRef.current
      if (offsetX !== 0 || offsetY !== 0) {
        el.style.transform = `translate(${offsetX.toString()}px, ${offsetY.toString()}px)`
      }
    }
  }, [])

  const setDragRef = useCallback((el: TDrag | null) => {
    setDragElement(el)
  }, [])

  // Identifier of the touch that currently owns a drag, so extra fingers and
  // stray touches are ignored for the duration of the gesture.
  const activeTouchIdRef = useRef<number | null>(null)

  // Optional drag-start region (typically the title bar). The drag listener is
  // attached to a LARGER element (the window frame) so it fires no matter which
  // element the browser's touch-adjustment picks as the event target: near the
  // title bar's bottom edge Chrome snaps the target onto the menubar/content
  // sibling below, whose events bubble through the frame but not the title bar.
  // We instead decide by the pointer/touch COORDINATES (which are never adjusted)
  // whether the press landed on the title bar.
  const handleRegionRef = useRef<HTMLElement | null>(null)
  const setHandleRef = useCallback((el: HTMLElement | null) => {
    handleRegionRef.current = el
  }, [])

  // Whether a press at these client coordinates should begin a drag: inside the
  // handle region (if set) and not on an interactive control. Uses a point
  // hit-test (elementFromPoint), which is coordinate-accurate and immune to
  // touch-adjustment target snapping.
  const canStartDragAt = useCallback((clientX: number, clientY: number): boolean => {
    const handleRegion = handleRegionRef.current
    if (handleRegion) {
      const hr = handleRegion.getBoundingClientRect()
      if (clientX < hr.left || clientX > hr.right || clientY < hr.top || clientY > hr.bottom)
        return false
    }
    const hit = document.elementFromPoint(clientX, clientY) as HTMLElement | null
    if (hit?.closest('button, a, input, select, textarea, [role="button"]'))
      return false
    return true
  }, [])

  const resetPosition = (): void => {
    transformRef.current = { offsetX: 0, offsetY: 0 }
    if (targetRef.current) {
      targetRef.current.style.transform = ''
    }
  }

  // Shared gesture core for both input paths. Computes the boundary constraints
  // once at gesture start and returns closures to apply movement (past a small
  // start threshold) and to finish. Keeping the math in one place means mouse,
  // pen and touch all move identically, including under a scaled/rotated ancestor.
  const beginGesture = useCallback(
    (downX: number, downY: number): { move: (clientX: number, clientY: number) => void, finish: () => void } | null => {
      const target = targetRef.current
      if (!target)
        return null

      // Map between the target's local translate space and screen pixels so the
      // window still tracks the pointer when an ancestor (e.g. a scaled/rotated
      // desktop canvas) applies a CSS transform. Identity when nothing is scaled,
      // so all clamping math below stays in screen space exactly as before.
      const screenFromLocal = getScreenFromLocalMatrix(target)
      const localFromScreen = screenFromLocal.inverse()
      const screenOffset = applyLinear(screenFromLocal, transformRef.current.offsetX, transformRef.current.offsetY)
      const offsetX = screenOffset.x
      const offsetY = screenOffset.y

      const targetRect = target.getBoundingClientRect()
      const {
        height: targetHeight,
        left: targetLeft,
        top: targetTop,
        width: targetWidth,
      } = targetRect

      // Calculate boundary constraints
      let maxLeft: number, maxTop: number, minLeft: number, minTop: number

      if (container) {
        // Constrain to container element bounds
        const containerRect = container.getBoundingClientRect()
        minLeft = containerRect.left - targetLeft + offsetX
        maxLeft = containerRect.right - targetLeft - targetWidth + offsetX
        minTop = containerRect.top - targetTop + offsetY
        maxTop = containerRect.bottom - targetTop - targetHeight + offsetY
      }
      else {
        // Constrain to viewport
        const { clientHeight, clientWidth } = document.documentElement
        minLeft = -targetLeft + offsetX
        minTop = -targetTop + offsetY
        maxLeft = clientWidth - targetLeft - targetWidth + offsetX
        maxTop = clientHeight - targetTop - targetHeight + offsetY
      }

      // When the element is larger than the container/viewport, the top-left
      // boundary always takes priority so the titlebar remains reachable.
      // The bottom/right of the element is allowed to overflow in that case.
      if (maxLeft < minLeft)
        maxLeft = minLeft
      if (maxTop < minTop)
        maxTop = minTop

      let hasDragStarted = false

      const move = (clientX: number, clientY: number): void => {
        if (!hasDragStarted) {
          if (Math.abs(clientX - downX) < DRAG_THRESHOLD && Math.abs(clientY - downY) < DRAG_THRESHOLD)
            return
          hasDragStarted = true
          // Promote the target to its own compositor layer for the duration of
          // the drag. Without this, Chrome repaints the whole window subtree on
          // every pointer move (a bare 2D translate does not trigger layer
          // promotion), which gets noticeably laggy as window content grows.
          target.style.willChange = 'transform'
          setDragging(true)
          onDragChangeRef.current?.(true)
        }

        // Clamp to boundaries
        const moveX = Math.min(Math.max(offsetX + clientX - downX, minLeft), maxLeft)
        const moveY = Math.min(Math.max(offsetY + clientY - downY, minTop), maxTop)

        // moveX/moveY are screen-space; convert back to the local translate
        // space before applying so the movement matches the pointer under scale/rotation.
        const local = applyLinear(localFromScreen, moveX, moveY)
        transformRef.current = { offsetX: local.x, offsetY: local.y }
        target.style.transform = `translate(${local.x.toString()}px, ${local.y.toString()}px)`
      }

      const finish = (): void => {
        if (hasDragStarted) {
          // Release the compositor-layer hint so the browser can reclaim the layer.
          target.style.willChange = ''
          setDragging(false)
          onDragChangeRef.current?.(false)
        }
      }

      return { move, finish }
    },
    [container],
  )

  // Mouse/pen path. Touch is handled by the native touchstart listener below.
  // Both listeners live on the window frame and decide by coordinates (see
  // canStartDragAt), so a press near the title bar's bottom edge still starts a
  // drag even when touch-adjustment snaps the event target onto the sibling below.
  const onPointerdown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === 'touch')
        return
      // Only start dragging with the primary button (left mouse button)
      if (e.button !== 0)
        return

      // Begin only when the press lands on the handle region (title bar) and not
      // on an interactive control — decided by coordinates, not the event target.
      if (!canStartDragAt(e.clientX, e.clientY))
        return

      const gesture = beginGesture(e.clientX, e.clientY)
      if (!gesture)
        return

      // Prevent text selection during drag
      e.preventDefault()

      const pointerId = e.pointerId
      // Capture the pointer to the frame so the stream keeps flowing over another
      // window's iframe and off the frame — smooth, unstuck dragging.
      const captureEl = e.currentTarget as HTMLElement
      try {
        captureEl.setPointerCapture(pointerId)
      }
      catch {}

      const onPointermove = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId)
          return
        gesture.move(e.clientX, e.clientY)
      }

      const onPointerup = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId)
          return
        gesture.finish()
        document.removeEventListener('pointermove', onPointermove)
        document.removeEventListener('pointerup', onPointerup)
        document.removeEventListener('pointercancel', onPointerup)
        try {
          captureEl.releasePointerCapture(pointerId)
        }
        catch {}
        cleanupRef.current = null
      }

      // Store cleanup function for use in useEffect cleanup
      cleanupRef.current = () => {
        document.removeEventListener('pointermove', onPointermove)
        document.removeEventListener('pointerup', onPointerup)
        document.removeEventListener('pointercancel', onPointerup)
      }

      document.addEventListener('pointermove', onPointermove)
      document.addEventListener('pointerup', onPointerup)
      document.addEventListener('pointercancel', onPointerup)
    },
    [beginGesture, canStartDragAt],
  )

  // Native touch path. The listener lives on the frame, so it fires even when
  // touch-adjustment snaps the event target onto the menubar/content sibling
  // below the title bar; the drag is gated on the touch COORDINATES instead of
  // the target. Touch events implicitly capture to the start target, so moves
  // keep flowing across other windows' iframes without needing pointer capture.
  const onTouchstart = useCallback(
    (e: TouchEvent) => {
      // One finger owns the drag; ignore extra fingers mid-gesture.
      if (activeTouchIdRef.current !== null)
        return
      const touch = e.changedTouches[0]
      if (!touch)
        return

      // Decide by coordinates (immune to touch-adjustment), not the event target.
      if (!canStartDragAt(touch.clientX, touch.clientY))
        return

      const gesture = beginGesture(touch.clientX, touch.clientY)
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
        // Belt-and-suspenders against scroll; the handle also sets touch-action:none.
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

      // Store cleanup for use in useEffect cleanup
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
    [beginGesture, canStartDragAt],
  )

  useEffect(() => {
    if (draggable && dragElement) {
      dragElement.addEventListener('pointerdown', onPointerdown)
      // Passive: the touchstart itself is never prevented (so taps/double-taps
      // still synthesize clicks); scrolling is blocked via touch-action:none on
      // the handle, and the document-level touchmove below is non-passive.
      dragElement.addEventListener('touchstart', onTouchstart, { passive: true })
      return () => {
        dragElement.removeEventListener('pointerdown', onPointerdown)
        dragElement.removeEventListener('touchstart', onTouchstart)
        // Also clean up any document-level listeners if component unmounts during drag
        cleanupRef.current?.()
        cleanupRef.current = null
      }
    }
    return undefined
  }, [draggable, dragElement, onPointerdown, onTouchstart])

  // Clamp position on container/viewport resize so titlebar stays reachable.
  // Only adjusts transform position — never touches size.
  useEffect(() => {
    if (!clampPositionOnResize)
      return

    const clampPosition = (): void => {
      const target = targetRef.current
      if (!target)
        return

      const targetRect = target.getBoundingClientRect()

      // Skip minimized/hidden elements (all-zero rects)
      if (targetRect.width === 0 && targetRect.height === 0)
        return

      let boundsTop: number

      if (container) {
        const containerRect = container.getBoundingClientRect()
        boundsTop = containerRect.top
      }
      else {
        boundsTop = 0
      }

      // Ensure targetRect.top >= boundsTop (titlebar stays visible)
      if (targetRect.top < boundsTop) {
        // deltaY is screen-space; convert to the local translate space so the
        // nudge is correct under a scaled/rotated ancestor.
        const screenDeltaY = boundsTop - targetRect.top
        const localFromScreen = getScreenFromLocalMatrix(target).inverse()
        const localDelta = applyLinear(localFromScreen, 0, screenDeltaY)
        transformRef.current = {
          offsetX: transformRef.current.offsetX + localDelta.x,
          offsetY: transformRef.current.offsetY + localDelta.y,
        }
        target.style.transform = `translate(${transformRef.current.offsetX.toString()}px, ${transformRef.current.offsetY.toString()}px)`
      }
    }

    if (container) {
      const observer = new ResizeObserver(() => clampPosition())
      observer.observe(container)
      return () => observer.disconnect()
    }
    else {
      window.addEventListener('resize', clampPosition)
      return () => window.removeEventListener('resize', clampPosition)
    }
  }, [clampPositionOnResize, container])

  return {
    /** Whether the element is currently being dragged */
    dragging,
    /** Ref callback for the drag listener element (typically the window frame) */
    setDragRef,
    /** Optional ref callback for the region (typically the title bar) where a drag may begin */
    setHandleRef,
    /** Reset position to initial state */
    resetPosition,
    /** Ref callback to attach to the target element that will be moved */
    setTargetRef,
    /** Internal transform state ref */
    transformRef,
  }
}
