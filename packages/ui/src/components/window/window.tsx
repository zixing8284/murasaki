/* eslint-disable react-refresh/only-export-components */

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

export { Window } from './window-component'
export type {
  WindowPosition,
  WindowProps,
  WindowSize,
} from './window-component'

export { WindowContent } from './window-content'
export type { WindowContentProps } from './window-content'

export { useWindowContext } from './window-context'
export type {
  WindowActions,
  WindowContextValue,
  WindowMeta,
  WindowState,
} from './window-context'

export { WindowFrame } from './window-frame'
export type { WindowFrameProps } from './window-frame'

export {
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from './window-menu-bar'
export type {
  WindowMenuBarContentProps,
  WindowMenuBarItemProps,
  WindowMenuBarMenuProps,
  WindowMenuBarProps,
  WindowMenuBarTriggerProps,
} from './window-menu-bar'

export { WindowOverlay } from './window-overlay'
export type { WindowOverlayProps } from './window-overlay'

export { WindowPortal } from './window-portal'
export type { WindowPortalProps } from './window-portal'

// Compound Window components
export { WindowProvider } from './window-provider'
export type { WindowProviderProps } from './window-provider'

export { WindowResizeGrip } from './window-resize-grip'
export type { WindowResizeGripProps } from './window-resize-grip'

export { WindowStatusBar, WindowStatusBarField } from './window-status-bar'
export type { WindowStatusBarFieldProps, WindowStatusBarProps } from './window-status-bar'

export { WindowTitle } from './window-title'
export type { WindowTitleProps } from './window-title'

export { WindowTitleBar } from './window-title-bar'
export type { WindowTitleBarProps } from './window-title-bar'
