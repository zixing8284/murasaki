# @murasaki/react98

@murasaki/react98 is a Windows 98-themed React UI component library and playground. This context keeps only the active vocabulary that should guide future design discussions. Settled decisions and historical rationale live in `docs/adr/`.

## Language

**Package-owned component library**:
A UI library model where reusable components, styling, assets, and primitive behavior are maintained inside the published package rather than copied into each consuming application.
_Avoid_: shadcn clone, copy-in component kit

**Self-owned primitives by default**:
A primitive strategy where interaction behavior and accessibility foundations are designed inside the library first, with external headless primitives used only as explicit exceptions or internal implementation details.
_Avoid_: Radix-first, Base UI-first

**Client-first package entry**:
A package entry strategy where the default public import is treated as a client component boundary, while optional server-safe entries may be added later for pure presentation primitives.
_Avoid_: Server-safe root entry, accidental mixed boundary

**Internal primitive toolkit**:
A non-public layer of shared behavior utilities and primitive building blocks used to make complex components consistent without exposing a separate headless UI API.
_Avoid_: Public headless API, component-by-component behavior patches

**Scoped layer root**:
A consumer-placeable portal target for transient library UI such as menus, context menus, tooltips, and future popups. It keeps @murasaki/react98 floating layers inside a local stacking context instead of competing in the global `document.body` z-index namespace.
_Avoid_: Global z-index race, per-component body portal

**Explicit global CSS import**:
A styling contract where consuming applications import the library's global stylesheet from their application entry or root layout instead of receiving it as a component import side effect.
_Avoid_: Automatic component-side CSS injection, hidden stylesheet import

**Component API consistency**:
A quality standard where all components follow the same prop naming, controlled/uncontrolled, and `data-*` state attribute conventions, documented with fixed Accessibility, Keyboard, and SSR sections.
_Avoid_: Per-component API drift, undocumented interaction contracts

**Standalone docs site**:
The primary documentation product for component reference, examples, navigation, search, and public browsing outside the Windows 98 playground shell.
_Avoid_: Playground-owned docs app, desktop-only documentation

**TSX example module**:
A documentation example maintained as an ordinary typed React module that can be imported, rendered, linted, and optionally shown with explicit source text.
_Avoid_: Markdown live block, generated demo module

**Scoped breaking changes**:
Intentional consumption-contract changes allowed during the pre-stable library phase when they directly support SSR compatibility, package clarity, or long-term primitive quality.
_Avoid_: Silent compatibility drift, unrestricted breaking changes

**Dist-only public exports**:
A package export contract where published entry points resolve to built artifacts and declarations, while source files remain repository-internal implementation details.
_Avoid_: Source-root export, public TS source entry

**Theme source stylesheet exception**:
A named exception to **Dist-only public exports** where `@murasaki/react98/theme.css` intentionally resolves to `./src/theme.css` so Tailwind CSS v4 consumers can import the source stylesheet with library-owned theme variables. `@murasaki/react98/globals.css` remains the built CSS entry for consumers that want compiled global styles.
_Avoid_: Accidental source export, unrecorded package export drift

**Pixel-font clipping safety**:
A layout rule for Windows 98 pixel-font text where the element that clips text also keeps a small left inset before the first glyph, preventing fractional device-pixel alignment from dropping the glyph's leftmost column.
_Avoid_: Flush clipped glyph, nested zero-padding overflow clip, font-smoothing workaround

**Playground public asset boundary**:
A playground convention that keeps reusable semantic icons under `packages/playground/public/icons/` and content/decorative bitmaps under `packages/playground/public/img/`; the `img` directory name stays singular.
_Avoid_: New semantic icons in `public/img`, unsearchable one-off asset paths
