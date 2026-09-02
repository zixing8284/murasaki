# Changelog

## 0.6.1

### Patch Changes

- 668c285: Fix package metadata and README links. Add a bundled `LICENSE` file, point the
  README changelog and license links to absolute URLs, set `repository.directory`
  to `packages/ui`, and ship `CHANGELOG.md` in the published package.

## 0.6.0

### Minor Changes

- Add checkbox, radio, shortcut, and label items to the shared Menu primitives.

  `Menu` (also rendered by `ContextMenu` and the window `WindowMenuBar`) gains:

  - `MenuCheckboxItem` (`checked` / `onCheckedChange`) with a check indicator.
  - `MenuRadioGroup` + `MenuRadioItem` (`value` / `onValueChange`) with a bullet indicator.
  - `MenuLabel` for non-interactive group headings.
  - `MenuShortcut` for right-aligned accelerator hints.

  The new item roles (`menuitemcheckbox` / `menuitemradio`) participate in roving
  focus, typeahead, and close-on-select. `MenuItem`'s icon slot is now a fixed
  16px gutter that constrains oversized images so pixel-art icons stay centered
  and aligned instead of clipping.

- Rebuild `Select` as a shadcn/ui-style compound component.

  `Select` is now a headless root composed of `SelectTrigger`, `SelectValue`,
  `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, and
  `SelectSeparator`, replacing the previous `options`-array API. Values are
  plain strings and `onValueChange` receives `(value: string)`.

  Breaking changes:

  - The `options`, `label`, `labelClassName`, `triggerClassName`, `width`,
    `menuMaxHeight`, `formatDisplay`, `onOpen`, and `onClose` props are removed.
    Compose options as `SelectItem` children, set width via `className` on
    `SelectTrigger`, use `maxHeight` on `SelectContent`, and use `onOpenChange`.
  - `SelectOption` and the `Select<T>` generic value type are removed; item
    values are strings.

  `SelectNative` is unchanged.

- Rebuild `Tooltip` as a compound component.

  `Tooltip` is now a headless root composed of `TooltipTrigger` and
  `TooltipContent`, replacing the previous `text`/`side` prop API.

  Breaking changes:

  - The `text`, `side`, and `className` props on `Tooltip` are removed. Put the
    popup content as `TooltipContent` children, set placement via `side` on
    `TooltipContent`, and wrap the target in `TooltipTrigger`.
  - `delay` stays on `Tooltip`, which also gains `open` / `defaultOpen` /
    `onOpenChange`.

- Make `Window` the compound root and remove the convenience component.

  `Window` is now the context-provider root of the Window compound (previously
  `WindowProvider`). Compose it with `WindowFrame` and the other slots exactly as
  before.

  Breaking changes:

  - `WindowProvider` is renamed to `Window`. Replace `<WindowProvider>` with
    `<Window>`; the props (`active`, `minimized`, `defaultMaximized`,
    `positioning`, `maximizable`) are unchanged. `WindowProviderProps` is now
    `WindowProps`.
  - The previous ready-made `Window` convenience component (with `title`, `icon`,
    `defaultPosition`, `defaultSize`, `onClose`, ... props) is removed. Assemble a
    window from the slots and wire `useDraggable` / `useResizable` yourself — see
    the Window docs "Build a complete window" example.
  - `WindowPosition` and `WindowSize` types are removed.

## 0.5.0

### Minor Changes

- e040d9b: Add a top-level `Window` convenience component that composes `WindowProvider` + `WindowFrame` + `WindowTitleBar` + drag/resize wiring behind a single prop surface (`title`, `defaultPosition`, `defaultSize`, `draggable`, `resizable`, and friends). The composable primitives remain exported for full control.

  Also improve control ergonomics:

  - `Button` gains an `iconOnly` variant that drops the 75px min-width and restores the real text color so `fill="currentColor"` SVG icons render correctly.
  - `Select` no longer requires `name`; omit it for UI-only selects.
  - `Slider` gains a `fill` prop that renders a filled progress portion of the track.

## 0.4.2

### Patch Changes

- 29f5045: Make the Windows 98 scrollbars touch-capable and fix wheel scrolling over them. Both the declarative `ScrollArea` and the `useScrollbar` primitive (used by `TextBox` multiline and `Select`) now drive their thumb, track, and arrow buttons with Pointer Events (so they work with touch/pen), the thumb drag is scale-aware, and two-finger/wheel scrolling over the scrollbar bars is forwarded to the scroll container — previously the overlay bars had no scrollable ancestor, so wheeling over them did nothing. Window caption buttons (minimize/maximize/close) also get a slightly larger hit target on coarse (touch) pointers.
- 8f9895b: Move playground-specific touch drag/resize behavior out of the package-level `useDraggable` and `useResizable` hooks. Those hooks return to their generic mouse-driven behavior, while the playground now owns mobile/device-emulation shell input through a dedicated shell input manager. Window title bar touch double-tap behavior is also owned by the playground shell instead of the reusable `WindowTitleBar` component.

## 0.4.1

### Patch Changes

- 8f9cb4a: Remove gap between minimize and maximize buttons in window titlebar to match real Windows 98 behavior. The close button retains a small left margin for accurate spacing.

## 0.4.0

### Minor Changes

- f84d7b1: Extend the themeable cursor token set with `--cursor-text`, `--cursor-not-allowed`, `--cursor-move`, `--cursor-ew-resize`, `--cursor-ns-resize`, `--cursor-nwse-resize`, and `--cursor-nesw-resize`, each with a matching Tailwind utility override. Disabled-state and resize cursors now route through these tokens instead of hardcoded keywords, native text fields (`TextBox`, `NumberBox`) route their I-beam through `--cursor-text`, and the native `Select` routes its pointer through `--cursor-pointer`, so consumers can skin every pointer cursor library-wide. Defaults remain the system keywords for standalone use.

## 0.3.1

### Patch Changes

- e397189: Add `font-display: swap` to all @font-face declarations to improve font loading behavior and reduce FOIT (Flash of Invisible Text)

## 0.3.0

### Minor Changes

- 6b91589: feat: disabled states for slider/checkbox, custom TreeView icons, and callback ref fixes

  - Add disabled styling to slider, checkbox, and option-button with etched text effect
  - Slider track uses sunken shadow token, increased width, and crispEdges on thumb SVGs
  - TreeView gains `expandIcon` and `collapseIcon` props for custom disclosure icons
  - `useDraggable` / `useResizable` use latest-callback refs to prevent orphaned listeners on re-render
  - Remove hardcoded `text-xs` / `text-[10px]` from progress-indicator and slider tick labels

## 0.2.1

### Patch Changes

- 06d74ea: fix(theme): use default cursor for disabled buttons

## 0.2.0

### Minor Changes

- c203177: Add `--cursor-default` and `--cursor-pointer` CSS custom properties with matching Tailwind utilities, enabling consumers to theme pointer feedback library-wide. Scrollbar primitives now use these tokens instead of hardcoded `cursor: default`.

## 0.1.3

### Patch Changes

- df805bd: Refine GroupBox visual styling to better match Windows 98 framing with theme-token-based borders, spacing, and inset highlight treatment.

## 0.1.2

### Patch Changes

- 7517c90: fix(ui): remove CheckboxLabel from public exports

  CheckboxLabel is an internal implementation detail of the Checkbox component that relies on CSS sibling selectors and cannot function independently. Remove it from the public API to avoid confusion.

## 0.1.1

### Patch Changes

- 26021cb: Remove duplicate 'use client' directive from build output and clean up unused dependencies

All notable changes to `@murasaki-io/react98` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-05

### Added

- 22 UI components: Button, Checkbox, ContextMenu, Divider, FieldPanel, GroupBox, Menu, NumberBox, OptionButton, ProgressIndicator, ScrollArea, Select, Slider, Table, Tabs, Taskbar, TextBox, ThemeProvider, Tooltip, TreeView, Window, LayerProvider
- 2 hooks: `useDraggable`, `useResizable`
- Windows 98 design system with 19 theme skins
- CSS custom property-based theming with semantic token naming
- Multiple CSS entry points: `globals.css` (pre-compiled), `theme.css` (Tailwind v4 source), per-skin exports
- Controlled and uncontrolled state patterns across all stateful components
- Full keyboard navigation and ARIA semantics
- React Compiler support
- Vitest browser-mode tests with Playwright
- Documentation site with live examples for every component

### Fixed

- Prevent vendored `node_modules` from being bundled into `dist/`
