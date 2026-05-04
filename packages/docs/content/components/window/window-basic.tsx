'use client'

import { Button, WindowButtons, WindowCloseButton, WindowContent, WindowFrame, WindowMaximizeButton, WindowMenuBar, WindowMenuBarItem, WindowMinimizeButton, WindowProvider, WindowStatusBar, WindowStatusBarField, WindowTitle, WindowTitleBar } from 'murasaki-react98'

export function WindowBasicDemo(): React.ReactElement {
  return (
    <div className="relative h-56 w-[352px]">
      <WindowProvider positioning="absolute" maximizable={false}>
        <WindowFrame className="inset-0 min-h-0">
          <WindowTitleBar>
            <WindowTitle>Example.exe</WindowTitle>
            <WindowButtons>
              <WindowMinimizeButton />
              <WindowMaximizeButton disabled />
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>
          <WindowMenuBar>
            <WindowMenuBarItem>File</WindowMenuBarItem>
            <WindowMenuBarItem>Edit</WindowMenuBarItem>
            <WindowMenuBarItem>Help</WindowMenuBarItem>
          </WindowMenuBar>
          <WindowContent className="p-2">
            <p className="m-0 mb-2">Window primitives compose into app chrome.</p>
            <Button>OK</Button>
          </WindowContent>
          <WindowStatusBar>
            <WindowStatusBarField>Ready</WindowStatusBarField>
            <WindowStatusBarField grow={false}>NUM</WindowStatusBarField>
          </WindowStatusBar>
        </WindowFrame>
      </WindowProvider>
    </div>
  )
}
