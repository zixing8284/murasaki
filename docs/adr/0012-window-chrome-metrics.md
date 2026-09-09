# Window chrome metrics and menu gutter consistency

## Context

Window chrome (menu bar, status bar, resize grip) and dropdown menus were styled per-window in the playground. Consumers set their own menu bar heights (`h-4` vs `h-5`) and status bar padding (`pt-1` vs `px-0.5 py-0.5` vs none), so the same chrome looked different across My Documents, Internet Explorer, Outlook Express, Welcome, and Media Player. The resize grip only landed cleanly in the bottom-right of the status bar in windows that happened to pad the bar correctly.

Dropdown menus had a related inconsistency: rows with a check/radio indicator reserved a 16px leading gutter, while plain rows did not, so labels within one menu did not align.

These are recurring "looks slightly off" bugs. The fix is to make the metrics a property of the shared components, not of each consumer, and to write the rule down so new windows and menus inherit it.

## Decision

Window chrome metrics live in the library components, measured against win99.dev, and consumers do not re-set them.

### Menu bar

- `WindowMenuBar` is a fixed `20px` (`h-5`) bar — the win99 reference height. Triggers stretch to the full bar height (`items-stretch` + `flex items-center`) so the hover/open highlight covers the whole bar like Windows 98.
- Consumers must not override the bar height. Compose a bespoke inline bar only for genuinely non-standard chrome (e.g. the Media Player transport), and make that intent explicit.

### Status bar

- `WindowStatusBar` bakes in the canonical layout: `shrink-0`, a `1px` inter-panel gap, and a top gap (`pt-1`), flush to the left and right window edges.
- Because the bar is flush to the frame and the `WindowResizeGrip` is absolutely positioned at the frame's bottom-right (`right-0.5 bottom-0.5`), the grip lands in the bottom-right corner of the status bar in every window automatically. Consumers must not add horizontal padding or re-pad the bar; doing so pushes the last panel away from the grip.
- Status bar panels (`WindowStatusBarField`) use the etched sunken edge `--shadow-status-field` (soft gray top-left + white bottom-right, Win98 `BDR_SUNKENOUTER`), not the harsher black-cornered `--shadow-sunken-outer` of a sunken button.

### Menu item gutter

- Within a single dropdown menu, every row reserves the shared 16px leading indicator gutter. Checkable rows fill it with their check/radio bullet or an icon; plain rows and submenu triggers opt in with `reserveIconSpace`. This keeps all labels in a menu aligned regardless of which rows are checkable.
- Mutually exclusive choices (e.g. the View mode: Large Icons / Small Icons / List / Details) use `MenuRadioGroup` + `MenuRadioItem` (radio bullet), not checkboxes. Independent toggles (Status Bar, Folders, toolbar parts) use `MenuCheckboxItem` (check).

## Consequences

- New windows get correct, uniform chrome for free by using `WindowMenuBar` / `WindowStatusBar` without size or padding overrides.
- The resize grip is correct by construction; there is no per-window grip alignment to tune.
- Menu authors reserve the gutter on every row of a menu that has any indicator, so labels never go ragged.
- Changing a metric (bar height, status field bevel, gutter width) is a single library edit that updates every consumer.

## Non-goals

- Forcing the Media Player transport or other intentionally bespoke chrome into the standard bar metrics.
- Adding per-consumer knobs for bar height or status bar padding; the point is that these are not consumer concerns.
