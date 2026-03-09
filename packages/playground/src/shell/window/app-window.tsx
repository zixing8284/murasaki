import type { ReactNode } from 'react'
import {
  useDraggable,
  useResizable,
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
import { useCallback } from 'react'
import { useProcess, useProcessActions, useProcesses } from '../../contexts/process'
import { AppIcon } from '../app-icon'

interface AppWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableResize?: boolean
}

export function AppWindow({
  windowId,
  children,
  className,
  titleIcon,
  disableMaximize = false,
  disableResize = false,
}: AppWindowProps): React.ReactElement | null {
  const win = useProcess(windowId)
  const actions = useProcessActions()
  const { processes, container } = useProcesses()
  const portalContainer = processes[windowId]?.componentWindow ?? container
  const { setTargetRef: setDragTargetRef, setDragRef } = useDraggable<HTMLDivElement, HTMLDivElement>({
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

  if (!win)
    return null

  const { process: proc, isActive, zIndex } = win

  return (
    <WindowProvider active={isActive} minimized={proc.minimized} positioning="absolute">
      <WindowPortal container={portalContainer}>
        <WindowFrame
          ref={setTargetRef}
          className={className}
          style={{ zIndex }}
          onPointerDown={(e) => {
            e.stopPropagation()
            actions.activate(windowId)
          }}
        >
          <WindowTitleBar
            ref={setDragRef}
            className="cursor-move"
            onDoubleClick={disableMaximize ? undefined : () => actions.toggleMaximize(windowId)}
          >
            <WindowTitle icon={titleIcon ?? <AppIcon appId={proc.appId} size="sm" />}>{proc.title}</WindowTitle>
            <WindowButtons>
              <WindowMinimizeButton onClick={() => actions.minimize(windowId)} />
              <WindowMaximizeButton
                onClick={() => actions.toggleMaximize(windowId)}
                disabled={disableMaximize}
              />
              <WindowCloseButton onClick={() => actions.close(windowId)} />
            </WindowButtons>
          </WindowTitleBar>
          <WindowContent>{children}</WindowContent>
          {!disableResize && <WindowResizeGrip ref={setResizeRef} />}
        </WindowFrame>
      </WindowPortal>
    </WindowProvider>
  )
}
