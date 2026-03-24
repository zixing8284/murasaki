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

## Component Conventions (`packages/ui`)

- One directory per component under `src/components/` (e.g., `button/button.tsx`).
- **Compound components** — Two export styles are used:
  - **Namespace (callable root)**: `Object.assign` with namespace files (`*-namespace.ts`): `export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel })`
  - **Flat exports (shadcn/ui style)**: Individual named exports (e.g., `WindowFrame`, `WindowTitleBar`, `TreeViewRoot`, `TreeViewItem`) — no namespace wrapper
- **CVA** (`class-variance-authority`) for variant-based styling. Define variants via `cva()`, derive props with `VariantProps<typeof variants>`.
- **`cn()`** (`src/lib/utils.ts`) wraps `clsx` + `tailwind-merge` and auto-injects an 11px base font. Use **`cnPure()`** to skip the font injection.
- All public exports go through `src/index.ts`.

### Inline SVG Icons

For complex vector graphics (e.g., slider thumbs), create a separate `*-icons.tsx` file with inline SVG components. This approach:

1. **Enables pixel-perfect rendering** — SVG paths match the original design exactly
2. **Supports theme adaptation** — Use CSS variables instead of hardcoded colors
3. **Follows the Win98 3D bevel pattern:**

| SVG Color | CSS Variable | Win98 Role |
|-----------|--------------|------------|
| White / Light | `var(--button-hilight)` | Top-left highlight edge |
| ButtonFace | `var(--button-face)` | Main button background |
| Medium Gray | `var(--button-shadow)` | Bottom-right shadow edge |
| Black / Dark | `var(--button-dk-shadow)` | Outer dark border |

Example: `packages/ui/src/components/slider/slider-icons.tsx`

## Styling

- **Tailwind CSS v4** with Windows 98 design tokens. Components use Tailwind v4's **arbitrary CSS variable syntax** directly (e.g., `bg-(--button-face)`, `text-(--window-text)`) instead of `@theme inline` tokens. Shadow utilities (`shadow-raised`, `shadow-sunken`, etc.) are provided as `@utility` definitions. The CSS is split into three source files:
  - **`src/theme-variables.css`** — CSS custom properties (`:root` and `[data-theme]` overrides). Consumer template — consumers copy and customize. Exported as `murasaki-react98/theme-variables.css`.
  - **`src/theme-config.css`** — Shadow CSS custom properties (`:root`), `@utility` definitions (shadow utilities, `sunken-panel`, `pixelated`, etc.), `@layer base` (fonts, box-sizing), scrollbar styles. Library-owned — consumers import, never copy. Exported as `murasaki-react98/theme-config.css`.
  - **`src/globals.css`** — Aggregator importing both. Exported as `murasaki-react98/theme.css` (source) and compiled to `dist/globals.css` (non-Tailwind consumers).
- **Consumer usage patterns:**
  - **Quick-start**: `@import "murasaki-react98/theme.css"` — imports everything.
  - **shadcn/ui pattern** (recommended): `@import "murasaki-react98/theme-config.css"` + define `:root { ... }` with variables copied from `theme-variables.css`.
- **CSS variable syntax in components**: Use Tailwind v4 arbitrary value syntax with CSS variables: `bg-(--button-face)`, `text-(--window-text)`, `border-(--button-shadow)`, etc. For shadows, use the utility classes: `shadow-raised`, `shadow-sunken`, `shadow-border-field`, etc.
- **Tailwind-first styling**: Always prefer Tailwind utility classes over custom CSS classes or inline `style` attributes. Only add rules to CSS files when Tailwind cannot express the style (e.g., pseudo-elements with `content`, complex keyframes, or MDX prose styles).
- **Theme-first colors**: Use CSS variable-backed Tailwind syntax (e.g., `bg-(--hilight)`, `text-(--desktop-text)`, `bg-(--window)`) instead of hardcoded colors (e.g., `text-white`, `bg-[#0a246a]`). All colors and visual tokens should come from the Win98 theme variables so styles adapt automatically when switching themes. Use `bg-(--window)` for content area backgrounds (white in Win98) and `bg-(--button-face)` for window chrome (silver/ButtonFace).
- **Theme reference**: When creating or updating component styles, follow `packages/ui/template-theme-explained.en.md` as the authoritative guide for Win98 visual patterns (button states, borders, 3D effects, color usage).
- Custom utilities: `sunken-panel`, `bgi-icon-*`, `pixelated`, `shadow-raised`, `shadow-sunken`, `shadow-border-field`, `shadow-raised-primary`.
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
- **React Compiler** (`babel-plugin-react-compiler`) is enabled in **both** `packages/ui` and `packages/playground` Vite configs.
- **Testing**: Vitest with Playwright browser provider; test files live in `packages/ui/tests/`. Run a single test: `pnpm --filter murasaki-react98 test -- path/to/test.ts`.
- Build uses `preserveModules: true` for tree-shaking by consumers.

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

## React Compiler & Hooks Conventions

React Compiler is enabled in both packages. All code must satisfy its rules:

- **Never mutate refs during render** — `ref.current = value` must be inside `useEffect`, `useLayoutEffect`, or an event handler, never at the top level of a component/hook body.
- **Latest-callback ref pattern** — To keep a stable ref pointing to the latest callback without re-subscribing effects:
  ```ts
  const callbackRef = useRef(callback)
  useLayoutEffect(() => { callbackRef.current = callback })   // sync before paint
  ```
  Use `useLayoutEffect` (no deps) in client-only code. Fall back to `useEffect` if SSR compatibility is needed.

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
