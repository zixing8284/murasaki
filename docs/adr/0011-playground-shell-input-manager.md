# Playground shell input manager

## Context

Chrome DevTools device emulation exposes a gap between the playground and reference Windows-like shells such as win99.dev. Touch interactions are not just mouse interactions with a larger contact area:

- Browser touch-adjustment can retarget pointer and click events to nearby controls inside the touch contact area.
- Native touch events carry raw touch coordinates that are not adjusted, but the event target can still be redirected.
- Cross-document iframes can swallow move/up events unless they are disabled or bypassed during shell interactions.
- Desktop operations such as window drag, resize, icon drag/drop, and lasso selection need a single gesture owner rather than component-local patches.

Previous fixes improved individual symptoms, but the implementation risk is accumulating scattered touch logic across window chrome, menus, desktop icons, scrollbars, and playground shell code.

## Decision

The playground will use a **playground shell input manager** as the architectural owner for mobile/device-emulation shell behavior.

The input manager is a playground concern, not a generic package component concern. It will cover shell-level interactions:

- window drag and resize
- desktop icon drag/drop and multi-drag
- desktop lasso selection on touch
- shell chrome hit-testing where Windows-like raw-point behavior is required
- iframe capture during shell interactions
- scrollbars and scroll areas when they participate in the shell surface

For touch, the shell input manager uses native touch events (`touchstart`, `touchmove`, `touchend`, `touchcancel`) and raw touch coordinates (`Touch.clientX` / `Touch.clientY`) as the source of truth. Mouse and pen paths can continue to use pointer or mouse events where appropriate.

The implementation should study react-rnd and win99.dev, but remain self-owned in this repository. We will not adopt `react-rnd` directly for the playground shell.

The implementation shape is root event delegation plus a shell input registry:

- the shell root owns the document/window move/end listeners and gesture lifecycle;
- windows, resize handles, desktop icons, lasso zones, iframe surfaces, and scroll affordances register geometry and callbacks with the manager;
- raw coordinates choose the owning registered surface, not the browser-adjusted event target;
- the existing package-level `useDraggable` / `useResizable` hooks should not accumulate playground-specific touch behavior. Shell-specific touch behavior moves out of the UI package and into the playground shell input manager.

Migration should be one architectural slice staged internally: build the shared manager and gesture core first, then migrate the core shell interactions together so the committed result has a single owner rather than a temporary mix of old and new ownership.

## Consequences

- Touch behavior must be fixed at the owning shell interaction layer, not by adding per-component special cases.
- Generic UI components should not accumulate playground-only touch heuristics.
- Device-emulation behavior becomes a first-class verification target, especially for raw touch point hit-testing, desktop lasso selection, window drag/resize, iframe crossing, and desktop icon drag/drop.
- Reference behavior should be compared against win99.dev source and runtime behavior, but this repo keeps its own implementation so it remains compatible with the package's self-owned primitive strategy.
- Automated tests should cover the manager's pure gesture arbitration and registered-surface routing. Final acceptance still requires a manual Chrome DevTools device toolbar checklist because synthetic touch dispatch does not faithfully reproduce all browser touch-adjustment behavior.

## Non-goals

- Replacing the playground shell with `react-rnd`.
- Treating browser-adjusted click targets as authoritative for shell behavior that needs Windows-like precision.
- Moving playground-only shell behavior into the public UI component API.
- Continuing to add independent touch fixes to individual UI components when the behavior belongs to the shell input manager.
