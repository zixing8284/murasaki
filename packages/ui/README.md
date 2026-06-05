# @murasaky/react98

> Windows 98 UI components for React — pixel-perfect nostalgia meets modern tooling.

**22 components · 19 themes · React 19 · TypeScript · Tailwind CSS v4**

[![npm](https://img.shields.io/npm/v/@murasaky/react98)](https://www.npmjs.com/package/@murasaky/react98)
[![license](https://img.shields.io/npm/l/@murasaky/react98)](./LICENSE)

---

Bring the classic Windows 98 aesthetic to your React app — sunken borders, raised buttons, beveled panels, and all 19 original color schemes. Built with Tailwind CSS v4 design tokens so every detail is themeable.

**[→ Live demo & full docs](https://zixing8284.github.io/murasaki/programs/docs)**

---

## Install

```bash
# npm
npm install @murasaky/react98

# pnpm
pnpm add @murasaky/react98

# yarn
yarn add @murasaky/react98
```

---

## Get started in 2 minutes

### Without Tailwind CSS

Import the pre-built stylesheet and you're ready to go:

```tsx
import { ThemeProvider, Button, TextBox } from '@murasaky/react98'
import '@murasaky/react98/globals.css'

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
@source '../node_modules/@murasaky/react98/dist';
@import '@murasaky/react98/theme.css';
```

Then use components the same way — no separate CSS import needed in your JS files:

```tsx
import { ThemeProvider, Button } from '@murasaky/react98'

export default function App() {
  return (
    <ThemeProvider>
      <Button>Hello, 1998</Button>
    </ThemeProvider>
  )
}
```

> Adjust the `@source` path to be relative to your CSS file's location.

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
| `Window` | Draggable and resizable window shell |
| `Taskbar` | Desktop taskbar with quick-launch |
| `ThemeProvider` | Theme context root |
| `LayerProvider` | Scoped floating layer portal |

---

## 19 Themes

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
@import '@murasaky/react98/themes/marine.css';
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

Build a full desktop shell with draggable, resizable windows:

```tsx
import { Window, LayerProvider } from '@murasaky/react98'

function Desktop() {
  return (
    <div className="relative isolate overflow-hidden w-screen h-screen">
      <LayerProvider>
        <Window title="My Document" defaultPosition={{ x: 80, y: 60 }}>
          <p>Hello from 1998!</p>
        </Window>
      </LayerProvider>
    </div>
  )
}
```

Wrap your desktop surface in `LayerProvider` so menus, tooltips, and window portals render inside your shell instead of leaking to `document.body`.

---

## Hooks

Two hooks are available for custom drag and resize interactions:

```tsx
import { useDraggable, useResizable } from '@murasaky/react98'
```

---

## Requirements

- React 19+
- Tailwind CSS v4 (optional — `globals.css` works without it)

---

## License

MIT
