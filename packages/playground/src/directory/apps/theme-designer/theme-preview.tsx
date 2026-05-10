import type { CSSProperties } from 'react'
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
} from '@murasaki/react98'
import { useMemo } from 'react'
import { PreviewTaskbar } from '../../shared/preview-taskbar'

interface DesignerPreviewProps {
  colors: Record<string, string>
}

export function DesignerPreview({ colors }: DesignerPreviewProps): React.ReactElement {
  // Build inline CSS custom properties from color map
  const style = useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(colors)) {
      vars[`--${key}`] = value
    }
    return vars as CSSProperties
  }, [colors])

  return (
    <div
      className="relative h-full overflow-hidden border border-(--button-dk-shadow) bg-(--background)"
      style={style}
    >
      {/* Desktop icon */}
      <div className="absolute top-2 left-2 flex flex-col items-center gap-0.5">
        <img
          src="/img/desktop/RecyclingBin.png"
          alt="Trash"
          className="w-8 h-8 pixelated"
          draggable={false}
        />
        <span className="text-center text-(--desktop-text)">
          Trash
        </span>
      </div>

      {/* Inactive Window */}
      <WindowProvider active={false} positioning="absolute" maximizable={false}>
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
            <div className="flex h-24 shadow-(--shadow-border-field)">
              <div className="flex-1 bg-(--window)" />
            </div>
          </WindowContent>
        </WindowFrame>
      </WindowProvider>

      {/* Active Window */}
      <WindowProvider active positioning="absolute" maximizable={false}>
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
            <div className="flex h-16 shadow-(--shadow-border-field)">
              <div className="flex-1 p-1 bg-(--window) text-(--window-text)">
                <span className="font-bold">Window Text</span>
              </div>
            </div>
          </WindowContent>
        </WindowFrame>
      </WindowProvider>

      {/* Message Box */}
      <WindowProvider active positioning="absolute" maximizable={false}>
        <WindowFrame className="top-24 left-18 w-48 min-w-0! min-h-0!">
          <WindowTitleBar>
            <WindowTitle>Message Box</WindowTitle>
            <WindowButtons>
              <WindowCloseButton />
            </WindowButtons>
          </WindowTitleBar>

          <WindowContent className="flex flex-col items-center gap-1.5 bg-(--button-face)">
            <span className="text-(--button-text)">Message Text</span>
            <Button>OK</Button>
          </WindowContent>
        </WindowFrame>
      </WindowProvider>

      {/* Tooltip */}
      <div
        className="absolute top-21 left-42 border bg-(--info-window) border-(--window-frame) px-1 py-0.5 text-(--info-text)"
      >
        Tooltip
      </div>

      <PreviewTaskbar />
    </div>
  )
}
