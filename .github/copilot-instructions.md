# Copilot Instructions — murasaki-react98

## Monorepo Layout

pnpm workspace with two packages:

- **`packages/ui`** — Publishable component library (`murasaki-react98` on npm). Builds to `dist/`.
- **`packages/playground`** — Windows 98 desktop demo app that consumes the UI library.

## Critical Workflow

After modifying any file under `packages/ui/`, **rebuild before testing in the playground**:

```bash
pnpm ui:build          # vite build + tsc --emitDeclarationOnly → packages/ui/dist/
```

Other key commands: `pnpm play` (dev server), `pnpm ui:test` (Vitest + Playwright browser), `pnpm lint` (ESLint).

## Component Conventions (`packages/ui`)

- One directory per component under `src/components/` (e.g., `button/button.tsx`).
- **Compound components** use namespace files (`*-namespace.ts`):
  - `Object.assign` when the root is callable: `export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel })`
  - Plain object when it's purely a namespace: `export const Window = { Provider, Portal, Frame, ... }`
- **CVA** (`class-variance-authority`) for variant-based styling. Define variants via `cva()`, derive props with `VariantProps<typeof variants>`.
- **`cn()`** (`src/lib/utils.ts`) wraps `clsx` + `tailwind-merge` and auto-injects an 11px base font. Use **`cnPure()`** to skip the font injection.
- All public exports go through `src/index.ts` — export both the namespace and the individual sub-components/types.

## Styling

- **Tailwind CSS v4** with Windows 98 design tokens (colors like `btn-face`, `btn-text`, `btn-shadow`, `btn-hilight`; shadows like `shadow-raised`, `shadow-sunken`) defined in `src/globals.css`.
- Custom utilities: `sunken-panel`, `bgi-icon-*`, `pixelated`.
- Build outputs a single `dist/globals.css`; all assets (fonts, icons) are inlined as base64.

## Path Alias & File Naming

- **`#/*`** maps to `./src/*` (configured in tsconfig `imports` and vite `resolve.alias`).
- All source files use **kebab-case** (`my-component.tsx`, `use-draggable.ts`).

## Playground Architecture (`packages/playground`)

- Window management uses a **React Context** system in `src/contexts/process/`:
  - `useProcesses()` — full state + actions
  - `useProcess(id)` — single process state with `isActive` and `zIndex`
  - `useProcessActions()` — memoized actions only (avoids re-renders)
  - `useProcessList()` — flat array of running processes
- Docs pages are MDX files under `src/docs/` with companion `demo-*.tsx` files.

## Dependencies & Tooling

- **pnpm catalogs** (`pnpm-workspace.yaml`) centralize dependency versions — use `catalog:` specifiers in `package.json`.
- **ESLint**: `@antfu/eslint-config` with `type: 'lib'`, `react: true`.
- **React Compiler** (`babel-plugin-react-compiler`) is enabled in the UI library's Vite config.
- **Testing**: Vitest with Playwright browser provider; test files live in `packages/ui/tests/`. Run a single test: `pnpm --filter murasaki-react98 test -- path/to/test.ts`.
- Build uses `preserveModules: true` for tree-shaking by consumers.

## Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/), **lowercase** type + description, imperative tense. Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`. Optional scope: `chore(lint): enforce catalog specifier`.

Pre-commit hook (`simple-git-hooks` + `lint-staged`) auto-runs ESLint fix on staged files.

## PR Workflow

- Branch naming: `type/description` (e.g., `feat/add-slider`, `fix/button-focus`)
- Squash merge into `main`
- Require at least one review approval
- `pnpm lint` and `pnpm ui:test` must pass before merge

## Publishing (`packages/ui`)

Manual process — no automated release tooling:

1. Bump `version` in `packages/ui/package.json`
2. `pnpm ui:build`
3. `cd packages/ui && npm publish`

## Maintaining AI Instruction Files

Update both `CLAUDE.md` and `.github/copilot-instructions.md` when:

- Adding, removing, or renaming components or hooks
- Changing build commands, scripts, or workflow
- Modifying architectural patterns (e.g., state management, context structure)
- Adding new conventions (file naming, export patterns, etc.)

Keep both files in sync.
