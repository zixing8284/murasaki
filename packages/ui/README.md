# @murasaki/react98

A Windows 98-themed React UI component library.

## Installation

```bash
pnpm add @murasaki/react98
```

## Quick Start

Wrap your app with `ThemeProvider` and import the global styles:

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

### Tailwind CSS v4

If you use Tailwind CSS v4, import the source theme instead of the pre-compiled CSS:

```css
@import '@murasaki/react98/theme.css';
```

## Themes

Three built-in themes: `windows-98` (default), `windows-95`, `solarized-dark`.

```tsx
<ThemeProvider defaultTheme="solarized-dark">
  {/* your app */}
</ThemeProvider>
```

## Documentation

Full docs and interactive examples: [murasaki.vercel.app](https://murasaki.vercel.app)

## License

MIT
