# @murasaky/react98

A Windows 98-themed React UI component library.

## Installation

```bash
pnpm add @murasaky/react98
```

## Quick Start

Wrap your app with `ThemeProvider` and render components. How you load styles depends on your stack.

### Without Tailwind CSS

Import the pre-compiled stylesheet in your app entry:

```tsx
import { ThemeProvider, Button } from '@murasaky/react98'
import '@murasaky/react98/globals.css'

function App() {
  return (
    <ThemeProvider>
      <Button>Click me</Button>
    </ThemeProvider>
  )
}
```

### With Tailwind CSS v4

Add the package dist as a Tailwind source and import the source theme in your app stylesheet:

```css
/* Tailwind v4 skips node_modules by default. Point it at the built package so
   the utilities used by @murasaky/react98 components are included in your output. */
@source '../node_modules/@murasaky/react98/dist';
@import '@murasaky/react98/theme.css';
```

Adjust the `@source` path to be relative to your CSS file's location.

Then render components the same way — no separate CSS import is needed in your JS:

```tsx
import { ThemeProvider, Button } from '@murasaky/react98'

function App() {
  return (
    <ThemeProvider>
      <Button>Click me</Button>
    </ThemeProvider>
  )
}
```

## Themes

The library ships 19 named skins. `windows-98` is applied by default; switch via `ThemeProvider`:

```tsx
<ThemeProvider defaultTheme="slate">
  {/* your app */}
</ThemeProvider>
```

**Windows classics:** `windows-98` (default), `windows-95`, `windows-standard`.

**Hand-tuned palettes:** `rainy-day`, `rose`, `slate`, `spruce`, `desert`.

**Ported from `nielssp/classic-stylesheets`:** `brick`, `eggplant`, `lilac`, `maple`, `marine`, `plum`, `pumpkin`, `red-white-and-blue`, `storm`, `teal`, `wheat`.

Each named skin is also exported as a standalone stylesheet at `@murasaky/react98/themes/<id>.css` (e.g. `@murasaky/react98/themes/marine.css`). The default `theme.css` and pre-built `globals.css` already bundle every skin; the per-skin exports exist for advanced setups that want to assemble a trimmed bundle.

## API Basics

Stateful components support controlled and uncontrolled usage with paired props such as `value` / `defaultValue` and `checked` / `defaultChecked`.

Library-owned state changes use value-level callbacks so React setters can be passed directly:

```tsx
<Checkbox checked={checked} onCheckedChange={setChecked}>
  Remember me
</Checkbox>

<TextBox value={name} onValueChange={setName} />
```

Native event names remain available on native controls such as `SelectNative` and raw DOM inputs.

## Scoped Floating Layers

If your app shell has its own stacking context, visual overlay, or framed desktop surface, wrap that area in `LayerProvider` so menus, context menus, tooltips, and default window portals stay inside the shell instead of competing in the global `document.body` z-index namespace:

```tsx
import { LayerProvider } from '@murasaky/react98'

function Shell() {
  return (
    <div className="relative isolate overflow-hidden">
      <LayerProvider>
        <Desktop />
      </LayerProvider>
    </div>
  )
}
```

## License

MIT
