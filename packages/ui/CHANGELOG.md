# Changelog

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
