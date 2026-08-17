import type { ReactNode } from 'react'
import type { AppId } from '../../contexts/process/directory'
import type { ProcessWindowPosition } from '../../contexts/process/types'
import { useCallback, useRef, useState } from 'react'
import directory from '../../contexts/process/directory'
import { useProcessActions, useProcesses } from '../../contexts/process/hooks'
import { useShellWindowInteraction } from '../input/use-shell-window-interaction'
import { BaseWindow } from './base-window'
import { readWindowPosition, writeWindowPosition } from './window-position-persistence'

interface RndWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  contentClassName?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
  /** Show the working cursor over this window while it is loading */
  loadingCursor?: boolean
  /** Called when dragging starts/stops — use to disable iframe pointer-events during drag */
  onDragChange?: (dragging: boolean) => void
  /** Called when resize starts/stops — use to disable iframe pointer-events during resize */
  onResizeChange?: (resizing: boolean) => void
}

export function RndWindow({
  windowId,
  children,
  className,
  contentClassName,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
  loadingCursor = false,
  onDragChange,
  onResizeChange,
}: RndWindowProps): React.ReactElement | null {
  const { processes, container } = useProcesses()
  const actions = useProcessActions()
  const portalContainer = processes[windowId]?.componentWindow ?? container
  const appId = processes[windowId]?.appId as AppId | undefined
  const entry = appId ? directory[appId] : undefined
  const defaultSize = entry?.defaultSize
  const defaultPosition = entry?.defaultPosition

  // Read stored position once on mount (singleton windows only)
  const [initialStoredPosition] = useState<{ left: number, top: number } | null>(
    () => (appId && entry?.singleton !== false) ? readWindowPosition(appId) : null,
  )

  const frameRef = useRef<HTMLDivElement | null>(null)

  // Cascade non-singleton windows so they don't stack at the same position
  const cascadePosition: ProcessWindowPosition | undefined = (() => {
    if (!appId || !defaultPosition || entry?.singleton !== false)
      return defaultPosition

    const pids = Object.keys(processes)
    const sameAppPids = pids.filter(pid => processes[pid]?.appId === appId)
    const index = sameAppPids.indexOf(windowId)
    if (index <= 0)
      return defaultPosition

    const offset = index * 30
    return {
      top: `calc(${defaultPosition.top ?? '0px'} + ${offset}px)`,
      left: `calc(${defaultPosition.left ?? '0px'} + ${offset}px)`,
    }
  })()

  // Stored position wins over cascade/default for singleton windows
  const resolvedDefaultPosition: ProcessWindowPosition | undefined = initialStoredPosition
    ? { top: initialStoredPosition.top, left: initialStoredPosition.left }
    : cascadePosition

  // Write position to session storage when drag ends
  const handleDragChange = useCallback(
    (isDragging: boolean) => {
      if (!isDragging && appId && entry?.singleton !== false) {
        const frameEl = frameRef.current
        if (frameEl) {
          const frameRect = frameEl.getBoundingClientRect()
          const containerRect = portalContainer?.getBoundingClientRect() ?? { left: 0, top: 0 }
          writeWindowPosition(appId, {
            left: Math.round(frameRect.left - containerRect.left),
            top: Math.round(frameRect.top - containerRect.top),
          })
        }
      }
      onDragChange?.(isDragging)
    },
    [appId, entry, portalContainer, onDragChange],
  )

  const {
    dragging,
    resizing,
    setDragHandleRef,
    setFrameRef,
    setResizeHandleRef,
  } = useShellWindowInteraction({
    windowId,
    container: portalContainer,
    draggable: true,
    resizable: !disableResize,
    onActivate: () => actions.activate(windowId),
    onDragChange: handleDragChange,
    onResizeChange,
    clampPositionOnResize: true,
    minWidth: defaultSize?.width,
    minHeight: defaultSize?.height,
  })

  const setFrame = (el: HTMLDivElement | null): void => {
    frameRef.current = el
    setFrameRef(el)
  }

  return (
    <BaseWindow
      windowId={windowId}
      className={className}
      contentClassName={contentClassName}
      titleIcon={titleIcon}
      disableMaximize={disableMaximize}
      disableMinimize={disableMinimize}
      disableResize={disableResize}
      defaultSize={defaultSize}
      defaultPosition={resolvedDefaultPosition}
      isInteracting={dragging || resizing}
      loadingCursor={loadingCursor}
      frameRef={setFrame}
      dragRef={setDragHandleRef}
      resizeRef={setResizeHandleRef}
    >
      {children}
    </BaseWindow>
  )
}
