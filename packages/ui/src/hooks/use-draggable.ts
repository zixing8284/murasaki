import { useCallback, useEffect, useRef, useState } from 'react'

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
  setTargetRef: (el: TTarget | null) => void
  transformRef: React.RefObject<Transform>
  resetPosition: () => void
} {
  const { container = null, draggable = true } = options

  const targetRef = useRef<null | TTarget>(null)
  const dragRef = useRef<null | TDrag>(null)
  const [dragging, setDragging] = useState(false)
  const transformRef = useRef<Transform>({ offsetX: 0, offsetY: 0 })

  const setTargetRef = useCallback((el: TTarget | null) => {
    targetRef.current = el
  }, [])

  const setDragRef = useCallback((el: TDrag | null) => {
    dragRef.current = el
  }, [])

  const resetPosition = useCallback(() => {
    transformRef.current = { offsetX: 0, offsetY: 0 }
    if (targetRef.current) {
      targetRef.current.style.transform = ''
    }
  }, [])

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      const target = targetRef.current
      if (!target)
        return

      // Prevent text selection during drag
      e.preventDefault()

      const downX = e.clientX
      const downY = e.clientY
      const { offsetX, offsetY } = transformRef.current

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

      const onMousemove = (e: MouseEvent): void => {
        // Clamp to boundaries
        const moveX = Math.min(
          Math.max(offsetX + e.clientX - downX, minLeft),
          maxLeft,
        )
        const moveY = Math.min(
          Math.max(offsetY + e.clientY - downY, minTop),
          maxTop,
        )

        transformRef.current = { offsetX: moveX, offsetY: moveY }
        target.style.transform = `translate(${moveX.toString()}px, ${moveY.toString()}px)`
      }

      const onMouseup = (): void => {
        setDragging(false)
        document.removeEventListener('mousemove', onMousemove)
        document.removeEventListener('mouseup', onMouseup)
      }

      setDragging(true)
      document.addEventListener('mousemove', onMousemove)
      document.addEventListener('mouseup', onMouseup)
    },
    [container],
  )

  useEffect(() => {
    const dragDom = dragRef.current

    if (draggable && dragDom) {
      dragDom.addEventListener('mousedown', onMousedown)
      return () => {
        dragDom.removeEventListener('mousedown', onMousedown)
      }
    }
    return undefined
  }, [draggable, onMousedown])

  return {
    /** Whether the element is currently being dragged */
    dragging,
    /** Ref callback to attach to the drag handle element */
    setDragRef,
    /** Reset position to initial state */
    resetPosition,
    /** Ref callback to attach to the target element that will be moved */
    setTargetRef,
    /** Internal transform state ref */
    transformRef,
  }
}
