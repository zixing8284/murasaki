import type { ThemeId } from '@murasaki/react98'
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
import { assetPath } from '../../../lib/asset-path'
import { THEME_PREVIEW_RECYCLE_BIN } from '../../../lib/playground-assets'
import { PreviewTaskbar } from '../../shared/preview-taskbar'

interface ThemePreviewProps {
  themeId: ThemeId
  gradientTitlebar?: boolean
}

export function ThemePreview({ themeId, gradientTitlebar = true }: ThemePreviewProps): React.ReactElement {
  return (
    <div
      className={`relative h-65 overflow-hidden border border-(--button-dk-shadow) bg-(--background) ${gradientTitlebar ? '' : '[--gradient-active-title:var(--active-title)] [--gradient-inactive-title:var(--inactive-title)]'}`}
      data-theme={themeId}
    >
      {/* Desktop icon */}
      <div className="absolute top-2 left-2 flex flex-col items-center gap-0.5">
        <img
          src={assetPath(THEME_PREVIEW_RECYCLE_BIN)}
          alt="Trash"
          className="w-8 h-8 pixelated"
        />
        <span className="text-center text-(--desktop-text)">
          Trash
        </span>
      </div>

      {/* Inactive Window — with content area + scrollbar */}
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
            <div className="flex h-28 shadow-(--shadow-border-field)">
              <div className="flex-1 bg-(--window)" />
            </div>
          </WindowContent>
        </WindowFrame>
      </WindowProvider>

      {/* Active Window — overlaps Inactive, offset down-right */}
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
      </WindowProvider>

      <PreviewTaskbar />
    </div>
  )
}
