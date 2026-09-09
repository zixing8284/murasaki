---
"@murasaki-io/react98": patch
---

Align window chrome and tree metrics with the Windows 98 reference:

- `WindowMenuBar` is now a fixed 20px bar and its triggers stretch to fill the
  bar height, so the hover/open highlight covers the full bar.
- `WindowStatusBar` bakes in canonical padding (flush to the frame edges with a
  top gap), so the `WindowResizeGrip` lands in the status bar's bottom-right
  corner without per-window tuning. Status bar panels use a new etched
  `--shadow-status-field` bevel (soft gray top-left + white bottom-right) that
  matches Win98 more closely than the sunken-button shadow.
- `TreeView` renders a toggle-less namespace root's children with reduced
  indentation so their disclosure boxes sit beneath the root icon, and tightens
  the dotted connector-to-glyph gap.
