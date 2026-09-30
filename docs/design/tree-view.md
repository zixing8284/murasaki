# Tree view

Rules for the `TreeView` disclosure/indentation behaviour, as used by the
Explorer Folders pane.

## Expand / collapse interaction

The tree follows Windows Explorer, where expanding a branch and selecting a row
are **separate** gestures:

- The `+` / `-` disclosure box is the only single-click expand/collapse target.
  Clicking it toggles the branch and does **not** change selection (it stops
  event propagation, so the row's `onClick` never fires).
- A single click on the row body (icon or label) fires `onClick`
  (select/activate) and never expands or collapses. In particular, clicking an
  already-expanded row does not collapse it.
- A double click on the row body toggles expand/collapse.
- Keyboard: `ArrowRight` expands a collapsed branch or moves into its first
  child; `ArrowLeft` collapses an expanded branch or moves to the parent. Both
  reuse the row's own disclosure control so the keyboard and pointer paths share
  one toggle path.

Do not reintroduce a "row click toggles" behaviour (the native
`<details>`/`<summary>` default). A surface that genuinely wants single-click to
toggle — e.g. the IE Favorites Explorer bar — expresses that through its own
`onClick` handler, not by changing the component.

Collapsed branches unmount their children rather than hiding them, so roving
focus naturally skips them.

## Indentation and connectors

- Each nested level indents one step and draws the dotted "elbow" connectors: a
  vertical dotted spine with a short horizontal stub into each child. The stub
  reaches almost to the child glyph (~1px gap) — do not leave a wide gap between
  the dotted line and the icon.

## Toggle-less namespace root

- A namespace root such as **Desktop** has no expand/collapse control of its
  own: its children (My Computer, Network Neighborhood, …) carry the toggles.
- The root's children use reduced indentation so their `+`/`-` disclosure box
  sits **beneath the root icon**, with the dotted spine dropping from under that
  icon to connect them.

## Disclosure glyphs

- The `+` / `-` disclosure box is a crisp inline SVG using theme variables, not a
  font character, so it stays pixel-sharp at the 11px base size.
