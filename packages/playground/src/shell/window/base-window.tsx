import type { ReactNode, Ref } from 'react'
import type { ProcessWindowPosition } from '../../contexts/process/types'
import {
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowPortal,
  WindowProvider,
  WindowResizeGrip,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'
import { useProcess, useProcessActions, useProcesses } from '../../contexts/process/hooks'
import { assetPath } from '../../lib/asset-path'
import { AppIcon } from '../app-icon'

export interface BaseWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  contentClassName?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
  /** Default window dimensions — applied as inline style for initial size */
  defaultSize?: { width?: number, height?: number }
  /** Default absolute window position — applied as inline style for initial placement */
  defaultPosition?: ProcessWindowPosition
  /** Whether the window is currently being dragged or resized */
  isInteracting?: boolean
  /** Callback ref for the window frame element (used by RndWindow for drag/resize targeting) */
  frameRef?: Ref<HTMLDivElement>
  /** Callback ref for the title bar element (used by RndWindow as drag handle) */
  dragRef?: Ref<HTMLDivElement>
  /** Callback ref for the resize grip element (used by RndWindow for resize handle) */
  resizeRef?: Ref<HTMLDivElement>
}

function clampInitialPosition(value: number | string | undefined, size: number | undefined): number | string | undefined {
  if (value === undefined || size === undefined)
    return value

  const length = typeof value === 'number' ? `${value}px` : value
  return `clamp(0px, round(${length}, 1px), max(0px, calc(100% - ${String(size)}px)))`
}

export function BaseWindow({
  windowId,
  children,
  className,
  contentClassName,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
  defaultSize,
  defaultPosition,
  isInteracting = false,
  frameRef,
  dragRef,
  resizeRef,
}: BaseWindowProps): React.ReactElement | null {
  const win = useProcess(windowId)
  const actions = useProcessActions()
  const { processes, container } = useProcesses()
  const portalContainer = processes[windowId]?.componentWindow ?? container

  if (!win)
    return null

  const { process: proc, isActive, zIndex } = win

  const defaultIcon = proc.icon
    ? <img src={assetPath(proc.icon.sm)} alt="" className="size-4 pixelated shrink-0" draggable={false} />
    : <AppIcon appId={proc.appId} size="sm" />

  return (
    <WindowProvider active={isActive} minimized={proc.minimized} positioning="absolute" maximizable={!disableMaximize}>
      <WindowPortal container={portalContainer}>
        <WindowFrame
          ref={frameRef}
          className={`${(isInteracting && !proc.maximized) ? 'bg-transparent! shadow-[inset_-2px_-2px_0_var(--button-shadow),inset_2px_2px_0_var(--button-shadow)]! outline-1 outline-dotted outline-(--button-shadow) *:opacity-0 *:pointer-events-none' : ''} ${className ?? ''}`}
          style={{
            zIndex,
            width: defaultSize?.width,
            height: defaultSize?.height,
            top: clampInitialPosition(defaultPosition?.top, defaultSize?.height),
            right: defaultPosition?.right,
            bottom: defaultPosition?.bottom,
            left: clampInitialPosition(defaultPosition?.left, defaultSize?.width),
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
            actions.activate(windowId)
          }}
        >
          <WindowTitleBar
            ref={dragRef}
            className="touch-none pointer-coarse:h-6"
            onDoubleClick={disableMaximize ? undefined : () => actions.toggleMaximize(windowId)}
          >
            <WindowTitle icon={titleIcon ?? defaultIcon}>{proc.title}</WindowTitle>
            <WindowButtons>
              {!disableMinimize && <WindowMinimizeButton onClick={() => actions.minimize(windowId)} />}
              <WindowMaximizeButton
                onClick={() => actions.toggleMaximize(windowId)}
              />
              <WindowCloseButton onClick={() => actions.close(windowId)} />
            </WindowButtons>
          </WindowTitleBar>
          <WindowContent className={contentClassName}>{children}</WindowContent>
          {!disableResize && <WindowResizeGrip ref={resizeRef} />}
        </WindowFrame>
      </WindowPortal>
    </WindowProvider>
  )
}
