---
name: win98-shell
description: >
  Build Windows 98 desktop shell UIs from scratch. Covers the full design
  system (tokens, bevels, spacing, icons), component usage patterns, and
  desktop shell behaviors (window management, taskbar, menus, focus).
  Use when user says "build a win98 shell", "windows 98 desktop", "win98 UI",
  or wants to create retro desktop-style interfaces.
---

# Win98 Shell

Build Windows 98 desktop shells using `@murasaki-io/react98` (components) and `@murasaki-io/tokens` (platform-agnostic data).

## Quick Start

```tsx
// 1. CSS — Tailwind v4 consumers import the theme source
import '@murasaki-io/react98/theme.css'

// 2. Provider tree
import { ThemeProvider, LayerProvider } from '@murasaki-io/react98'

function App() {
  return (
    <ThemeProvider defaultTheme="windows-98">
      <LayerProvider>
        {/* Desktop shell goes here */}
      </LayerProvider>
    </ThemeProvider>
  )
}
```

The default `windows-98` theme applies automatically via `html` selector. Switch themes with `data-theme="<id>"` on `<html>` or use `ThemeProvider`.

## Visual Design Rules

Full token reference: [references/visual-system.md](references/visual-system.md)

### Colors — CSS variables only, never hardcode

```tsx
// ✅ Correct
<div className="bg-(--button-face) text-(--window-text)">...</div>

// ❌ Wrong
<div style={{ background: '#d4d0c8', color: '#000' }}>...</div>
```

### Bevels — the core Win98 visual pattern

| State | Class | Use for |
|-------|-------|---------|
| Resting / raised | `shadow-(--shadow-raised)` | Buttons, toolbars, window frames, menus |
| Pressed / active | `shadow-(--shadow-sunken)` | Active buttons, checked states |
| Input field | `shadow-(--shadow-border-field)` | Text inputs, selects, field panels |
| Primary button | `shadow-(--shadow-raised-primary)` | Default/OK buttons |

```tsx
// Raised button
<button className="bg-(--button-face) shadow-(--shadow-raised) ...">OK</button>

// Sunken when pressed
<button className="bg-(--button-face) shadow-(--shadow-sunken) ...">Pressed</button>

// Input field
<input className="bg-(--window) shadow-(--shadow-border-field) ..." />
```

### Spacing — use tokens, not arbitrary values

```tsx
// ✅
<div className="px-(--element-spacing) gap-(--label-spacing)">...</div>

// ❌
<div className="px-2 gap-1.5">...</div>
```

Tokens: `--element-spacing` (8px), `--label-spacing` (6px), `--grouped-button-spacing` (4px), `--grouped-element-spacing` (6px).

### Font — 11px default, do NOT override

The library's global font-size is 11px. Do not use `text-[10px]`, `text-xs`, `text-sm`, etc. unless the design explicitly requires a different size.

### Disabled text — classic Win98 etched effect

```tsx
<span className="text-(--gray-text) [text-shadow:1px_1px_0_var(--button-hilight)]">
  Disabled Label
</span>
```

### Focus — dotted outline

```tsx
className="focus-visible:outline-dotted focus-visible:outline-1 focus-visible:outline-(--button-text)"
```

### Icons — inline SVG with currentColor

```tsx
// ✅ Inline SVG, fill follows parent text color
<svg fill="none" viewBox="0 0 8 8" width={8} height={8}>
  <path d="..." fill="currentColor" fillRule="evenodd" />
</svg>

// ❌ Don't use icon libraries
<SomeIcon name="close" />
```

The tokens package (`@murasaki-io/tokens`) exports icon data for cross-platform use. On web, use the UI library's React SVG components directly.

## Component Assembly Guide

Full component catalog: [references/component-patterns.md](references/component-patterns.md)

### Window structure

```tsx
import {
  WindowFrame, WindowTitleBar, WindowTitleBarText,
  WindowButtons, WindowContent, WindowMenuBar,
  WindowStatusBar, WindowStatusBarField,
} from '@murasaki-io/react98'

<WindowFrame>
  <WindowTitleBar>
    <WindowTitleBarText>My App</WindowTitleBarText>
    <WindowButtons onClose={...} onMinimize={...} onMaximize={...} />
  </WindowTitleBar>
  <WindowMenuBar>
    {/* Menu triggers + dropdowns */}
  </WindowMenuBar>
  <WindowContent>
    {/* App content */}
  </WindowContent>
  <WindowStatusBar>
    <WindowStatusBarField>Ready</WindowStatusBarField>
  </WindowStatusBar>
</WindowFrame>
```

### Form layout

```tsx
import { GroupBox, Button, Checkbox, TextBox, Select } from '@murasaki-io/react98'

<GroupBox label="Settings">
  <div className="flex flex-col gap-(--label-spacing)">
    <label className="flex items-center gap-(--label-spacing)">
      Name:
      <TextBox placeholder="Enter name" />
    </label>
    <Checkbox onCheckedChange={...}>Enable feature</Checkbox>
    <div className="flex gap-(--grouped-button-spacing)">
      <Button primary>OK</Button>
      <Button>Cancel</Button>
    </div>
  </div>
</GroupBox>
```

### Menu bar

```tsx
import {
  WindowMenuBar, WindowMenuBarTrigger, WindowMenuBarContent,
  MenuItem, MenuSeparator,
} from '@murasaki-io/react98'

<WindowMenuBar>
  <WindowMenuBarTrigger>
    File
    <WindowMenuBarContent>
      <MenuItem onSelect={...}>New</MenuItem>
      <MenuItem onSelect={...}>Open</MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={...}>Exit</MenuItem>
    </WindowMenuBarContent>
  </WindowMenuBarTrigger>
</WindowMenuBar>
```

### Context menu

```tsx
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, MenuItem } from '@murasaki-io/react98'

<ContextMenu>
  <ContextMenuTrigger asChild>
    <div>Right-click me</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <MenuItem onSelect={...}>Cut</MenuItem>
    <MenuItem onSelect={...}>Copy</MenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@murasaki-io/react98'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Size</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected onClick={...}>
      <TableCell>file.txt</TableCell>
      <TableCell>1 KB</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Desktop Shell Architecture

Full architecture reference: [references/desktop-behavior.md](references/desktop-behavior.md)

### Provider tree

```tsx
<ThemeProvider>
  <DesktopFilesProvider>
    <DesktopLayoutProvider>
      <ProcessProvider>
        <SystemCursorProvider>
          <LayerProvider>
            <ScreenBoundaryContext value={screenRef}>
              <Shell />
            </ScreenBoundaryContext>
          </LayerProvider>
        </SystemCursorProvider>
      </ProcessProvider>
    </DesktopLayoutProvider>
  </DesktopFilesProvider>
</ThemeProvider>
```

### Process system (window management)

Uses a **split-context pattern**:
- `ProcessStateContext` — reactive, triggers re-renders
- `ProcessActionsContext` — stable, never triggers re-renders

```tsx
import { useProcessActions, useProcessList } from './contexts/process'

// Actions-only (no re-render on state change) — use in buttons, handlers
const { open, close, activate, minimize } = useProcessActions()

// Full state — use when you need the process list
const processes = useProcessList()
```

### Window lifecycle

| Action | What happens |
|--------|-------------|
| `open(appId)` | Creates process, appends to stackOrder, becomes foreground |
| `close(id)` | Removes from processes + stackOrder, picks next foreground |
| `activate(id)` | Un-minimizes, moves to top of stackOrder, becomes foreground |
| `minimize(id)` | Sets minimized, picks next foreground if it was active |
| `toggleMaximize(id)` | Flips maximized state |
| `handleTaskbarClick(id)` | 3-way toggle: minimized→restore, foreground→minimize, background→activate |

### Z-order

Derived from `stackOrder` array position: `zIndex = stackOrder.indexOf(id) + 1`. Last element = topmost. No explicit z-index numbers.

### App registration

```tsx
// directory.ts
const appDirectory: Record<string, ProcessDirectoryEntry> = {
  'notepad': {
    name: 'Notepad',
    Component: lazy(() => import('./notepad')),
    defaultTitle: 'Untitled - Notepad',
    icon: { sm: '/icons/notepad-16.png', lg: '/icons/notepad-32.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 640, height: 480 },
    window: 'default',
  },
}
```

### Taskbar structure

```
[Start] [QuickLaunch | RunningTasks | NotificationArea | Clock]
```

- **RunningTasks**: one `<Button>` per non-ephemeral process, active = sunken
- **NotificationArea**: system tray icons (volume, network, clock)
- **Start button**: toggles StartMenu positioned above taskbar

### Desktop icon grid

- CSS Grid: 72px columns, 68px rows, column-first auto-fill
- Two positioning tiers: explicit (localStorage `{col, row}`) + CSS auto-placement
- Rubber-band selection with Ctrl/Meta for additive
- Drag with grid snapping and collision avoidance

## Anti-patterns

| ❌ Don't | ✅ Do instead |
|----------|-------------|
| Hardcode colors `style={{ background: '#d4d0c8' }}` | Use CSS variables `className="bg-(--button-face)"` |
| `createPortal(children, document.body)` for popups | Use `LayerProvider` / scoped layer portals |
| `text-[12px]` or `text-sm` | Rely on the 11px default |
| `z-index: 9999` | Use the layer system tokens |
| Arbitrary spacing `p-[7px]` | Use `p-(--element-spacing)` |
| Icon libraries (lucide, heroicons) | Inline SVG with `currentColor` |
| Mutate refs during render | Update in `useLayoutEffect` or `useEffect` |
| Single context for process state + actions | Split into `ProcessStateContext` + `ProcessActionsContext` |
