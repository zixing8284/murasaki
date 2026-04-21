// Import standalone CSS entry - Vite/Tailwind will compile all used utility
// classes into dist/globals.css as a self-contained bundle
import './standalone.css'

// Button
export { Button } from './components/button/button'

// Checkbox
export { Checkbox, CheckboxLabel } from './components/checkbox/checkbox'

// Divider
export { Divider } from './components/divider/divider'
export type { DividerProps } from './components/divider/divider'

// Dropdown
export { Dropdown, DropdownNative } from './components/dropdown/dropdown'
export type { DropdownOption, DropdownProps } from './components/dropdown/dropdown'

// FieldPanel
export { FieldPanel } from './components/field-panel/field-panel'
export type { FieldPanelProps } from './components/field-panel/field-panel'

// GroupBox
export { GroupBox } from './components/group-box/group-box'

// Menu
export { Menu, MenuItem, MenuSeparator } from './components/menu/menu'
export type { MenuItemProps, MenuProps, MenuSeparatorProps } from './components/menu/menu'

// ContextMenu
export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  useContextMenu,
} from './components/context-menu/context-menu'
export type {
  ContextMenuContentProps,
  ContextMenuContextValue,
  ContextMenuProps,
  ContextMenuTriggerProps,
} from './components/context-menu/context-menu'

// NumberBox
export { NumberBox } from './components/number-box/number-box'

// OptionButton
export { OptionButton, OptionGroup } from './components/option-button/option-button'

// ProgressIndicator
export { ProgressIndicator } from './components/progress-indicator/progress-indicator'

// ScrollArea
export {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaLegacy,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  useScrollAreaContext,
  useScrollbar,
} from './components/scroll-area/scroll-area'
export type {
  ScrollAreaContextValue,
  ScrollAreaProps,
  UseScrollbarOptions,
} from './components/scroll-area/scroll-area'

// Slider
export { Slider } from './components/slider/slider'
export type { TickMark } from './components/slider/slider'

// SunkenPanel
export { SunkenPanel } from './components/sunken-panel/sunken-panel'
export type { SunkenPanelProps } from './components/sunken-panel/sunken-panel'

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

// Taskbar
export {
  Taskbar,
  TaskbarDivider,
  TaskbarNotificationArea,
  TaskbarQuickLaunch,
  TaskbarSystemClock,
} from './components/taskbar/taskbar'
export type {
  TaskbarDividerProps,
  TaskbarNotificationAreaProps,
  TaskbarProps,
  TaskbarQuickLaunchIcon,
  TaskbarQuickLaunchProps,
  TaskbarSystemClockProps,
} from './components/taskbar/taskbar'

// Tabs
export { Tab, TabList, TabPanel, Tabs, useTabsContext } from './components/tabs/tabs'
export type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsContextValue,
  TabsProps,
} from './components/tabs/tabs'

// TextBox
export { TextBox } from './components/text-box/text-box'

// Tooltip
export { Tooltip } from './components/tooltip/tooltip'
export type { TooltipProps } from './components/tooltip/tooltip'

// Theme
export { ThemeProvider, useTheme, themeIds } from './components/theme-provider/theme-provider'
export type { ThemeContextValue, ThemeId, ThemeProviderProps } from './components/theme-provider/theme-provider'
// TreeView
export { TreeView, TreeViewItem } from './components/tree-view/tree-view'
export type {
  TreeViewItemProps,
  TreeViewProps,
} from './components/tree-view/tree-view'

// Window compound components
export {
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowHelpButton,
  WindowMaximizeButton,
  WindowMenuBar,
  WindowMenuBarItem,
  WindowMinimizeButton,
  WindowOverlay,
  WindowPortal,
  WindowProvider,
  WindowResizeGrip,
  WindowStatusBar,
  WindowStatusBarField,
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
  WindowMenuBarItemProps,
  WindowMenuBarProps,
  WindowMinimizeButtonProps,
  WindowOverlayProps,
  WindowPortalProps,
  WindowProviderProps,
  WindowResizeGripProps,
  WindowStatusBarFieldProps,
  WindowStatusBarProps,
  WindowTitleBarProps,
  WindowTitleProps,
} from './components/window/window'

export { useWindowContext } from './components/window/window'
export type {
  WindowActions,
  WindowContextValue,
  WindowMeta,
  WindowState,
} from './components/window/window'
// Hooks
export { useDraggable } from './hooks/use-draggable'
export type { UseDraggableOptions } from './hooks/use-draggable'

export { useResizable } from './hooks/use-resizable'
export type { UseResizableOptions } from './hooks/use-resizable'
