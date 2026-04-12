import type { ReactNode, Ref } from 'react'
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
} from 'murasaki-react98'
import { useProcess, useProcessActions, useProcesses } from '../../contexts/process'
import { AppIcon } from '../app-icon'

export interface BaseWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
  /** Default window dimensions — applied as inline style for initial size */
  defaultSize?: { width?: number, height?: number }
  /** Whether the window is currently being dragged or resized */
  isInteracting?: boolean
  /** Callback ref for the window frame element (used by RndWindow for drag/resize targeting) */
  frameRef?: Ref<HTMLDivElement>
  /** Callback ref for the title bar element (used by RndWindow as drag handle) */
  dragRef?: Ref<HTMLDivElement>
  /** Callback ref for the resize grip element (used by RndWindow for resize handle) */
  resizeRef?: Ref<HTMLDivElement>
}

export function BaseWindow({
  windowId,
  children,
  className,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
  defaultSize,
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
    ? <img src={proc.icon.sm} alt="" className="w-4 h-4 pixelated shrink-0" draggable={false} />
    : <AppIcon appId={proc.appId} size="sm" />

  return (
    <WindowProvider active={isActive} minimized={proc.minimized} positioning="absolute" maximizable={!disableMaximize}>
      <WindowPortal container={portalContainer}>
        <WindowFrame
          ref={frameRef}
          className={`${(isInteracting && !proc.maximized) ? 'bg-transparent! shadow-[inset_-2px_-2px_0_var(--button-shadow),inset_2px_2px_0_var(--button-shadow)]! outline-1 outline-dotted outline-(--button-shadow) *:opacity-0' : ''} ${className ?? ''}`}
          style={{ zIndex, width: defaultSize?.width, height: defaultSize?.height }}
          onPointerDown={(e) => {
            e.stopPropagation()
            actions.activate(windowId)
          }}
        >
          <WindowTitleBar
            ref={dragRef}
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
          <WindowContent>{children}</WindowContent>
          {!disableResize && <WindowResizeGrip ref={resizeRef} />}
        </WindowFrame>
      </WindowPortal>
    </WindowProvider>
  )
}
