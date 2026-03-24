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

## Component Design Principles

**Component autonomy** — When a component can fully own its data and behavior, it should. Avoid prop-drilling state through intermediaries that don't use it. Specifically:

- If data is only consumed by a single leaf component (e.g., a clock displaying the current time), that component should manage the data internally rather than receiving it as a prop from a distant ancestor.
- Parent components should only pass data that they themselves produce or that coordinates multiple children.
- Prefer local state, local effects, and custom hooks within the component that needs them over threading props through layers of wrappers.
- This improves reusability (the component works standalone), reduces coupling (intermediary components don't carry irrelevant props), and limits unnecessary re-renders.

## Architecture

### packages/ui — Component Library

Components live in `src/components/`, one directory per component. The key conventions:

- **Compound components** — Two export styles are used:
  - **Namespace (callable root)**: `export const Tabs = Object.assign(TabsRoot, { List: TabList, Tab, Panel: TabPanel })` — namespace files named `*-namespace.ts`
  - **Flat exports (shadcn/ui style)**: Individual named exports (e.g., `WindowFrame`, `WindowTitleBar`, `TreeViewRoot`, `TreeViewItem`) — no namespace wrapper
- **CVA (class-variance-authority)** is used for variant-based styling
- **`cn()` utility** (`src/lib/utils.ts`) wraps `clsx` + `tailwind-merge` and automatically injects an 11px base font size. Use `cnPure()` when you don't want the base font injection
- **`#/*`** is a path alias for `./src/*` (configured in both tsconfig and vite)

**Inline SVG Icons**: For complex vector graphics (e.g., slider thumbs), create a separate `*-icons.tsx` file with inline SVG components. This enables pixel-perfect rendering while supporting theme adaptation via CSS variables. Follow the Win98 3D bevel pattern:

| SVG Color | CSS Variable | Win98 Role |
|-----------|--------------|------------|
| White / Light | `var(--button-hilight)` | Top-left highlight edge |
| ButtonFace | `var(--button-face)` | Main button background |
| Medium Gray | `var(--button-shadow)` | Bottom-right shadow edge |
| Black / Dark | `var(--button-dk-shadow)` | Outer dark border |

Example: `packages/ui/src/components/slider/slider-icons.tsx`

Styling uses Tailwind CSS v4 with a full Windows 98 color palette and shadow tokens. Components use Tailwind v4's **arbitrary CSS variable syntax** directly (e.g., `bg-(--button-face)`, `text-(--window-text)`) instead of `@theme inline` tokens. The CSS is split into three source files under `src/`:

- **`theme-variables.css`** — CSS custom properties (`:root` and `[data-theme]` overrides). This is the **consumer template** — consumers copy these variables into their own CSS and customize values. Exported as `murasaki-react98/theme-variables.css`.
- **`theme-config.css`** — Shadow CSS custom properties (`:root`), `@utility` definitions (shadow utilities, `sunken-panel`, `pixelated`, etc.), `@layer base` (fonts, box-sizing), and scrollbar styles. This is **library-owned** — consumers import it, never copy. Exported as `murasaki-react98/theme-config.css`.
- **`globals.css`** — Aggregator that imports both files above. Exported as `murasaki-react98/theme.css` (source, for Tailwind consumers) and compiled to `dist/globals.css` (for non-Tailwind consumers).

**Consumer usage patterns:**

- **Quick-start**: `@import "murasaki-react98/theme.css"` — imports everything.
- **shadcn/ui pattern** (recommended): `@import "murasaki-react98/theme-config.css"` + define `:root { ... }` with variables copied from `theme-variables.css`. This gives the consumer full ownership over theme values.

**CSS variable syntax in components**: Use Tailwind v4 arbitrary value syntax with CSS variables: `bg-(--button-face)`, `text-(--window-text)`, `border-(--button-shadow)`, etc. For shadows, use the utility classes: `shadow-raised`, `shadow-sunken`, `shadow-border-field`, etc.

Custom utilities include `sunken-panel`, `bgi-icon-*`, `pixelated`, `shadow-raised`, `shadow-sunken`, `shadow-border-field`, and `shadow-raised-primary`.

**Tailwind-first styling**: Always prefer Tailwind utility classes over custom CSS classes or inline `style` attributes. Only add rules to CSS files when Tailwind cannot express the style (e.g., pseudo-elements with `content`, complex keyframes, or MDX prose styles).

**Theme-first colors**: Use CSS variable-backed Tailwind syntax (e.g., `bg-(--hilight)`, `text-(--desktop-text)`, `bg-(--window)`) instead of hardcoded colors (e.g., `text-white`, `bg-[#0a246a]`). All colors and visual tokens should come from the Win98 theme variables so styles adapt automatically when switching themes. Use `bg-(--window)` for content area backgrounds (white in Win98) and `bg-(--button-face)` for window chrome (silver/ButtonFace).

**Theme reference**: When creating or updating component styles, follow `packages/ui/template-theme-explained.en.md` as the authoritative guide for Win98 visual patterns (button states, borders, 3D effects, color usage).

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
