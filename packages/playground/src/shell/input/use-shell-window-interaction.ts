import type { RefObject } from 'react'
import type { ShellInputPoint, ShellInputSession, ShellInputSurface } from './shell-input-registry'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyLinear, getScreenFromLocalMatrix, pointInRect, scaleMagnitude } from './geometry'
import { isRawPointOnInteractive, useShellInputSurface } from './shell-input-registry'

const DRAG_THRESHOLD = 3
const RESIZE_THRESHOLD = 3

interface Transform {
  offsetX: number
  offsetY: number
}

interface Size {
  width: number
  height: number
}

interface UseShellWindowInteractionOptions {
  windowId: string
  container?: HTMLElement | null
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  onActivate?: () => void
  onDragChange?: (dragging: boolean) => void
  onResizeChange?: (resizing: boolean) => void
  clampPositionOnResize?: boolean
}

interface UseShellWindowInteractionReturn {
  dragging: boolean
  resizing: boolean
  frameRef: RefObject<HTMLDivElement | null>
  setFrameRef: (el: HTMLDivElement | null) => void
  setDragHandleRef: (el: HTMLElement | null) => void
  setResizeHandleRef: (el: HTMLElement | null) => void
}

function pointInElement(point: ShellInputPoint, element: HTMLElement | null): boolean {
  if (!element)
    return false
  return pointInRect(point.clientX, point.clientY, element.getBoundingClientRect())
}

// True only when `frame` is the visually top-most window at the point, using
// real hit-testing instead of bounding-rect containment. This is what keeps a
// gesture from piercing through the front window into an overlapped background
// window whose handle happens to sit under the same coordinates.
function frameIsTopmostAtPoint(point: ShellInputPoint, frame: HTMLElement | null): boolean {
  if (!frame)
    return false
  const topElement = document.elementFromPoint(point.clientX, point.clientY)
  return topElement != null && frame.contains(topElement)
}

export function useShellWindowInteraction({
  windowId,
  container = null,
  draggable = true,
  resizable = true,
  minWidth = 200,
  minHeight = 120,
  maxWidth,
  maxHeight,
  onActivate,
  onDragChange,
  onResizeChange,
  clampPositionOnResize = false,
}: UseShellWindowInteractionOptions): UseShellWindowInteractionReturn {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const dragHandleRef = useRef<HTMLElement | null>(null)
  const resizeHandleRef = useRef<HTMLElement | null>(null)
  const [frameElement, setFrameElement] = useState<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const transformRef = useRef<Transform>({ offsetX: 0, offsetY: 0 })
  const sizeRef = useRef<Size>({ width: 0, height: 0 })
  const lastTitleBarTapRef = useRef(0)

  const onDragChangeRef = useRef(onDragChange)
  const onResizeChangeRef = useRef(onResizeChange)

  useEffect(() => {
    onDragChangeRef.current = onDragChange
  }, [onDragChange])

  useEffect(() => {
    onResizeChangeRef.current = onResizeChange
  }, [onResizeChange])

  const setFrameRef = useCallback((el: HTMLDivElement | null) => {
    frameRef.current = el
    setFrameElement(el)
    if (!el)
      return

    const { offsetX, offsetY } = transformRef.current
    if (offsetX !== 0 || offsetY !== 0)
      el.style.transform = `translate(${offsetX.toString()}px, ${offsetY.toString()}px)`

    const { width, height } = sizeRef.current
    if (width > 0 && height > 0) {
      el.style.width = `${width.toString()}px`
      el.style.height = `${height.toString()}px`
    }
  }, [])

  const setDragHandleRef = useCallback((el: HTMLElement | null) => {
    dragHandleRef.current = el
  }, [])

  const setResizeHandleRef = useCallback((el: HTMLElement | null) => {
    resizeHandleRef.current = el
  }, [])

  const beginDrag = useCallback((down: ShellInputPoint): ShellInputSession | null => {
    const target = frameRef.current
    if (!target)
      return null
    onActivate?.()

    const screenFromLocal = getScreenFromLocalMatrix(target)
    const localFromScreen = screenFromLocal.inverse()
    const screenOffset = applyLinear(screenFromLocal, transformRef.current.offsetX, transformRef.current.offsetY)
    const offsetX = screenOffset.x
    const offsetY = screenOffset.y
    const targetRect = target.getBoundingClientRect()
    const { height: targetHeight, left: targetLeft, top: targetTop, width: targetWidth } = targetRect
    let minLeft: number
    let maxLeft: number
    let minTop: number
    let maxTop: number

    if (container) {
      const containerRect = container.getBoundingClientRect()
      minLeft = containerRect.left - targetLeft + offsetX
      maxLeft = containerRect.right - targetLeft - targetWidth + offsetX
      minTop = containerRect.top - targetTop + offsetY
      maxTop = containerRect.bottom - targetTop - targetHeight + offsetY
    }
    else {
      const { clientHeight, clientWidth } = document.documentElement
      minLeft = -targetLeft + offsetX
      minTop = -targetTop + offsetY
      maxLeft = clientWidth - targetLeft - targetWidth + offsetX
      maxTop = clientHeight - targetTop - targetHeight + offsetY
    }

    if (maxLeft < minLeft)
      maxLeft = minLeft
    if (maxTop < minTop)
      maxTop = minTop

    let started = false

    const finish = (point?: ShellInputPoint): void => {
      if (!started) {
        if (point?.source === 'touch') {
          const now = Date.now()
          if (now - lastTitleBarTapRef.current <= 300) {
            lastTitleBarTapRef.current = 0
            dragHandleRef.current?.dispatchEvent(new MouseEvent('dblclick', {
              bubbles: true,
              cancelable: true,
              clientX: point.clientX,
              clientY: point.clientY,
            }))
          }
          else {
            lastTitleBarTapRef.current = now
          }
        }
        return
      }
      target.style.willChange = ''
      setDragging(false)
      onDragChangeRef.current?.(false)
    }

    return {
      captureIframes: true,
      onMove(point) {
        if (!started) {
          if (Math.abs(point.clientX - down.clientX) < DRAG_THRESHOLD && Math.abs(point.clientY - down.clientY) < DRAG_THRESHOLD)
            return
          started = true
          target.style.willChange = 'transform'
          setDragging(true)
          onDragChangeRef.current?.(true)
        }

        const moveX = Math.min(Math.max(offsetX + point.clientX - down.clientX, minLeft), maxLeft)
        const moveY = Math.min(Math.max(offsetY + point.clientY - down.clientY, minTop), maxTop)
        const local = applyLinear(localFromScreen, moveX, moveY)
        transformRef.current = { offsetX: local.x, offsetY: local.y }
        target.style.transform = `translate(${local.x.toString()}px, ${local.y.toString()}px)`
      },
      onEnd: finish,
      onCancel: () => finish(),
    }
  }, [container, onActivate])

  const beginResize = useCallback((down: ShellInputPoint): ShellInputSession | null => {
    const target = frameRef.current
    if (!target)
      return null
    onActivate?.()

    const screenFromLocal = getScreenFromLocalMatrix(target)
    const localFromScreen = screenFromLocal.inverse()
    const scale = scaleMagnitude(screenFromLocal)
    const targetRect = target.getBoundingClientRect()
    const initWidth = target.offsetWidth
    const initHeight = target.offsetHeight
    let maxAllowedWidth: number
    let maxAllowedHeight: number

    if (container) {
      const containerRect = container.getBoundingClientRect()
      maxAllowedWidth = (containerRect.right - targetRect.left) / scale
      maxAllowedHeight = (containerRect.bottom - targetRect.top) / scale
    }
    else {
      const { clientHeight, clientWidth } = document.documentElement
      maxAllowedWidth = (clientWidth - targetRect.left) / scale
      maxAllowedHeight = (clientHeight - targetRect.top) / scale
    }

    if (maxWidth != null)
      maxAllowedWidth = Math.min(maxAllowedWidth, maxWidth)
    if (maxHeight != null)
      maxAllowedHeight = Math.min(maxAllowedHeight, maxHeight)
    if (maxAllowedWidth < minWidth)
      maxAllowedWidth = minWidth
    if (maxAllowedHeight < minHeight)
      maxAllowedHeight = minHeight

    const originalCursor = document.body.style.cursor
    document.body.style.cursor = 'var(--cursor-nwse-resize, nwse-resize)'
    let started = false

    const finish = (): void => {
      document.body.style.cursor = originalCursor
      if (!started)
        return
      setResizing(false)
      onResizeChangeRef.current?.(false)
    }

    return {
      captureIframes: true,
      onMove(point) {
        if (!started) {
          if (Math.abs(point.clientX - down.clientX) < RESIZE_THRESHOLD && Math.abs(point.clientY - down.clientY) < RESIZE_THRESHOLD)
            return
          started = true
          setResizing(true)
          onResizeChangeRef.current?.(true)
        }

        const delta = applyLinear(localFromScreen, point.clientX - down.clientX, point.clientY - down.clientY)
        const newWidth = Math.min(Math.max(initWidth + delta.x, minWidth), maxAllowedWidth)
        const newHeight = Math.min(Math.max(initHeight + delta.y, minHeight), maxAllowedHeight)
        sizeRef.current = { width: newWidth, height: newHeight }
        target.style.width = `${newWidth.toString()}px`
        target.style.height = `${newHeight.toString()}px`
      },
      onEnd: finish,
      onCancel: finish,
    }
  }, [container, maxHeight, maxWidth, minHeight, minWidth, onActivate])

  const resizeSurface = useMemo<ShellInputSurface | null>(() => {
    if (!frameElement)
      return null
    return {
      id: `window:${windowId}:resize`,
      element: frameElement,
      priority: 3000,
      enabled: () => resizable,
      contains: point => pointInElement(point, resizeHandleRef.current) && frameIsTopmostAtPoint(point, frameElement),
      onStart: beginResize,
    }
  }, [beginResize, frameElement, resizable, windowId])

  const dragSurface = useMemo<ShellInputSurface | null>(() => {
    if (!frameElement)
      return null
    return {
      id: `window:${windowId}:drag`,
      element: frameElement,
      priority: 2000,
      enabled: () => draggable,
      contains(point) {
        return pointInElement(point, dragHandleRef.current)
          && frameIsTopmostAtPoint(point, frameElement)
          && !isRawPointOnInteractive(point)
      },
      onStart: beginDrag,
    }
  }, [beginDrag, draggable, frameElement, windowId])

  useShellInputSurface(resizeSurface)
  useShellInputSurface(dragSurface)

  useEffect(() => {
    if (!clampPositionOnResize)
      return

    const clampPosition = (): void => {
      const target = frameRef.current
      if (!target)
        return
      const targetRect = target.getBoundingClientRect()
      if (targetRect.width === 0 && targetRect.height === 0)
        return

      const boundsTop = container ? container.getBoundingClientRect().top : 0
      if (targetRect.top >= boundsTop)
        return

      const screenDeltaY = boundsTop - targetRect.top
      const localFromScreen = getScreenFromLocalMatrix(target).inverse()
      const localDelta = applyLinear(localFromScreen, 0, screenDeltaY)
      transformRef.current = {
        offsetX: transformRef.current.offsetX + localDelta.x,
        offsetY: transformRef.current.offsetY + localDelta.y,
      }
      target.style.transform = `translate(${transformRef.current.offsetX.toString()}px, ${transformRef.current.offsetY.toString()}px)`
    }

    if (container) {
      const observer = new ResizeObserver(() => clampPosition())
      observer.observe(container)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', clampPosition)
    return () => window.removeEventListener('resize', clampPosition)
  }, [clampPositionOnResize, container])

  return {
    dragging,
    frameRef,
    resizing,
    setDragHandleRef,
    setFrameRef,
    setResizeHandleRef,
  }
}
