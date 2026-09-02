'use client'

import {
  Button,
  MenuItem,
  MenuSeparator,
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowMinimizeButton,
  WindowStatusBar,
  WindowStatusBarField,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'
import { useState } from 'react'

export function WindowMenuDemo(): React.ReactElement {
  const [status, setStatus] = useState('Ready')

  return (
    <div className="relative h-64 w-[384px]">
      <Window positioning="absolute" maximizable={false}>
        <WindowFrame className="inset-0 min-h-0">
          <WindowTitleBar>
            <WindowTitle>Write.exe</WindowTitle>
            <WindowButtons>
              <WindowMinimizeButton />
              <WindowMaximizeButton disabled />
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>
          <WindowMenuBar>
            <WindowMenuBarMenu value="file">
              <WindowMenuBarTrigger>File</WindowMenuBarTrigger>
              <WindowMenuBarContent className="w-40">
                <MenuItem reserveIconSpace onClick={() => setStatus('New document')}>New</MenuItem>
                <MenuItem reserveIconSpace onClick={() => setStatus('Open file')}>Open…</MenuItem>
                <MenuItem reserveIconSpace disabled>Save</MenuItem>
                <MenuSeparator />
                <MenuItem reserveIconSpace onClick={() => setStatus('Print')}>Print…</MenuItem>
                <MenuSeparator />
                <MenuItem reserveIconSpace disabled>Exit</MenuItem>
              </WindowMenuBarContent>
            </WindowMenuBarMenu>
            <WindowMenuBarMenu value="edit">
              <WindowMenuBarTrigger>Edit</WindowMenuBarTrigger>
              <WindowMenuBarContent className="w-36">
                <MenuItem reserveIconSpace disabled>Undo</MenuItem>
                <MenuSeparator />
                <MenuItem reserveIconSpace onClick={() => setStatus('Cut')}>Cut</MenuItem>
                <MenuItem reserveIconSpace onClick={() => setStatus('Copy')}>Copy</MenuItem>
                <MenuItem reserveIconSpace disabled>Paste</MenuItem>
              </WindowMenuBarContent>
            </WindowMenuBarMenu>
            <WindowMenuBarMenu value="help">
              <WindowMenuBarTrigger>Help</WindowMenuBarTrigger>
              <WindowMenuBarContent className="w-44">
                <MenuItem reserveIconSpace onClick={() => setStatus('Help contents')}>Contents</MenuItem>
                <MenuSeparator />
                <MenuItem reserveIconSpace onClick={() => setStatus('About Write')}>About Write</MenuItem>
              </WindowMenuBarContent>
            </WindowMenuBarMenu>
          </WindowMenuBar>
          <WindowContent className="flex flex-col gap-2 p-2">
            <p className="m-0">A tiny document window with classic top menus.</p>
            <Button onClick={() => setStatus('Button clicked')}>Close</Button>
          </WindowContent>
          <WindowStatusBar>
            <WindowStatusBarField>{status}</WindowStatusBarField>
          </WindowStatusBar>
        </WindowFrame>
      </Window>
    </div>
  )
}
