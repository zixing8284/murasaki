import type { AppWindowProps } from '../stores/app-registry'
import { OptionButton, OptionGroup, useDraggable, Window } from 'murasaki-react98'
import { useState } from 'react'
import { useWindow, useWindowManager } from '../stores/window-manager'

export function MyComputerWindow({ windowId, container }: AppWindowProps): React.ReactElement | null {
  const win = useWindow(windowId)
  const activateWindow = useWindowManager(s => s.activateWindow)
  const minimizeWindow = useWindowManager(s => s.minimizeWindow)
  const closeWindow = useWindowManager(s => s.closeWindow)
  const toggleMaximize = useWindowManager(s => s.toggleMaximize)
  const [selected, setSelected] = useState('option1')

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
          className="w-[520px]"
          style={{ zIndex }}
          onPointerDown={(e) => {
            e.stopPropagation()
            activateWindow(windowId)
          }}
        >
          <Window.TitleBar ref={setDragRef} className="cursor-move">
            <Window.Title>{record.title}</Window.Title>
            <Window.Buttons>
              <Window.MinimizeButton onClick={() => minimizeWindow(windowId)} />
              <Window.MaximizeButton onClick={() => toggleMaximize(windowId)} />
              <Window.CloseButton onClick={() => closeWindow(windowId)} />
            </Window.Buttons>
          </Window.TitleBar>
          <Window.Content>
            <div className="p-2">
              <p>Window content here...</p>
              <OptionGroup name="demo" onChange={setSelected} selectedValue={selected}>
                <div className="flex flex-col gap-2">
                  <OptionButton value="option1">Option 1</OptionButton>
                  <OptionButton value="option2">Option 2</OptionButton>
                  <OptionButton value="option3">Option 3</OptionButton>
                </div>
              </OptionGroup>
            </div>
          </Window.Content>
        </Window.Frame>
      </Window.Portal>
    </Window.Provider>
  )
}
