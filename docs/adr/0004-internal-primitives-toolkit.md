# Internal primitive toolkit

@murasaki-io/react98 maintains a non-public layer of primitives to keep complex component behavior consistent across the library. Generic behavior used by multiple components lives under `src/primitives/`. Component-specific context, state, and helper modules live flat inside the component directory (e.g. `components/window/window-context.ts`). These primitives are internal implementation details — they are not exported through `src/index.ts` and are not part of the published package API.

## Scope

The toolkit covers cross-cutting behavior that multiple components need:

| Hook | Responsibility |
|------|----------------|
| `useDismissable` | Escape-key and outside-pointer dismissal for transient layers |
| `useLayer` | Anchor-relative positioning with viewport flip |
| `useFocusScope` | Focus trap, auto-focus, and restore for transient layers |
| `useCollection` | DOM-order item registry for collection-driven components |
| `useTypeahead` | Character buffer and timeout for type-to-search |
| `useRovingFocus` | Container-delegated arrow-key navigation (Home/End included) |

## Non-scope

These concerns remain in the consuming component, not in the toolkit:

- **tabIndex management** — the toolkit moves focus but does not set tabIndex; consumers own roving-tabindex state.
- **Grid two-axis movement** — table/grid keyboard patterns are not covered by `useRovingFocus`.
- **External state machines** — open/close, selection, and highlight state are component-owned.
- **Activation semantics** — whether an item activates on focus or on explicit confirmation is a component decision.

## Usage rule

Components should reuse toolkit hooks rather than reimplementing dismissal, positioning, focus, or navigation logic locally. Component-owned primitive modules should stay inside the owning component directory unless at least two components need them; then promote the module to `src/primitives/` instead of importing across component directories. When a component's behavior diverges from the toolkit default, the divergence should be documented with a comment in the component file explaining why.

## Testing

Toolkit behavior is covered by component-level browser tests (Vitest + Playwright). The hooks themselves do not have standalone unit tests — their correctness is verified through the components that consume them.
