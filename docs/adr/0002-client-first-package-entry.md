# Client-first package entry

@murasaki/react98 will treat the default `@murasaki/react98` package import as a client component boundary for React Server Component frameworks. This matches the library's interactive primitive focus and gives Next.js applications a stable default path for SSR and hydration; pure presentation primitives may be exposed through optional server-safe entries later, but the package root should not imply full Server Component support.

## Amendment: server sub-entry

A `@murasaki/react98/server` sub-entry will be added during the API consistency phase (phase 3). It exposes pure presentation primitives — components with no interactive behavior, event handlers, or browser-only APIs — as server-safe exports. The root import remains client-first; the server entry is opt-in for applications that need to render non-interactive primitives in Server Components.

Scope:
- Only components verified to have zero client-side dependencies qualify.
- The server entry re-exports from the same built package; it does not create a separate build target.
- Components graduate to the server entry individually; no bulk migration.
