# Desktop scaling modes and the coordinate conversion seam

## Context

The playground renders the Windows 98 desktop at a fixed logical resolution (e.g.
1024×768) and fits it to the browser viewport, like elternal.world. The fit is a
CSS `transform: scale()` on the shell's screen container.

A scaled ancestor is a leaky abstraction: it changes how descendant coordinates
resolve. Two whole classes of bug came from treating client/viewport pixels as if
they were desktop pixels:

- **Floating UI** (`Menu`, `Select`, `ContextMenu`, `Tooltip`, submenus) uses
  `position: fixed`. A transformed ancestor becomes the fixed containing block, so
  the popup's offsets resolve in that box's scaled local frame, not the viewport.
- **Desktop pointer interactions** (lasso selection, icon drag, window drag/resize)
  read `clientX/clientY` and compare them against DOM rects or logical grid metrics.
  Under scale, a client delta is larger than the matching logical delta by the scale
  factor, so marquees drifted and drops/ghosts landed off by ~scale.

Fixing these ad hoc — one component, one surface at a time — produced a "whack-a-mole"
feeling. The real problem is that coordinate space is implicit, and every surface that
crosses the viewport↔desktop boundary has to remember to convert. This ADR writes the
contract down so the conversion lives on named seams instead of being rediscovered.

A second, related problem was *how* the scale is applied. The fixed-size box was
flex-centred (position reacts to the viewport synchronously) while the scale was
recomputed asynchronously (ResizeObserver → React state → render). During resize and
browser zoom the two disagreed for a frame, so the desktop lurched off-screen and
snapped back — a visible flicker.

## Decision

### Two explicit modes, not one scaled mode with a padding toggle

- **Fit (default)** — the elternal letterbox. A fixed-resolution screen box is scaled
  into the padded host with `transform: translate(offset) scale(s)` and
  `transform-origin: 0 0`. The scale and the centring offset come from one measurement
  (`useContainScale` returns `{ scale, offsetX, offsetY }`) and are applied in the same
  commit, so position and scale never disagree — no resize/zoom lurch. `transform-origin`
  is the top-left (matching elternal), not `center`.
- **Fill ("Cover full screen")** — the desktop *is* the viewport: no fixed resolution,
  **no transform**. Every coordinate is native (identity scale), so no conversion runs,
  and browser zoom reflows the desktop instead of being fought by a refit. This is the
  simplest mode and the one to prefer when a consumer does not need the fixed-resolution
  look.

### One conversion seam per layer

When a transform is present (fit mode), exactly two seams bridge viewport space and the
desktop's local frame. New code must use them, not reinvent per-surface math:

- **Library popups** convert inside `useLayer` via `getFixedFrame()`: it detects the
  transformed containing block and maps the computed viewport placement into the local
  frame. It is identity when no transformed ancestor exists, so library consumers without
  a scaled desktop are unaffected.
- **Playground pointer input** converts via `scaleMagnitude(getScreenFromLocalMatrix(el))`
  in `shell/input/geometry.ts`. Window drag/resize, desktop lasso selection, and desktop
  icon drag all divide client-space offsets/deltas by this scale to reach logical desktop
  pixels. `getScreenFromLocalMatrix` uses only the linear part of the ancestor matrix, so
  the translate component of the fit transform does not affect delta mapping.

Only axis-aligned scale/translate is inverted. Adding rotation or skew to the desktop
would require full matrix math in both seams.

## Consequences

- Fit mode keeps the exact elternal look and is flicker-free on resize/zoom because scale
  and offset update atomically from the top-left origin.
- Fill mode is fully native: identity scale means popups, selection, and drag need no
  compensation and cost nothing.
- Any new interactive desktop surface stays correct by routing its pointer coordinates
  through the input geometry seam; any new floating UI stays correct by going through
  `useLayer`. Neither needs bespoke scale handling.
- `useLayer` resolves its first position synchronously (before paint) so popups never
  flash at a raw-anchor fallback that, under scale, sits far from the real anchor.

## Non-goals

- Supporting rotated/skewed desktop transforms (scale/translate only).
- Removing the fit-mode transform. The scaled containing block is the price of the
  fixed-resolution letterbox and of rendering popups inside the screen (so CRT scanlines
  cover them, per ADR 0010); the seams above pay that price in one place each.
