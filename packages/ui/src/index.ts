'use client'

// Button
export { Button } from './components/button/button'
export type { ButtonProps } from './components/button/button'

// Checkbox
export { Checkbox } from './components/checkbox/checkbox'
export type { CheckboxProps } from './components/checkbox/checkbox'

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

// Divider
export { Divider } from './components/divider/divider'
export type { DividerProps } from './components/divider/divider'

// FieldPanel
export { FieldPanel } from './components/field-panel/field-panel'

export type { FieldPanelProps } from './components/field-panel/field-panel'
// GroupBox
export { GroupBox } from './components/group-box/group-box'
export type { GroupBoxProps } from './components/group-box/group-box'

// Label
export { Label } from './components/label/label'
export type { LabelProps } from './components/label/label'

// Layer
export { LayerProvider } from './components/layer/layer-provider'
export type { LayerProviderProps } from './components/layer/layer-provider'

// Menu
export {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from './components/menu/menu'
export type {
  MenuCheckboxItemProps,
  MenuItemProps,
  MenuLabelProps,
  MenuProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuShortcutProps,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
} from './components/menu/menu'

// NumberBox
export { NumberBox } from './components/number-box/number-box'
export type { NumberBoxProps } from './components/number-box/number-box'

// OptionButton
export { OptionButton, OptionGroup } from './components/option-button/option-button'
export type { OptionButtonProps, OptionGroupProps } from './components/option-button/option-button'

// ProgressIndicator
export { ProgressIndicator } from './components/progress-indicator/progress-indicator'
export type { ProgressIndicatorProps } from './components/progress-indicator/progress-indicator'

// ScrollArea
export { ScrollArea, ScrollAreaLegacy } from './components/scroll-area/scroll-area'
export type { ScrollAreaProps } from './components/scroll-area/scroll-area'

// Select
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectNative,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/select/select'
export type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectNativeProps,
  SelectProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from './components/select/select'
export type { SelectContextValue } from './components/select/select-context'

// Slider
export { Slider } from './components/slider/slider'
export type { SliderProps, TickMark } from './components/slider/slider'

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
export type { TableProps } from './components/table/table'

// Tabs
export { Tab, TabList, TabPanel, Tabs, useTabsContext } from './components/tabs/tabs'
export type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsContextValue,
  TabsProps,
} from './components/tabs/tabs'

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

// TextBox
export { TextBox } from './components/text-box/text-box'
export type { TextBoxProps } from './components/text-box/text-box'

// Theme
export { themeIds, themeLabels, ThemeProvider, useTheme } from './components/theme-provider/theme-provider'
export type { ThemeContextValue, ThemeId, ThemeProviderProps } from './components/theme-provider/theme-provider'

// Tooltip
export { Tooltip, TooltipContent, TooltipTrigger } from './components/tooltip/tooltip'
export type { TooltipContentProps, TooltipProps, TooltipTriggerProps } from './components/tooltip/tooltip'
export type { TooltipContextValue } from './components/tooltip/tooltip-context'
// TreeView
export { TreeView, TreeViewItem } from './components/tree-view/tree-view'
export type {
  TreeViewItemProps,
  TreeViewProps,
} from './components/tree-view/tree-view'

// Window (root + compound parts)
export {
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowHelpButton,
  WindowMaximizeButton,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowMinimizeButton,
  WindowOverlay,
  WindowPortal,
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
  WindowMenuBarContentProps,
  WindowMenuBarItemProps,
  WindowMenuBarMenuProps,
  WindowMenuBarProps,
  WindowMenuBarTriggerProps,
  WindowMinimizeButtonProps,
  WindowOverlayProps,
  WindowPortalProps,
  WindowProps,
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
