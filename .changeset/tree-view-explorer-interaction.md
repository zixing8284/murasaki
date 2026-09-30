---
"@murasaki-io/react98": minor
---

**TreeView**: branches now follow Windows Explorer interaction. The `+` / `-`
disclosure box is the only single-click expand/collapse target; a single click
on the row selects/activates (`onClick`) without toggling, and a double click on
the row toggles expand/collapse. Clicking an already-expanded row no longer
collapses it.

The obsolete `preventCollapse` prop is removed — single-click no longer toggles
at all, so it has no purpose. Surfaces that want single-click to toggle (e.g. an
IE Favorites bar) can wire that through their own `onClick`. Collapsed branches
now unmount their children instead of hiding them.
