# @murasaki/react98

A Windows 98-themed React UI component library.

## Installation

```bash
pnpm add @murasaki/react98
```

## Quick Start

Wrap your app with `ThemeProvider` and render components. How you load styles depends on your stack.

### Without Tailwind CSS

Import the pre-compiled stylesheet in your app entry:

```tsx
import { ThemeProvider, Button } from '@murasaki/react98'
import '@murasaki/react98/globals.css'

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
   the utilities used by @murasaki/react98 components are included in your output. */
@source '../node_modules/@murasaki/react98/dist';
@import '@murasaki/react98/theme.css';
```

Adjust the `@source` path to be relative to your CSS file's location.

Then render components the same way — no separate CSS import is needed in your JS:

```tsx
import { ThemeProvider, Button } from '@murasaki/react98'

function App() {
  return (
    <ThemeProvider>
      <Button>Click me</Button>
    </ThemeProvider>
  )
}
```

## Themes

Three built-in themes: `windows-98` (default), `windows-95`, `solarized-dark`.

```tsx
<ThemeProvider defaultTheme="solarized-dark">
  {/* your app */}
</ThemeProvider>
```

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

## Documentation

Full docs and interactive examples: [murasaki.vercel.app](https://murasaki.vercel.app)

## License

MIT
