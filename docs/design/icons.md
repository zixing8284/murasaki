# Icon tiles

Covers the icon + label tiles shown on the desktop and in the Explorer content
pane (My Documents). Both surfaces share one component,
`packages/playground/src/components/icon-tile.tsx`, so they behave identically.

## Hit area

The clickable/selectable area is the **icon and the label only** — never the
whole grid cell or the padding around them.

- The interactive wrapper (the desktop cell `div[role="button"]` or the content
  pane `<button>`) is `pointer-events-none`.
- Only the icon and the label inside `IconTile` are `pointer-events-auto`.
- Clicks land on the icon/label and bubble to the wrapper's handlers; clicks in
  the surrounding gap fall through to the surface behind and **deselect**
  (desktop marquee / content pane blank-click).

On the desktop this composes with the shell input surface's occlusion-aware hit
test (`elementFromPoint` within the cell), so a gesture only starts when the
press is actually on the glyph or label. See
[ADR 0011](../adr/0011-playground-shell-input-manager.md).

## Label

- Long labels **truncate** with an ellipsis when the tile is not selected.
- The **selected** tile shows the **full** label (it wraps to as many lines as
  needed) so the name is readable while active.
- The unselected label colour is **inherited** from the surface
  (`--desktop-text` on the desktop, `--window-text` in a window); the selected
  label uses the highlight (`--hilight` / `--hilight-text`) with a dotted focus
  ring, matching classic Explorer selection.

## Icon

- Sizes follow the view: 32px tiles (desktop, Large Icons) and 16px rows (Small
  Icons, List). Assets are flat `{name}-{size}.png`; the large view swaps
  `-16.png` for `-32.png`.
- The **selected** icon is tinted (a filter approximating the Win98 blue blend)
  so selection reads on the glyph as well as the label.

## Variants

- `tile` — icon above a centered, wrapping label (desktop, Large Icons).
- `row` — icon beside a single-line truncated label (Small Icons, List).
- Details view is a table row, not a tile; the whole row is selectable there.
