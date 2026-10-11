---
"@murasaki-io/react98": patch
---

Fix floating UI positioning inside CSS-transformed ancestors. When a `Menu`, `Select`, `Tooltip`, `ContextMenu`, submenu, or window menu bar dropdown renders inside a scaled container (e.g. a `transform: scale()` zoomed desktop), its `position: fixed` offsets resolve against that container's local frame instead of the viewport, which previously misplaced the popup. `useLayer` now detects the fixed containing block, maps the computed viewport placement into its local frame, and scales the layer size and available space accordingly. Behavior is unchanged when no transformed ancestor is present.

`useLayer` also now resolves its first position synchronously before paint instead of deferring to `requestAnimationFrame`. Previously the layer spent one frame at the consumer's raw-anchor fallback; inside a transformed ancestor that fallback is offset from the real anchor, so revealing the layer (compositor-driven `opacity`) while `left`/`top` jumped on the main thread could flash the popup at the wrong spot. The position update is idempotent so the synchronous compute cannot loop.
