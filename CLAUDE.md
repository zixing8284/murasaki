# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**murasaki-react98** is a Windows 98-themed React UI component library with a monorepo structure:

- **`packages/ui`** — Component library (`murasaki-react98` on npm), the publishable package
- **`packages/playground`** — Interactive showcase app that demos components in a Windows 98 desktop environment

## Common Commands

```bash
# Playground development
pnpm play              # Start playground dev server
pnpm play:build        # Build playground for production
pnpm play:preview      # Preview playground production build

# UI library
pnpm ui:build          # Build UI library (vite build + tsc --emitDeclarationOnly)
pnpm ui:dev            # Watch-mode build of UI library
pnpm ui:test           # Run UI tests (vitest + Playwright browser)

# Linting
pnpm lint              # ESLint across all packages
```

## Workflow

**After modifying any file under `packages/ui/`, you must rebuild before the playground (or any consumer) picks up the changes:**

```bash
pnpm ui:build
```

The build runs `vite build && tsc --emitDeclarationOnly` and outputs to `packages/ui/dist/`.

To run a single test file:
```bash
pnpm --filter murasaki-react98 test -- path/to/test.ts
```

## UI Component Update Workflow

After modifying component code or styles under `packages/ui/`, follow these steps in order:

1. **Lint** — `pnpm lint` (ensure code style and React Compiler rules pass)
2. **Test** — `pnpm ui:test` (runs in real Chromium; includes screenshot comparison)
   - Screenshot tests compare current renders against baseline images in `tests/__screenshots__/`
   - If a screenshot comparison **fails**:
     - **Intentional change** → update baselines: `pnpm --filter murasaki-react98 test -- --update`
     - **Unintentional change** → fix the code and re-run tests
   - On failure, diff images (`*-diff.png`) and actual images (`*-actual.png`) are generated alongside the baselines in `tests/__screenshots__/` to highlight pixel-level differences
3. **Build** — `pnpm ui:build` (⚠️ required — playground consumes `dist/`, not source)

> Steps 4–7 are **manual** — hand off to the developer for confirmation.

4. **Verify in playground** — `pnpm play` (manually check the component in the browser)
5. **Commit** — use Conventional Commits (e.g., `feat: update button hover style`)
6. **Push & PR** — branch naming `type/description`, squash merge into `main`
7. **Publish** *(optional)* — bump version, `pnpm ui:build`, `cd packages/ui && npm publish`

## Architecture

### packages/ui — Component Library

Components live in `src/components/`, one directory per component. The key conventions:

- **Compound components** are exposed via a namespace object. Two patterns are used:
  - `Object.assign`: `export const Tabs = Object.assign(TabsRoot, { List: TabList, Tab, Panel: TabPanel })`
  - Plain object: `export const Window = { Provider, Portal, Frame, TitleBar, ... }`
  - Namespace files are named `*-namespace.ts`
- **CVA (class-variance-authority)** is used for variant-based styling
- **`cn()` utility** (`src/lib/utils.ts`) wraps `clsx` + `tailwind-merge` and automatically injects an 11px base font size. Use `cnPure()` when you don't want the base font injection
- **`#/*`** is a path alias for `./src/*` (configured in both tsconfig and vite)

Styling uses Tailwind CSS v4 with a full Windows 98 color palette and shadow tokens defined in `src/globals.css`. Custom utilities include `sunken-panel`, `bgi-icon-*`, and `pixelated`.

**Tailwind-first styling**: Always prefer Tailwind utility classes over custom CSS in stylesheets or inline `style` attributes. Only add rules to CSS files when Tailwind cannot express the style (e.g., pseudo-elements with `content`, complex keyframes, or MDX prose styles).

**Theme-first colors**: Use CSS variable-backed Tailwind tokens (e.g., `bg-selection`, `text-desktop-text`) instead of hardcoded colors (e.g., `text-white`, `bg-[#0a246a]`). All colors and visual tokens should come from the Win98 theme variables in `src/globals.css` so styles adapt automatically when switching themes.

The **`useDraggable`** hook (`src/hooks/use-draggable.ts`) handles CSS-transform-based drag with viewport/container boundary clamping.

### packages/playground — Showcase App

The playground simulates a Windows 98 desktop. Key pieces:

- **Process Context** (`src/contexts/process/`) — React Context system managing window lifecycle (z-order, active state, minimize/maximize). Use the granular hooks to avoid unnecessary re-renders:
  - `useProcesses()` — full state + actions
  - `useProcess(id)` — single process state with `isActive` and `zIndex`
  - `useProcessActions()` — memoized actions only
  - `useProcessList()` — flat array of running processes
- **Process Directory** (`src/contexts/process/directory.ts`) — Static registry of openable apps (keyed by `appId`)
- **Docs system** — MDX files under `src/docs/` rendered in a docs window. Each component folder has a `.mdx` file and one or more `demo-*.tsx` demo files. MDX support is via `@mdx-js/rollup` + `remark-gfm`.

### Module Structure

`packages/ui` builds with `preserveModules: true`, so every source file becomes its own output file in `dist/`. This enables tree-shaking for library consumers.

Fonts and small assets are inlined as base64 in the compiled CSS. The CSS output is a single `dist/globals.css`.

## Testing Conventions

Tests run in **real Chromium** via Vitest + Playwright browser mode (`vitest-browser-react`). Test files live in `packages/ui/tests/`.

- **File naming**: `tests/{component-name}.test.tsx` (e.g., `button.test.tsx`, `tabs.test.tsx`)
- **Setup file**: `tests/setup.ts` imports `globals.css` so Tailwind classes are available in tests
- **Test helpers**: `tests/utils.tsx` provides context wrappers for compound components (e.g., `TabsWrapper`)
- **Structure per component**:
  ```ts
  describe('component-name', () => {
    // Rendering: default render, variant application, className/ref forwarding
    // Interaction: click, keyboard (via userEvent from 'vitest/browser')
    // State: controlled vs uncontrolled
    // Edge cases: disabled, readOnly, empty props
  })
  ```
- **Behavioral assertions over snapshots**: Use `getByRole`, `toHaveAttribute`, `toBeVisible` instead of inline snapshots for interactive components
- **Disabled/hidden elements**: Playwright refuses to click disabled or invisible elements. Use native DOM `.element().click()` or `userEvent.keyboard()` for these cases

Run tests:
```bash
pnpm ui:test                                              # All tests
pnpm --filter murasaki-react98 test -- tests/button.test.tsx  # Single file
```

## React Compiler & Hooks Conventions

React Compiler is enabled in both packages. All code must satisfy its rules:

- **Never mutate refs during render** — `ref.current = value` must be inside `useEffect`, `useLayoutEffect`, or an event handler, never at the top level of a component/hook body.
- **Latest-callback ref pattern** — To keep a stable ref pointing to the latest callback without re-subscribing effects:
  ```ts
  const callbackRef = useRef(callback)
  useLayoutEffect(() => { callbackRef.current = callback })   // sync before paint
  ```
  Use `useLayoutEffect` (no deps) in client-only code. Fall back to `useEffect` if SSR compatibility is needed.

## File Naming

All source files use **kebab-case** (e.g., `my-component.tsx`, `use-draggable.ts`). This applies to both packages.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) with **lowercase** type and description in imperative tense:

```
feat: add slider component
fix: correct tab focus order
refactor: migrate to process context for window management
chore(lint): enforce catalog specifier
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`. Scope is optional.

A pre-commit hook (`simple-git-hooks` + `lint-staged`) automatically runs ESLint fix on staged files.

## PR Workflow

- **Branch naming**: `type/description` (e.g., `feat/add-slider`, `fix/button-focus`)
- **Squash merge** into `main`
- Require at least **one review approval**
- `pnpm lint` and `pnpm ui:test` must pass before merge

## Publishing (`packages/ui`)

Publishing is manual — no automated release tooling.

1. Bump `version` in `packages/ui/package.json`
2. `pnpm ui:build`
3. `cd packages/ui && npm publish`

## Maintaining AI Instruction Files

Update both `CLAUDE.md` and `.github/copilot-instructions.md` when:

- Adding, removing, or renaming components or hooks
- Changing build commands, scripts, or workflow
- Modifying architectural patterns (e.g., state management, context structure)
- Adding new conventions (file naming, export patterns, etc.)

Keep both files in sync — they cover the same content for different AI agents.
