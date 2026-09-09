# Tree view

Rules for the `TreeView` disclosure/indentation behaviour, as used by the
Explorer Folders pane.

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
