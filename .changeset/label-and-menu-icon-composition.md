---
"@murasaki-io/react98": minor
---

Add a standalone `Label` primitive and make menu icons composition-based.

- **New `Label` component** — a themed `<label>` primitive with a `disabled`
  state. `TextBox`, `NumberBox`, and `SelectNative` now render it internally for
  their built-in `label` prop (no public API change).
- **Menu icons are now composed as children.** The `icon` prop on `MenuItem`
  and `MenuSubTrigger` has been removed; render your icon as the first child and
  size it however you like. The check/radio indicator gutter and the
  `reserveIconSpace` alignment prop are unchanged. **Breaking:** replace
  `<MenuItem icon={<Icon />}>Label</MenuItem>` with
  `<MenuItem><Icon /> Label</MenuItem>`.
- **TreeView disclosure glyphs** — the default expand/collapse `+`/`-` are now
  crisp, centered SVG glyphs instead of off-center text characters, and custom
  `expandIcon` / `collapseIcon` content is clipped to the disclosure box.
