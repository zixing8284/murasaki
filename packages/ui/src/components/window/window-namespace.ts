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
import { WindowProvider } from './window-provider'
import { WindowResizeGrip } from './window-resize-grip'
import { WindowTitle } from './window-title'
import { WindowTitleBar } from './window-title-bar'

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
  ResizeGrip: WindowResizeGrip,
}
