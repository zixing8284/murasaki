# Next.js Usage

@murasaki/react98 is a client-first package for React Server Component frameworks. Import components from the package root, and import the stylesheet explicitly from your app root.

## App Router setup

Import the compiled stylesheet in your root layout:

```tsx
import '@murasaki/react98/globals.css'
```

Use the provider as a client boundary from a server-rendered tree:

```tsx
import { Button, ThemeProvider } from '@murasaki/react98'

export default function Page() {
  return (
    <ThemeProvider defaultTheme="windows-98" storageKey={null}>
      <Button>OK</Button>
    </ThemeProvider>
  )
}
```

For non-default themes, set the same theme on the server-rendered `<html>` element with `data-theme` and pass that value as `defaultTheme`. Browser storage is optional client persistence; it should not be the source of truth for the first server render.

## Fixture

This repo includes a minimal Next App Router fixture in `packages/next-fixture`.

```bash
pnpm ui:build
pnpm --filter @murasaki/react98-next-fixture build
```

The fixture imports `@murasaki/react98/globals.css`, renders representative components through the package root, and catches package export, client boundary, stylesheet, and hydration build issues.
