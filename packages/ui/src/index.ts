// Import global styles - Vite will process and output to dist/globals.css
import './globals.css'

// Button
export { Button } from './components/button/button'

// Checkbox
export { Checkbox, CheckboxLabel } from './components/checkbox/checkbox'

// Dropdown
export { Dropdown } from './components/dropdown/dropdown'
export type { DropdownProps } from './components/dropdown/dropdown'
export { DropdownNative } from './components/dropdown/dropdown-native'
export type { DropdownOption } from './components/dropdown/use-dropdown-state'

// GroupBox
export { GroupBox } from './components/group-box/group-box'

// NumberBox
export { NumberBox } from './components/number-box/number-box'

// OptionButton
export { OptionButton } from './components/option-button/option-button'
export { OptionGroup } from './components/option-button/option-group'

// ProgressIndicator
export { ProgressIndicator } from './components/progress-indicator/progress-indicator'

// Slider
export { Slider } from './components/slider/slider'
export type { TickMark } from './components/slider/slider'

// Table
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './components/table/table'

// Tabs
export { Tab, TabList, TabPanel, TabsRoot } from './components/tabs/tabs'
export type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsRootProps,
} from './components/tabs/tabs'
export { Tabs } from './components/tabs/tabs-namespace'

// TextBox
export { TextBox } from './components/text-box/text-box'

// TreeView
export { TreeViewItem, TreeViewRoot } from './components/tree-view/tree-view'
export type {
  TreeViewItemProps,
  TreeViewProps,
} from './components/tree-view/tree-view'
export { TreeView } from './components/tree-view/tree-view-namespace'

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
