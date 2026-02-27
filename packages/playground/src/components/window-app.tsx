import type { ReactNode } from 'react'
import { useDraggable, Window } from 'murasaki-react98'
import { useProcess, useProcessActions, useProcesses } from '../contexts/process'

interface WindowAppProps {
  windowId: string
  children: ReactNode
  className?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
}

export function WindowApp({
  windowId,
  children,
  className,
  titleIcon,
  disableMaximize = false,
}: WindowAppProps): React.ReactElement | null {
  const win = useProcess(windowId)
  const actions = useProcessActions()
  const { processes, container } = useProcesses()
  const portalContainer = processes[windowId]?.componentWindow ?? container
  const { setTargetRef, setDragRef } = useDraggable<HTMLDivElement, HTMLDivElement>({
    container: portalContainer,
    draggable: true,
  })

  if (!win)
    return null

  const { process: proc, isActive, zIndex } = win

  return (
    <Window.Provider active={isActive} minimized={proc.minimized} positioning="absolute">
      <Window.Portal container={portalContainer}>
        <Window.Frame
          ref={setTargetRef}
          className={className}
          style={{ zIndex }}
          onPointerDown={(e) => {
            e.stopPropagation()
            actions.activate(windowId)
          }}
        >
          <Window.TitleBar ref={setDragRef} className="cursor-move">
            <Window.Title icon={titleIcon}>{proc.title}</Window.Title>
            <Window.Buttons>
              <Window.MinimizeButton onClick={() => actions.minimize(windowId)} />
              <Window.MaximizeButton
                onClick={() => actions.toggleMaximize(windowId)}
                disabled={disableMaximize}
              />
              <Window.CloseButton onClick={() => actions.close(windowId)} />
            </Window.Buttons>
          </Window.TitleBar>
          <Window.Content>{children}</Window.Content>
        </Window.Frame>
      </Window.Portal>
    </Window.Provider>
  )
}
