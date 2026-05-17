# Scoped layer roots

@murasaki/react98 floating layers render through a package-owned scoped layer root instead of each component portaling directly to `document.body` with a large global z-index. The public `LayerProvider` creates a local portal target, and floating primitives use the internal layer portal helper to find that target. When no provider is present, the helper falls back to `document.body` for backward compatibility.

## Context

Menus, context menus, tooltips, and other transient UI need to escape local overflow clipping, but global body portals couple the component library to the consuming application's z-index namespace. A consumer cannot reliably predict whether `9999` belongs above a monitor overlay, shell chrome, modal, or app-owned effect.

The playground CRT effect exposed this coupling: submenu content rendered at the body level could paint above the scanline overlay even though the overlay belonged to the shell area the menu visually lived inside.

## Decision

- Floating library layers must use the shared layer portal helper.
- `LayerProvider` is the public app-shell seam for placing library floating layers inside a consumer-owned stacking context.
- Component-level floating layers use semantic local tokens such as `--react98-layer-popup-z-index` and `--react98-layer-tooltip-z-index`, not global `9999` values.
- Portal target ownership and collision boundaries remain separate. The layer target controls paint order; props such as `boundaryRef` and `container` continue to control geometry.
- The `document.body` portal remains only as the compatibility fallback when no scoped layer provider is present.

## Consequences

- Consumers can isolate library UI layers from app overlays by placing one provider at the shell or app-root seam.
- Floating components no longer need to know or outbid consumer z-index values.
- App shells with visual effects, framed desktops, or embedded runtimes can keep library popups inside the same visual stacking context as the trigger.
- New floating primitives should not call `createPortal(..., document.body)` directly.
