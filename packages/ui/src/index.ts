// Import global styles - Vite will process and output to dist/globals.css
import './globals.css'

export { Button } from './components/button/button'
export { OptionButton } from './components/option-button/option-button'
export { OptionGroup } from './components/option-button/option-group'
export { TextBox } from './components/text-box/text-box'

// Window compound components
export {
  useWindowContext,
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowHelpButton,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowOverlay,
  WindowPortal,
  WindowProvider,
  WindowTitle,
  WindowTitleBar,
} from './components/window/window'
export type {
  WindowActions,
  WindowButtonsProps,
  WindowCloseButtonProps,
  WindowContentProps,
  WindowContextValue,
  WindowFrameProps,
  WindowHelpButtonProps,
  WindowMaximizeButtonProps,
  WindowMeta,
  WindowMinimizeButtonProps,
  WindowOverlayProps,
  WindowPortalProps,
  WindowProviderProps,
  WindowState,
  WindowTitleBarProps,
  WindowTitleProps,
} from './components/window/window'
