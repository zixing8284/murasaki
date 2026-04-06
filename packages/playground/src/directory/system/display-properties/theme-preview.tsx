import type { ThemeId } from 'murasaki-react98'
import {
  Button,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowProvider,
  WindowTitle,
  WindowTitleBar,
} from 'murasaki-react98'

interface ThemePreviewProps {
  themeId: ThemeId
  gradientTitlebar?: boolean
}

export function ThemePreview({ themeId, gradientTitlebar = true }: ThemePreviewProps): React.ReactElement {
  return (
    <div
      className={`relative h-65 overflow-hidden border border-(--button-dk-shadow) bg-(--background) ${gradientTitlebar ? '' : 'no-gradient-titlebar'}`}
      data-theme={themeId === 'windows-98' ? undefined : themeId}
    >
      {/* Desktop icon */}
      <div className="absolute top-2 left-2 flex flex-col items-center gap-0.5">
        <img
          src="/img/desktop/RecyclingBin.png"
          alt="Trash"
          className="w-8 h-8 pixelated"
        />
        <span className="text-center text-(--desktop-text)">
          Trash
        </span>
      </div>

      {/* Inactive Window — with content area + scrollbar */}
      <WindowProvider active={false} positioning="absolute" maximizable={false}>
        <WindowFrame className="top-3 left-13 w-64 min-w-0! min-h-0!">
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
      </WindowProvider>

      {/* Active Window — overlaps Inactive, offset down-right */}
      <WindowProvider active positioning="absolute" maximizable={false}>
        <WindowFrame className="top-9 left-14 w-64 min-w-0! min-h-0!">
          <WindowTitleBar>
            <WindowTitle>Active Window</WindowTitle>
            <WindowButtons>
              <WindowMinimizeButton />
              <WindowMaximizeButton />
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>

          {/* Menu bar: Normal | Disabled | Selected */}
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
      </WindowProvider>

      {/* Message Box — overlaps Active Window content area */}
      <WindowProvider active positioning="absolute" maximizable={false}>
        <WindowFrame className="top-26 left-18 w-46 min-w-0! min-h-0!">
          <WindowTitleBar>
            <WindowTitle>Message Box</WindowTitle>
            <WindowButtons>
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>

          <WindowContent className="flex flex-col items-center gap-2 bg-(--button-face)">
            <span className="text-(--button-text)">Message Text</span>
            <Button>OK</Button>
          </WindowContent>
        </WindowFrame>
      </WindowProvider>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-5.5 flex items-center px-0.5 shadow-(--shadow-raised) bg-(--button-face)">
        <div className="h-4 px-1 flex items-center shadow-(--shadow-raised) bg-(--button-face) text-(--button-text)">
          <span>Start</span>
        </div>
        <div className="flex-1" />
        <div className="h-4 px-2 flex items-center text-(--button-text)">
          12:56
        </div>
      </div>
    </div>
  )
}
