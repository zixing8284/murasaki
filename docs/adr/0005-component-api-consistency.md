# Component API consistency

@murasaki/react98 will adopt a consistent API contract across all components covering prop naming conventions, controlled/uncontrolled state patterns, and `data-*` state attributes for CSS styling hooks. This is a phase-3 quality goal that depends on the internal primitive toolkit (ADR 0004) being stable first.

## Prop naming

- Boolean props use positive framing (`disabled`, `open`, `required`) — avoid double-negatives (`!hidden`).
- Native DOM event passthrough keeps the native prop name (`onChange`, `onClick`).
- Controlled state callbacks use value-level names that mirror the state prop (`onValueChange`, `onCheckedChange`, `onExpandedChange`) so React state setters can be passed directly.
- Ref-forwarding props use the element name (`triggerRef`, `contentRef`) rather than generic `ref` when a component exposes multiple ref targets.

## Controlled / uncontrolled

- Every stateful prop (open, value, checked, selected, etc.) supports both controlled and uncontrolled usage.
- Uncontrolled usage provides a `default*` counterpart (`defaultValue`, `defaultOpen`).
- When both are provided, the controlled value wins and a dev-mode warning is emitted.
- Internal state is managed with `useState` + `useEffect` sync, not `useRef` hacks.

## `data-*` state attributes

- Components expose boolean state as `data-*` attributes on their DOM root for CSS styling (`data-open`, `data-disabled`, `data-selected`, `data-orientation`).
- Attribute names are kebab-case and mirror the prop name exactly.
- These are styling hooks only — behavioral state is not leaked through DOM attributes.

## Deferred decisions

- **Selective Slot API** (`asChild` / Slot-style element replacement): not currently planned. Will be evaluated per-component if semantic composition needs arise, not applied library-wide.
- **Server sub-entry** (`@murasaki/react98/server`): covered by ADR 0002. Not implemented during phase 3 — deferred until a consuming application has a verified need.

## Documentation

Each component page will include three fixed sections:

- **ARIA** — ARIA roles, states, and properties used.
- **Keyboard** — all keyboard interactions and their behavior.
- **SSR** — hydration behavior, server-rendered markup considerations.
