import type { ReactNode } from 'react'
import { useDraggable, useResizable } from 'murasaki-react98'
import { useCallback, useEffect, useRef } from 'react'
import { useProcesses } from '../../contexts/process'
import { BaseWindow } from './base-window'

interface RndWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
  /** Called when dragging starts/stops — use to disable iframe pointer-events during drag */
  onDragChange?: (dragging: boolean) => void
  /** Called when resize starts/stops — use to disable iframe pointer-events during resize */
  onResizeChange?: (resizing: boolean) => void
}

export function RndWindow({
  windowId,
  children,
  className,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
  onDragChange,
  onResizeChange,
}: RndWindowProps): React.ReactElement | null {
  const { processes, container } = useProcesses()
  const portalContainer = processes[windowId]?.componentWindow ?? container

  const { setTargetRef: setDragTargetRef, setDragRef, dragging } = useDraggable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    draggable: true,
  })
  const { setTargetRef: setResizeTargetRef, setResizeRef, resizing } = useResizable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    resizable: !disableResize,
  })

  // Store target element ref for bounds clamping
  const targetRef = useRef<HTMLDivElement | null>(null)

  // Merge two target refs into a single callback ref
  const setTargetRef = useCallback((el: HTMLDivElement | null) => {
    targetRef.current = el
    setDragTargetRef(el)
    setResizeTargetRef(el)
  }, [setDragTargetRef, setResizeTargetRef])

  // Clamp window dimensions to container bounds when window exceeds desktop area
  const clampWindowToBounds = useCallback(() => {
    const target = targetRef.current
    if (!target || !portalContainer)
      return

    const containerRect = portalContainer.getBoundingClientRect()
    const windowRect = target.getBoundingClientRect()

    let needsUpdate = false
    let newWidth = windowRect.width
    let newHeight = windowRect.height

    if (windowRect.width > containerRect.width) {
      newWidth = containerRect.width
      needsUpdate = true
    }
    if (windowRect.height > containerRect.height) {
      newHeight = containerRect.height
      needsUpdate = true
    }

    if (needsUpdate) {
      target.style.width = `${newWidth}px`
      target.style.height = `${newHeight}px`
    }
  }, [portalContainer])

  // Clamp on mount and when container size changes (e.g., screen resize)
  useEffect(() => {
    if (!portalContainer)
      return
    clampWindowToBounds()

    const observer = new ResizeObserver(() => clampWindowToBounds())
    observer.observe(portalContainer)
    return () => observer.disconnect()
  }, [portalContainer, clampWindowToBounds])

  // Re-clamp after drag or resize ends (bounds may have been exceeded during operation)
  useEffect(() => {
    if (dragging || resizing)
      return
    clampWindowToBounds()
  }, [dragging, resizing, clampWindowToBounds])

  // Notify consumers when drag state changes (used by IframeWindow to disable iframe pointer-events)
  useEffect(() => {
    onDragChange?.(dragging)
  }, [dragging, onDragChange])

  // Notify consumers when resize state changes (used by IframeWindow to disable iframe pointer-events)
  useEffect(() => {
    onResizeChange?.(resizing)
  }, [resizing, onResizeChange])

  return (
    <BaseWindow
      windowId={windowId}
      className={className}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      frameRef={setTargetRef}
      dragRef={setDragRef}
      resizeRef={setResizeRef}
    >
      {children}
    </BaseWindow>
  )
}
