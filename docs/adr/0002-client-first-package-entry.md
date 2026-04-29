# Client-first package entry

Murasaki React98 will treat the default `murasaki-react98` package import as a client component boundary for React Server Component frameworks. This matches the library's interactive primitive focus and gives Next.js applications a stable default path for SSR and hydration; pure presentation primitives may be exposed through optional server-safe entries later, but the package root should not imply full Server Component support.
