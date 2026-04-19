# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Shape

pnpm workspace with two packages:

- **`packages/ui`** — Publishable React component library. Build output goes to `dist/`.
- **`packages/playground`** — Windows 98 desktop demo app that consumes the built UI library.

## Core Workflow

Use these commands regularly:

```bash
pnpm play
pnpm play:build

pnpm ui:build
pnpm ui:dev
pnpm ui:test

pnpm lint
```

When changing anything under `packages/ui/`, use this order:

1. **Lint** — `pnpm lint`
2. **Test** — `pnpm ui:test`
3. **Build** — `pnpm ui:build`

The playground consumes `packages/ui/dist`, not UI source files, so rebuild before verifying library changes in the playground or any other consumer.

## Design Priorities

**Component autonomy** — Keep state and behavior as close as possible to the component that owns them. Avoid prop-drilling data through layers that do not use it.

**Proactive optimization review** — Do not stop at functional correctness. Before finishing a UI change, check for unnecessary network activity, repeated asset loads, avoidable re-renders, redundant state/effect synchronization, and hot-path resource churn.

**Prefer durable simplicity** — Favor patterns that are easy to understand and cheap to maintain over clever abstractions or overly specific one-off rules.

## UI Library Conventions

- Components live under `packages/ui/src/components/`, typically one directory per component.
- Public exports go through `packages/ui/src/index.ts`.
- Use **flat named exports** for public primitives.
- Use **CVA** for variant-heavy styling.
- Use `cn()` by default and `cnPure()` only when the base font injection should be skipped.
- Prefer Tailwind utilities over custom CSS. Add CSS only when Tailwind cannot express the style cleanly.
- Prefer CSS-variable-backed Tailwind values over hardcoded colors so components remain themeable.
- For complex pixel-precise graphics, prefer inline SVG components that use theme variables.

## Theme And Styling

- The library is Tailwind CSS v4 based and uses Windows 98 design tokens.
- Keep styling theme-first: use CSS variable-backed utilities such as `bg-(--button-face)` and `text-(--window-text)`.
- Treat shared theme config as library-owned and theme variable values as consumer-customizable.

## Playground Architecture

- Window/process state is managed from `packages/playground/src/contexts/process/`.
- App metadata is registered in `packages/playground/src/contexts/process/directory.ts`.
- Window implementations live under `packages/playground/src/directory/`.
- Component docs content lives under `packages/playground/src/content/<component>/`.

## Testing And React Rules

- UI tests run in real Chromium via Vitest + Playwright browser mode.
- Prefer behavioral assertions over snapshots unless the visual output itself is the contract.
- React Compiler is enabled in both packages.
- Never mutate refs during render.
- For latest-callback refs, update the ref in `useLayoutEffect` or `useEffect`, not during render.

## Delivery Conventions

- Use Conventional Commits.
- Use branch names like `type/description`.
- Do not assume repo hooks will fix issues automatically; run `pnpm lint` yourself.
- Publishing `packages/ui` is manual: bump the package version, run `pnpm ui:build`, then publish from `packages/ui`.

## Maintaining AI Guidance

Keep this file and `.github/copilot-instructions.md` aligned.

Update them when stable project conventions change, such as:

- package structure
- build, test, or release workflow
- cross-cutting architectural patterns
- shared styling or API conventions

Avoid filling these files with feature inventories, fragile examples, or implementation trivia that will drift quickly. Prefer concise rules that stay true as the codebase evolves.
