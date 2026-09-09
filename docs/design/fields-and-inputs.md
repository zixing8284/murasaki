# Fields and inputs

## Build from the component library

In the playground, compose inputs from `@murasaki-io/react98` components
(`TextBox`, `NumberBox`, `Select`, `Checkbox`, `OptionButton`, …) instead of raw
native controls wrapped in bespoke tag + class styling. This exercises the real
component surface and keeps the Win98 field treatment (sunken bevel, arrow
affordance, focus ring) consistent everywhere.

Native elements are acceptable only for behavior the library does not model
(hidden `type="file"` / `type="color"` pickers) or composite host chrome with no
component equivalent.

## Sunken field bevel

Input fields use the etched inset frame (`--shadow-border-field`), with left
breathing room for pixel text (avoid placing glyphs flush against the 1px inset;
prefer at least `pl-1`/`pl-2`). See [ADR 0008](../adr/0008-pixel-font-clipping-safety.md).

## Address bar (Explorer)

The Explorer address bar is a **`Select`** (an editable combobox in Windows 98),
not a bespoke field with a hand-rolled dropdown glyph:

- Use `SelectTrigger` for the field — it renders the standard Win98 dropdown
  arrow affordance and the sunken frame at the canonical 21px height. Place the
  location icon and the current path text inside it.
- Use `SelectContent` / `SelectItem` for the drop-down list of navigable
  locations, indented to mirror the namespace hierarchy.
- Do not re-create the dropdown button as a raised `div` + inline SVG; that
  drifts from the real control's arrow, sizing, and pressed states.
