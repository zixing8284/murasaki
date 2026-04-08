// Import standalone CSS entry - Vite/Tailwind will compile all used utility
// classes into dist/globals.css as a self-contained bundle
import './standalone.css'

// Button
export { Button } from './components/button/button'

// Checkbox
export { Checkbox, CheckboxLabel } from './components/checkbox/checkbox'

// Dropdown
export { Dropdown } from './components/dropdown/dropdown'
export type { DropdownProps } from './components/dropdown/dropdown'
export { DropdownNative } from './components/dropdown/dropdown-native'
export type { DropdownOption } from './components/dropdown/use-dropdown-state'

// FieldPanel
export { FieldPanel } from './components/field-panel/field-panel'
export type { FieldPanelProps } from './components/field-panel/field-panel'

// GroupBox
export { GroupBox } from './components/group-box/group-box'

// Menu
export { Menu, MenuItem, MenuSeparator } from './components/menu/menu'
export type { MenuItemProps, MenuProps, MenuSeparatorProps } from './components/menu/menu'

// NumberBox
export { NumberBox } from './components/number-box/number-box'

// OptionButton
export { OptionButton } from './components/option-button/option-button'
export { OptionGroup } from './components/option-button/option-group'

// ProgressIndicator
export { ProgressIndicator } from './components/progress-indicator/progress-indicator'

// ScrollArea
export { ScrollArea, ScrollAreaLegacy } from './components/scroll-area/scroll-area'
export type { ScrollAreaProps } from './components/scroll-area/scroll-area'
export { useScrollAreaContext } from './components/scroll-area/scroll-area'
export type { ScrollAreaContextValue } from './components/scroll-area/scroll-area'
export { ScrollAreaScrollbar } from './components/scroll-area/scroll-area-scrollbar'
export { ScrollAreaThumb } from './components/scroll-area/scroll-area-thumb'
export { ScrollAreaCorner } from './components/scroll-area/scroll-area-corner'
export { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './components/scroll-area/scroll-area-icons'
export { useScrollbar } from './components/scroll-area/use-scrollbar'
export type { UseScrollbarOptions } from './components/scroll-area/use-scrollbar'

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
export { Taskbar } from './components/taskbar/taskbar'
export type { TaskbarProps } from './components/taskbar/taskbar'
export { TaskbarDivider } from './components/taskbar/taskbar-divider'
export type { TaskbarDividerProps } from './components/taskbar/taskbar-divider'
export { TaskbarNotificationArea } from './components/taskbar/taskbar-notification-area'
export type { TaskbarNotificationAreaProps } from './components/taskbar/taskbar-notification-area'
export { TaskbarQuickLaunch } from './components/taskbar/taskbar-quick-launch'
export type { TaskbarQuickLaunchIcon, TaskbarQuickLaunchProps } from './components/taskbar/taskbar-quick-launch'
export { TaskbarSystemClock } from './components/taskbar/taskbar-system-clock'
export type { TaskbarSystemClockProps } from './components/taskbar/taskbar-system-clock'

// Tabs
export { Tab, TabList, TabPanel, Tabs } from './components/tabs/tabs'
export type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsProps,
} from './components/tabs/tabs'

export { useTabsContext } from './components/tabs/tabs-context'
export type { TabsContextValue } from './components/tabs/tabs-context'

// TextBox
export { TextBox } from './components/text-box/text-box'

// Theme
export { useTheme } from './components/theme-provider/theme-context'
export type { ThemeContextValue } from './components/theme-provider/theme-context'

// Theme
export { themeIds } from './components/theme-provider/theme-context'
export type { ThemeId } from './components/theme-provider/theme-context'

export { ThemeProvider } from './components/theme-provider/theme-provider'
export type { ThemeProviderProps } from './components/theme-provider/theme-provider'
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

export { useWindowContext } from './components/window/window-context'
export type {
  WindowActions,
  WindowContextValue,
  WindowMeta,
  WindowState,
} from './components/window/window-context'
// Hooks
export { useDraggable } from './hooks/use-draggable'
export type { UseDraggableOptions } from './hooks/use-draggable'

export { useResizable } from './hooks/use-resizable'
export type { UseResizableOptions } from './hooks/use-resizable'
