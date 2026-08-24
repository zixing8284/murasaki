# @murasaki-io/react98

> Windows 98 UI components for React — pixel-perfect nostalgia meets modern tooling.

[![npm](https://img.shields.io/npm/v/@murasaki-io/react98)](https://www.npmjs.com/package/@murasaki-io/react98)
[![license](https://img.shields.io/npm/l/@murasaki-io/react98)](./LICENSE)

---

Bring the classic Windows 98 aesthetic to your React app — sunken borders, raised buttons, beveled panels, and all 19 original color schemes. Built with Tailwind CSS v4 design tokens so every detail is themeable.

**[→ Live demo & full docs](https://zixing8284.github.io/murasaki)**

---

## Install

```bash
# npm
npm install @murasaki-io/react98

# pnpm
pnpm add @murasaki-io/react98

# yarn
yarn add @murasaki-io/react98
```

---

## Get started in 2 minutes

### Without Tailwind CSS

Import the pre-built stylesheet and you're ready to go:

```tsx
import { ThemeProvider, Button, TextBox } from '@murasaki-io/react98'
import '@murasaki-io/react98/globals.css'

export default function App() {
  return (
    <ThemeProvider>
      <Button>Click me</Button>
      <TextBox placeholder="Type here…" />
    </ThemeProvider>
  )
}
```

### With Tailwind CSS v4

Point Tailwind at the package dist so component utilities get included, then import the theme:

```css
/* app.css */
@source '../node_modules/@murasaki-io/react98/dist';
@import '@murasaki-io/react98/theme.css';
```

Then use components the same way — no separate CSS import needed in your JS files:

```tsx
import { ThemeProvider, Button } from '@murasaki-io/react98'

export default function App() {
  return (
    <ThemeProvider>
      <Button>Hello, 1998</Button>
    </ThemeProvider>
  )
}
```

> Adjust the `@source` path to be relative to your CSS file's location.

### `globals.css` vs `theme.css`

| Entry | What it is | Use when |
|---|---|---|
| `@murasaki-io/react98/globals.css` | Pre-compiled bundle: theme tokens + **the library's own component utilities**, already expanded to plain CSS. | You are **not** using Tailwind — just import it and go. |
| `@murasaki-io/react98/theme.css` | Tailwind CSS v4 *source*: design tokens, theme skins, and `@import "tailwindcss"`. | You **are** using Tailwind v4 — pair it with `@source` so your build compiles the utilities. |

`globals.css` only carries the classes the components themselves use — it does **not** include general-purpose Tailwind utilities (e.g. `w-screen`, `flex`, `gap-2`). If you skip Tailwind, layout the *rest* of your app with your own CSS (or set up Tailwind v4 separately).

---

## Components

All 22 components ship with full keyboard navigation and ARIA semantics.

| Component | Description |
|---|---|
| `Button` | Raised push button with active/disabled states |
| `Checkbox` | Classic checkbox with label |
| `OptionButton` | Radio-style option button |
| `TextBox` | Single-line text input |
| `NumberBox` | Numeric input with spin controls |
| `Select` | Dropdown select (custom + native variants) |
| `Slider` | Horizontal/vertical range slider |
| `ProgressIndicator` | Progress bar |
| `Tabs` | Tabbed panel container |
| `Menu` | Menubar with nested submenus |
| `ContextMenu` | Right-click context menu |
| `Tooltip` | Hover tooltip |
| `ScrollArea` | Scrollable container with Win98 scrollbars |
| `Table` | Data table in a sunken frame |
| `TreeView` | Collapsible tree list |
| `FieldPanel` | Labeled field group |
| `GroupBox` | Named box for grouping controls |
| `Divider` | Horizontal or vertical separator |
| `Window` | Ready-to-use draggable & resizable window shell (title + content) |
| `Taskbar` | Desktop taskbar with quick-launch |
| `ThemeProvider` | Theme context root |
| `LayerProvider` | Scoped floating layer portal |

The `Window` suite is actually a small family: `Window` is the convenience shell, while `WindowProvider`, `WindowFrame`, `WindowTitleBar`, `WindowContent`, `WindowMenuBar*`, `WindowStatusBar`, `WindowResizeGrip`, and `WindowPortal` are the composable primitives you can use for full control. See [Windows and floating layers](#windows-and-floating-layers) below.

---

## Themes

Switch themes at runtime — no page reload needed:

```tsx
<ThemeProvider defaultTheme="slate">
  {/* your app */}
</ThemeProvider>
```

| Group | Themes |
|---|---|
| Windows classics | `windows-98` *(default)*, `windows-95`, `windows-standard` |
| Hand-tuned | `rainy-day`, `rose`, `slate`, `spruce`, `desert` |
| Community ports | `brick`, `eggplant`, `lilac`, `maple`, `marine`, `plum`, `pumpkin`, `red-white-and-blue`, `storm`, `teal`, `wheat` |

Each theme is also available as a standalone CSS file for lean bundles:

```css
@import '@murasaki-io/react98/themes/marine.css';
```

---

## Controlled & uncontrolled

Every stateful component supports both patterns. Pass an initial value to let the component manage its own state, or wire it up to yours:

```tsx
{/* Uncontrolled */}
<Checkbox defaultChecked>Remember me</Checkbox>

{/* Controlled — React setters drop right in */}
<Checkbox checked={agreed} onCheckedChange={setAgreed}>
  I agree to the terms
</Checkbox>

<TextBox value={query} onValueChange={setQuery} placeholder="Search…" />

<Slider value={volume} onValueChange={setVolume} min={0} max={100} />
```

---

## Windows and floating layers

Build a full desktop shell with a draggable, resizable window:

```tsx
import { Window, LayerProvider } from '@murasaki-io/react98'

function Desktop() {
  return (
    <div className="relative isolate overflow-hidden w-screen h-screen">
      <LayerProvider>
        <Window
          title="My Document"
          defaultPosition={{ x: 80, y: 60 }}
          defaultSize={{ width: 480, height: 320 }}
          onClose={() => {/* remove window */}}
        >
          <p>Hello from 1998!</p>
        </Window>
      </LayerProvider>
    </div>
  )
}
```

`Window` wires up drag (via the title bar) and resize (via the bottom-right grip) for you. It accepts `defaultPosition` / `defaultSize` / `draggable` / `resizable` (both on by default) plus `active`, `minimized`, `defaultMaximized`, `minimizable`, `maximizable`, `closable`, `positioning`, `container`, and `onClose` / `onMinimize`.

Wrap your desktop surface in `LayerProvider` so menus, tooltips, and window portals render inside your shell instead of leaking to `document.body`. Without it, floating layers (submenus, context menus, tooltips, default window portals) fall back to `document.body`, which breaks `overflow: hidden` / `isolation` shells and z-index isolation.

### Build a complete window from primitives

For menu bars, status bars, custom chrome, or portals into a window manager, compose the primitives directly:

```tsx
import {
  WindowProvider,
  WindowFrame,
  WindowTitleBar,
  WindowTitle,
  WindowButtons,
  WindowMinimizeButton,
  WindowMaximizeButton,
  WindowCloseButton,
  WindowMenuBar,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowMenuBarContent,
  WindowContent,
  WindowStatusBar,
  WindowStatusBarField,
  WindowResizeGrip,
  useDraggable,
  useResizable,
  MenuItem,
} from '@murasaki-io/react98'

function MyWindow() {
  const { setTargetRef: setDragTarget, setDragRef, dragging } = useDraggable<HTMLDivElement, HTMLDivElement>()
  const { setTargetRef: setResizeTarget, setResizeRef, resizing } = useResizable<HTMLDivElement, HTMLDivElement>({ minWidth: 320, minHeight: 200 })

  const setFrameRef = (el: HTMLDivElement | null) => {
    setDragTarget(el)
    setResizeTarget(el)
  }

  return (
    <WindowProvider positioning="absolute">
      <WindowFrame ref={setFrameRef} style={{ left: 80, top: 60, width: 480, height: 320 }}>
        <WindowTitleBar ref={setDragRef}>
          <WindowTitle>Notepad 98</WindowTitle>
          <WindowButtons>
            <WindowMinimizeButton />
            <WindowMaximizeButton />
            <WindowCloseButton />
          </WindowButtons>
        </WindowTitleBar>
        <WindowMenuBar>
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger>File</WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem reserveIconSpace>New</MenuItem>
              <MenuItem reserveIconSpace>Open…</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
        <WindowContent className="p-2">Your app content</WindowContent>
        <WindowStatusBar>
          <WindowStatusBarField>Ready</WindowStatusBarField>
        </WindowStatusBar>
        <WindowResizeGrip ref={setResizeRef} />
      </WindowFrame>
    </WindowProvider>
  )
}
```

The mental model behind these pieces:

- `left` / `top` (and `width` / `height`) are **static inline styles** you set once for the initial layout.
- Dragging adds a `translate()` **transform** on top of the base position (`useDraggable`), and re-clamps to the container/viewport.
- Resizing **overwrites the inline `width` / `height`** (`useResizable`).
- `WindowResizeGrip` is the visual grip; wire it to `setResizeRef`. `useDraggable`'s mousedown ignores clicks on `button` / `a` / `input` elements so the title-bar buttons still work.

---

## Hooks

Two hooks are available for custom drag and resize interactions:

```tsx
import { useDraggable, useResizable } from '@murasaki-io/react98'
```

- `useDraggable` moves a target element via CSS `translate()` when a handle is dragged. Attach `setTargetRef` to the movable element and `setDragRef` to the drag handle.
- `useResizable` resizes a target element by writing inline `width` / `height` when a handle is dragged. Attach `setTargetRef` to the element and `setResizeRef` to the resize handle.

Both accept a `container` boundary element (defaults to the viewport) and `draggable` / `resizable` toggles.

---

## Requirements

- React 19+
- Tailwind CSS v4 (optional — `globals.css` works without it)

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and breaking changes.

---

## License

MIT
