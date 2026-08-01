# Changelog

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
