# Changelog

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
