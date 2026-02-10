// Import global styles - Vite will process and output to dist/globals.css
import './globals.css'

export { Button } from './components/button/button'
export { OptionButton } from './components/option-button/option-button'
export { OptionGroup } from './components/option-button/option-group'
export { TextBox } from './components/text-box/text-box'

// Window compound components
export {
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
  WindowButtonsProps,
  WindowCloseButtonProps,
  WindowContentProps,
  WindowFrameProps,
  WindowHelpButtonProps,
  WindowMaximizeButtonProps,
  WindowMinimizeButtonProps,
  WindowOverlayProps,
  WindowPortalProps,
  WindowProviderProps,
  WindowTitleBarProps,
  WindowTitleProps,
} from './components/window/window'
export { useWindowContext } from './components/window/window-context'
export type {
  WindowActions,
  WindowContextValue,
  WindowMeta,
  WindowState,
} from './components/window/window-context'
export { Window } from './components/window/window-namespace'

// Hooks
export { useDraggable } from './hooks/use-draggable'
export type { UseDraggableOptions } from './hooks/use-draggable'
