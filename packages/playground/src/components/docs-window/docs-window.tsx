import type { AppWindowProps } from '../../stores/app-registry'
import { useDraggable, Window } from 'murasaki-react98'
import { useWindow, useWindowManager } from '../../stores/window-manager'
import { DocsLayout } from './docs-layout'

export function DocsWindow({ windowId, container }: AppWindowProps): React.ReactElement | null {
  const win = useWindow(windowId)
  const activateWindow = useWindowManager(s => s.activateWindow)
  const minimizeWindow = useWindowManager(s => s.minimizeWindow)
  const closeWindow = useWindowManager(s => s.closeWindow)
  const toggleMaximize = useWindowManager(s => s.toggleMaximize)

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
          className="w-[750px] h-[70%] top-[10%] left-[60px]"
          style={{ zIndex }}
          onPointerDown={(e) => {
            e.stopPropagation()
            activateWindow(windowId)
          }}
        >
          <Window.TitleBar ref={setDragRef} className="cursor-move">
            <Window.Title icon={<img src={record.icon} alt="" className="w-4 h-4 pixelated" />}>
              {record.title}
            </Window.Title>
            <Window.Buttons>
              <Window.MinimizeButton onClick={() => minimizeWindow(windowId)} />
              <Window.MaximizeButton onClick={() => toggleMaximize(windowId)} disabled />
              <Window.CloseButton onClick={() => closeWindow(windowId)} />
            </Window.Buttons>
          </Window.TitleBar>
          <Window.Content className="p-0!">
            <DocsLayout />
          </Window.Content>
        </Window.Frame>
      </Window.Portal>
    </Window.Provider>
  )
}
