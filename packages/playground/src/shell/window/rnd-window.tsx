import type { ReactNode } from 'react'
import { useDraggable, useResizable } from 'murasaki-react98'
import { useCallback, useEffect } from 'react'
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
}: RndWindowProps): React.ReactElement | null {
  const { processes, container } = useProcesses()
  const portalContainer = processes[windowId]?.componentWindow ?? container

  const { setTargetRef: setDragTargetRef, setDragRef, dragging } = useDraggable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    draggable: true,
  })
  const { setTargetRef: setResizeTargetRef, setResizeRef } = useResizable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    resizable: !disableResize,
  })

  // Merge two target refs into a single callback ref
  const setTargetRef = useCallback((el: HTMLDivElement | null) => {
    setDragTargetRef(el)
    setResizeTargetRef(el)
  }, [setDragTargetRef, setResizeTargetRef])

  // Notify consumers when drag state changes (used by IframeWindow to disable iframe pointer-events)
  useEffect(() => {
    onDragChange?.(dragging)
  }, [dragging, onDragChange])

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
