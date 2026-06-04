# Client-first package entry

@murasaky/react98 will treat the default `@murasaky/react98` package import as a client component boundary for React Server Component frameworks. This matches the library's interactive primitive focus and gives Next.js applications a stable default path for SSR and hydration; pure presentation primitives may be exposed through optional server-safe entries later, but the package root should not imply full Server Component support.

## Amendment: server sub-entry

A `@murasaky/react98/server` sub-entry may be added in a future phase. It would expose pure presentation primitives — components with no interactive behavior, event handlers, or browser-only APIs — as server-safe exports. The root import remains client-first; the server entry would be opt-in for applications that need to render non-interactive primitives in Server Components. This was evaluated but not implemented during phase 3 (API consistency); it is deferred until a consuming application has a verified need.

Scope:
- Only components verified to have zero client-side dependencies qualify.
- The server entry re-exports from the same built package; it does not create a separate build target.
- Components graduate to the server entry individually; no bulk migration.
