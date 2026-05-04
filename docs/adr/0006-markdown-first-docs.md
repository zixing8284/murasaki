# 0006 — Markdown-first Documentation System

## Status

Superseded by ADR 0007

## Context

The playground's component documentation used `.mdx` files with inline JSX imports for props tables and code blocks. This caused three problems:

1. **Formatting fragility** — Prettier and editor formatters break MDX whitespace semantics, causing rendering issues.
2. **Mixed-language mental model** — Context-switching between markdown prose and JSX in one file is cognitively expensive.
3. **Boilerplate** — Every doc file repeated 40+ lines of JSX for Table/CodeBlock imports and markup.

The demo system also had friction: separate `demo-*.tsx` files required manual registration in `docs-nav.ts` (lazy imports, `?raw` source imports, tree node entries), and demos were separate nav items rather than inline with the doc.

## Decision

We replaced the MDX-based doc system with a markdown-first approach:

- **Pure `.md` files** for all documentation — no JSX, no mixed syntax.
- **MDXProvider** maps standard HTML elements to themed @murasaki/react98 components (`table` → `<Table>`, `pre` → `<CodeBlock>`, etc.).
- **Manual markdown tables** for props documentation — simple, no tooling, easy to write.
- **Live demos embedded in markdown** as fenced code blocks tagged with `` ```tsx live ``.
- **A small Vite plugin** (`vite-plugin-mdx-live`) extracts `live` code blocks at build time, compiles them to React components via esbuild, and writes a sidecar `.md.live.ts` module.
- **`LiveDemo` component** renders the live component with collapsible source code (hidden by default).
- **Simplified `docs-nav.ts`** — one entry per component (~30 lines), no demo imports or raw source imports.

## Consequences

### Positive

- Doc authoring is just writing markdown — no formatter issues, no mixed-language cognitive overhead.
- Adding a component doc is one `.md` file with a markdown table and fenced code blocks.
- Adding a live demo is just writing `` ```tsx live `` with the demo code — zero registration.
- `docs-nav.ts` shrank from 236 lines to ~30 lines.
- The demo-*.tsx files and DemoViewer component are eliminated.
- MDXProvider provides a single place to customize how markdown elements render.

### Negative

- The `vite-plugin-mdx-live` plugin adds a small build-time transform (~70 lines). It's focused and understandable, but it is custom tooling.
- Live demo code must include explicit `import` statements for components used (the plugin strips them from the body and adds them to the sidecar's import section).
- The sidecar `.md.live.ts` files are generated at build time and written to disk (gitignored).
- `@mdx-js/react` and `@mdx-js/rollup` remain as dependencies (for MDXProvider and markdown compilation).

### Neutral

- The `remark-gfm` dependency is retained for GitHub-flavored markdown (tables, strikethrough).
- Shiki `<CodeBlock>` is reused unchanged for syntax highlighting.
