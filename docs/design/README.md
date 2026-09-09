# Design guidelines

Windows 98 fidelity rules, organized by the UI component or surface they govern.
Each entry is the durable "how this should look and behave" reference; the ADRs
under `docs/adr/` remain the decision records (the "why"). When a rule lives in
an ADR, this index links to it instead of duplicating it.

Keep these pages short and rule-focused. Prefer a stable principle over an
example that will drift.

## Map

| Component / surface | Rules |
| --- | --- |
| Icon tiles (desktop + Explorer content pane) | [icons.md](icons.md) |
| Form fields, `Select`, address bar | [fields-and-inputs.md](fields-and-inputs.md) |
| Window chrome (menu bar, status bar, resize grip) | [ADR 0012](../adr/0012-window-chrome-metrics.md) |
| Dropdown menus (indicator gutter, radio vs check, accelerators) | [ADR 0012](../adr/0012-window-chrome-metrics.md), [ADR 0005](../adr/0005-component-api-consistency.md) |
| Tree view (indentation, dotted connectors, toggle-less root) | [tree-view.md](tree-view.md) |
| Pixel-font clipping / whole-pixel snapping | [ADR 0008](../adr/0008-pixel-font-clipping-safety.md) |
| Scoped floating layers (menus, tooltips, portals) | [ADR 0010](../adr/0010-scoped-layer-roots.md) |
| Shell input / gesture ownership (drag, resize, hit-testing) | [ADR 0011](../adr/0011-playground-shell-input-manager.md) |

## Cross-cutting principles

- **Build from the component library.** In the playground, compose UI from
  `@murasaki-io/react98` components rather than raw tags with bespoke styling.
  See [fields-and-inputs.md](fields-and-inputs.md).
- **Theme-first styling.** Use CSS-variable-backed utilities so components stay
  themeable; the library owns shared metrics, consumers own token values.
- **Library-owned metrics.** Chrome sizes (menu bar height, status bar padding,
  icon tile hit area) live in the library/shared component, never re-tuned per
  window or per app.
