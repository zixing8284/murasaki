# @murasaki/react98

Windows 98-styled React components, a desktop playground, and a standalone documentation site.

## Packages

- `packages/ui` — publishable `@murasaki/react98` component library.
- `packages/playground` — Windows 98 desktop demo app that consumes the built UI package.
- `packages/docs` — Nextra documentation site embedded into the playground.
- `packages/next-fixture` — Next.js consumer fixture for package integration checks.

## Development

Install dependencies, then run the playground:

```bash
pnpm install
pnpm ui:build
pnpm docs:build:embed
pnpm play
```

## License

MIT
