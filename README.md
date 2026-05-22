# Murasaki

A Windows 98-themed React UI library — [`@murasaki/react98`](https://www.npmjs.com/package/@murasaki/react98)

- [Playground](https://zixing8284.github.io/murasaki/) · [Docs](https://zixing8284.github.io/murasaki/programs/docs/)

## Why

The millennium holds my childhood memories. Those chunky pixels, the classic desktop — I just wanted to recreate them with React.
Life is hard. Building this project genuinely makes me happy.

## Packages

- `packages/ui` — `@murasaki/react98` component library
- `packages/playground` — demo
- `packages/docs` — component docs
- `packages/next-fixture` — Next.js integration test

## Getting Started

```bash
pnpm install          # 1. Install dependencies
pnpm ui:build         # 2. Build the UI library (playground and docs depend on it)
pnpm docs:build:embed # 3. Build docs and embed into playground
pnpm play             # 4. Start the playground
```

Docs only: `pnpm docs:dev` → `http://localhost:3000/programs/docs/`

## Acknowledgements

- [98.css](https://jdan.github.io/98.css/) — CSS styling
- [winclassic](https://github.com/tpenguinltg/winclassic) — theme variable definitions
- [React95](https://github.com/react95-io/React95) — component design reference
- [daedalOS](https://github.com/DustinBrett/daedalOS) — code organization and design
- [win99.dev](https://win99.dev/) — UI style reference

## License

MIT
