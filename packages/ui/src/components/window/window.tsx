import {
  WindowButtons,
  WindowCloseButton,
  WindowHelpButton,
  WindowMaximizeButton,
  WindowMinimizeButton,
} from './window-buttons'
import { WindowContent } from './window-content'
import { WindowFrame } from './window-frame'
import { WindowOverlay } from './window-overlay'
import { WindowPortal } from './window-portal'
// Compound component namespace
import { WindowProvider } from './window-provider'
import { WindowTitle } from './window-title'
import { WindowTitleBar } from './window-title-bar'

export {
  WindowButtons,
  WindowCloseButton,
  WindowHelpButton,
  WindowMaximizeButton,
  WindowMinimizeButton,
} from './window-buttons'
export type {
  WindowButtonsProps,
  WindowCloseButtonProps,
  WindowHelpButtonProps,
  WindowMaximizeButtonProps,
  WindowMinimizeButtonProps,
} from './window-buttons'

export { WindowContent } from './window-content'
export type { WindowContentProps } from './window-content'

export { useWindowContext } from './window-context'
export type { WindowActions, WindowContextValue, WindowMeta, WindowState } from './window-context'

export { WindowFrame } from './window-frame'
export type { WindowFrameProps } from './window-frame'

export { WindowOverlay } from './window-overlay'
export type { WindowOverlayProps } from './window-overlay'

export { WindowPortal } from './window-portal'
export type { WindowPortalProps } from './window-portal'

// Compound Window components
export { WindowProvider } from './window-provider'
export type { WindowProviderProps } from './window-provider'

export { WindowTitle } from './window-title'
export type { WindowTitleProps } from './window-title'

export { WindowTitleBar } from './window-title-bar'
export type { WindowTitleBarProps } from './window-title-bar'

export const Window = {
  Provider: WindowProvider,
  Portal: WindowPortal,
  Overlay: WindowOverlay,
  Frame: WindowFrame,
  TitleBar: WindowTitleBar,
  Title: WindowTitle,
  Buttons: WindowButtons,
  CloseButton: WindowCloseButton,
  MinimizeButton: WindowMinimizeButton,
  MaximizeButton: WindowMaximizeButton,
  HelpButton: WindowHelpButton,
  Content: WindowContent,
}
