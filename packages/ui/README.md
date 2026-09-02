# @murasaki-io/react98

> Windows 98 UI components for React — pixel-perfect nostalgia meets modern tooling.

[![npm](https://img.shields.io/npm/v/@murasaki-io/react98)](https://www.npmjs.com/package/@murasaki-io/react98)
[![license](https://img.shields.io/npm/l/@murasaki-io/react98)](https://github.com/zixing8284/murasaki/blob/main/packages/ui/LICENSE)

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

## Documentation

Component reference, live examples, and guides live on the documentation site. It is the source of truth for API details and usage — this README only covers setup.

**[→ Documentation & live demo](https://zixing8284.github.io/murasaki)**

- **Components** — each component's props, examples, accessibility notes, and keyboard behavior. Components are composable and follow a consistent shadcn/ui-style API (e.g. `Select` → `SelectTrigger` / `SelectContent` / `SelectItem`; `Window` → `WindowFrame` / `WindowTitleBar` / `WindowContent`).
- **Guides** — end-to-end walkthroughs, including building a full desktop shell with draggable, resizable windows and a taskbar.
- **Hooks** — `useDraggable` and `useResizable` for custom drag and resize interactions.
- **Theming** — switch between the 19 built-in color schemes at runtime, or import a single theme's CSS for lean bundles.

---

## Requirements

- React 19+
- Tailwind CSS v4 (optional — `globals.css` works without it)

---

## Changelog

See the [changelog](https://github.com/zixing8284/murasaki/blob/main/packages/ui/CHANGELOG.md) for version history and breaking changes.

---

## License

MIT
