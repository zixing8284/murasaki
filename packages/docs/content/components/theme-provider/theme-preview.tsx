'use client'

import type { ThemeId } from '@murasaki-io/react98'
import {
  Button,
  Taskbar,
  TaskbarNotificationArea,
  TaskbarSystemClock,
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'

interface ThemePreviewProps {
  themeId: ThemeId
}

export function ThemePreview({ themeId }: ThemePreviewProps): React.ReactElement {
  return (
    <div
      className="relative h-65 overflow-hidden border border-(--button-dk-shadow) bg-(--background)"
      data-theme={themeId}
    >

      {/* Inactive Window */}
      <Window active={false} positioning="absolute" maximizable={false}>
        <WindowFrame className="top-3 left-13 w-68 min-w-0! min-h-0!">
          <WindowTitleBar>
            <WindowTitle>Inactive Window</WindowTitle>
            <WindowButtons>
              <WindowMinimizeButton />
              <WindowMaximizeButton />
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>
          <WindowContent className="p-0.5">
            <div className="flex h-28 shadow-(--shadow-border-field)">
              <div className="flex-1 bg-(--window)" />
            </div>
          </WindowContent>
        </WindowFrame>
      </Window>

      {/* Active Window */}
      <Window active positioning="absolute" maximizable={false}>
        <WindowFrame className="top-9 left-14 w-68 min-w-0! min-h-0!">
          <WindowTitleBar>
            <WindowTitle>Active Window</WindowTitle>
            <WindowButtons>
              <WindowMinimizeButton />
              <WindowMaximizeButton />
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>

          {/* Menu bar */}
          <div className="h-4 flex items-center gap-0 px-px bg-(--menu) text-(--menu-text)">
            <span className="px-1">Normal</span>
            <span className="px-1 text-(--gray-text)">Disabled</span>
            <span className="px-1 bg-(--menu-hilight) text-(--hilight-text)">Selected</span>
          </div>

          {/* Content area */}
          <WindowContent className="p-0.5 bg-(--button-face)">
            <div className="flex h-20 shadow-(--shadow-border-field)">
              <div className="flex-1 p-1 bg-(--window) text-(--window-text)">
                <span className="font-bold">Window Text</span>
              </div>
            </div>
          </WindowContent>
        </WindowFrame>
      </Window>

      {/* Message Box */}
      <Window active positioning="absolute" maximizable={false}>
        <WindowFrame className="top-26 left-18 w-52 min-w-0! min-h-0!">
          <WindowTitleBar>
            <WindowTitle>Message Box</WindowTitle>
            <WindowButtons>
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>

          <WindowContent className="flex flex-col items-center gap-2 bg-(--button-face)">
            <span className="text-(--button-text)">Message Text</span>
            <Button>Close message</Button>
          </WindowContent>
        </WindowFrame>
      </Window>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0">
        <Taskbar className="h-5.5">
          <Button
            tabIndex={-1}
            className="inline-flex items-center gap-0.5 h-4 min-h-0 min-w-0 px-1 py-0 leading-none"
          >
            <span className="font-bold">Start</span>
          </Button>
          <div className="flex-1" />
          <TaskbarNotificationArea className="h-4 px-1 mt-0">
            <TaskbarSystemClock className="mx-0" />
          </TaskbarNotificationArea>
        </Taskbar>
      </div>
    </div>
  )
}
