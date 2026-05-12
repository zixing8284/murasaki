# @murasaki/react98

Windows 98-styled React components, a desktop playground, and a standalone documentation site.

- Playground: https://zixing8284.github.io/murasaki/
- Documentation: https://zixing8284.github.io/murasaki/programs/docs/

Example usage:

```tsx
import '@murasaki/react98/globals.css'
import {
  Button,
  WindowContent,
  WindowFrame,
  WindowProvider,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki/react98'

export function Example() {
  return (
    <WindowProvider>
      <WindowFrame className="w-80">
        <WindowTitleBar>
          <WindowTitle>React98</WindowTitle>
        </WindowTitleBar>
        <WindowContent>
          <Button>OK</Button>
        </WindowContent>
      </WindowFrame>
    </WindowProvider>
  )
}
```

## Packages

- `packages/ui` — publishable `@murasaki/react98` component library. Build output goes to `dist/`.
- `packages/playground` — Windows 98 desktop demo app that consumes the built UI package.
- `packages/docs` — Nextra documentation site embedded into the playground under `/programs/docs/`.
- `packages/next-fixture` — Next.js consumer fixture for package integration checks.

## Documentation

The public docs are served from the GitHub Pages playground site:

```text
https://zixing8284.github.io/murasaki/programs/docs/
```

For local docs development:

```bash
pnpm install
pnpm ui:build
pnpm docs:dev
```

Then open `http://localhost:3000/programs/docs/`.

## Playground

The playground is the main interactive demo. It starts as a Windows 98 desktop and opens the component documentation in an iframe app.

Run it locally:

```bash
pnpm install
pnpm ui:build
pnpm docs:build:embed
pnpm play
```

Then open the Vite dev server URL, usually `http://localhost:5173/`.

## License

MIT
