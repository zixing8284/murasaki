import type { CSSProperties, ReactNode } from 'react'
import { useDraggable, Window } from 'murasaki-react98'
import { useWindow, useWindowActions, useWindowManager } from '../stores/window-manager'

interface WindowAppProps {
  windowId: string
  children: ReactNode
  className?: string
  style?: CSSProperties
  titleIcon?: ReactNode
  disableMaximize?: boolean
}

export function WindowApp({
  windowId,
  children,
  className,
  style,
  titleIcon,
  disableMaximize = false,
}: WindowAppProps): React.ReactElement | null {
  const win = useWindow(windowId)
  const actions = useWindowActions()
  const container = useWindowManager(s => s.container)
  const { setTargetRef, setDragRef } = useDraggable<HTMLDivElement, HTMLDivElement>({
    container,
    draggable: true,
  })

  if (!win)
    return null

  const { record, isActive, zIndex } = win

  return (
    <Window.Provider active={isActive} minimized={record.minimized} positioning="absolute">
      <Window.Portal container={container}>
        <Window.Frame
          ref={setTargetRef}
          className={className}
          style={{ zIndex, ...style }}
          onPointerDown={(e) => {
            e.stopPropagation()
            actions.activateWindow(windowId)
          }}
        >
          <Window.TitleBar ref={setDragRef} className="cursor-move">
            <Window.Title icon={titleIcon}>{record.title}</Window.Title>
            <Window.Buttons>
              <Window.MinimizeButton onClick={() => actions.minimizeWindow(windowId)} />
              <Window.MaximizeButton
                onClick={() => actions.toggleMaximize(windowId)}
                disabled={disableMaximize}
              />
              <Window.CloseButton onClick={() => actions.closeWindow(windowId)} />
            </Window.Buttons>
          </Window.TitleBar>
          <Window.Content>{children}</Window.Content>
        </Window.Frame>
      </Window.Portal>
    </Window.Provider>
  )
}
