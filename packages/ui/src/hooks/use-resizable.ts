import { useCallback, useEffect, useRef, useState } from 'react'

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
  } = options

  const targetRef = useRef<TTarget | null>(null)
  // Use useState so changes trigger useEffect re-run (same pattern as useDraggable)
  const [handleElement, setHandleElement] = useState<THandle | null>(null)
  const [resizing, setResizing] = useState(false)
  const sizeRef = useRef<Size>({ width: 0, height: 0 })

  // Store cleanup function for document-level event listeners
  const cleanupRef = useRef<(() => void) | null>(null)

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

  const resetSize = useCallback(() => {
    sizeRef.current = { width: 0, height: 0 }
    if (targetRef.current) {
      targetRef.current.style.width = ''
      targetRef.current.style.height = ''
    }
  }, [])

  const onMousedown = useCallback(
    (e: MouseEvent) => {
      const target = targetRef.current
      if (!target)
        return

      // Prevent text selection during resize
      e.preventDefault()
      e.stopPropagation()

      const downX = e.clientX
      const downY = e.clientY

      const targetRect = target.getBoundingClientRect()
      const initWidth = targetRect.width
      const initHeight = targetRect.height

      // Calculate maximum allowed dimensions based on container/viewport
      let maxAllowedWidth: number
      let maxAllowedHeight: number

      if (container) {
        const containerRect = container.getBoundingClientRect()
        maxAllowedWidth = containerRect.right - targetRect.left
        maxAllowedHeight = containerRect.bottom - targetRect.top
      }
      else {
        const { clientWidth, clientHeight } = document.documentElement
        maxAllowedWidth = clientWidth - targetRect.left
        maxAllowedHeight = clientHeight - targetRect.top
      }

      // Apply user-specified max constraints
      if (maxWidth != null) {
        maxAllowedWidth = Math.min(maxAllowedWidth, maxWidth)
      }
      if (maxHeight != null) {
        maxAllowedHeight = Math.min(maxAllowedHeight, maxHeight)
      }

      // Save original cursor and set resize cursor on body to prevent flicker
      const originalCursor = document.body.style.cursor
      document.body.style.cursor = 'nwse-resize'

      const onMousemove = (e: MouseEvent): void => {
        const newWidth = Math.min(
          Math.max(initWidth + e.clientX - downX, minWidth),
          maxAllowedWidth,
        )
        const newHeight = Math.min(
          Math.max(initHeight + e.clientY - downY, minHeight),
          maxAllowedHeight,
        )

        sizeRef.current = { width: newWidth, height: newHeight }
        target.style.width = `${newWidth.toString()}px`
        target.style.height = `${newHeight.toString()}px`
      }

      const onMouseup = (): void => {
        setResizing(false)
        document.body.style.cursor = originalCursor
        document.removeEventListener('mousemove', onMousemove)
        document.removeEventListener('mouseup', onMouseup)
        cleanupRef.current = null
      }

      // Store cleanup for use in useEffect cleanup
      cleanupRef.current = () => {
        document.body.style.cursor = originalCursor
        document.removeEventListener('mousemove', onMousemove)
        document.removeEventListener('mouseup', onMouseup)
      }

      setResizing(true)
      document.addEventListener('mousemove', onMousemove)
      document.addEventListener('mouseup', onMouseup)
    },
    [container, minWidth, minHeight, maxWidth, maxHeight],
  )

  useEffect(() => {
    if (resizable && handleElement) {
      handleElement.addEventListener('mousedown', onMousedown)
      return () => {
        handleElement.removeEventListener('mousedown', onMousedown)
        // Clean up document-level listeners if component unmounts during resize
        cleanupRef.current?.()
        cleanupRef.current = null
      }
    }
    return undefined
  }, [resizable, handleElement, onMousedown])

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
