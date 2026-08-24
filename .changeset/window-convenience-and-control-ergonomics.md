---
'@murasaki-io/react98': minor
---

Add a top-level `Window` convenience component that composes `WindowProvider` + `WindowFrame` + `WindowTitleBar` + drag/resize wiring behind a single prop surface (`title`, `defaultPosition`, `defaultSize`, `draggable`, `resizable`, and friends). The composable primitives remain exported for full control.

Also improve control ergonomics:

- `Button` gains an `iconOnly` variant that drops the 75px min-width and restores the real text color so `fill="currentColor"` SVG icons render correctly.
- `Select` no longer requires `name`; omit it for UI-only selects.
- `Slider` gains a `fill` prop that renders a filled progress portion of the track.
