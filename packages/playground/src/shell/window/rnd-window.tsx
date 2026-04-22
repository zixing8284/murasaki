import type { ReactNode } from 'react'
import type { AppId } from '../../contexts/process/directory'
import { useDraggable, useResizable } from 'murasaki-react98'
import { useCallback } from 'react'
import { useProcesses } from '../../contexts/process'
import directory from '../../contexts/process/directory'
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
  const appId = processes[windowId]?.appId as AppId | undefined
  const defaultSize = appId ? directory[appId]?.defaultSize : undefined

  const { setTargetRef: setDragTargetRef, setDragRef, dragging } = useDraggable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    draggable: true,
    onDragChange,
    clampPositionOnResize: true,
  })
  const { setTargetRef: setResizeTargetRef, setResizeRef, resizing } = useResizable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    resizable: !disableResize,
    minWidth: defaultSize?.width,
    minHeight: defaultSize?.height,
    onResizeChange,
  })

  // Merge two target refs into a single callback ref
  const setTargetRef = useCallback((el: HTMLDivElement | null) => {
    setDragTargetRef(el)
    setResizeTargetRef(el)
  }, [setDragTargetRef, setResizeTargetRef])

  return (
    <BaseWindow
      windowId={windowId}
      className={className}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      defaultSize={defaultSize}
      isInteracting={dragging || resizing}
      frameRef={setTargetRef}
      dragRef={setDragRef}
      resizeRef={setResizeRef}
    >
      {children}
    </BaseWindow>
  )
}
