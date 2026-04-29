# Murasaki React98

Murasaki React98 is a Windows 98-themed React UI component library and playground. This context defines the language used when discussing the component library's runtime support, ownership model, and design-system goals.

## Language

**RSC-safe Client Components**:
Interactive UI primitives that can be used from React Server Component frameworks as explicit client boundaries, with stable server-rendered markup and hydration behavior.
_Avoid_: Perfect SSR support, full Server Component support

**Package-owned component library**:
A UI library model where reusable components, styling, assets, and primitive behavior are maintained inside the published package rather than copied into each consuming application.
_Avoid_: shadcn clone, copy-in component kit

**Self-owned primitives by default**:
A primitive strategy where interaction behavior and accessibility foundations are designed inside the library first, with external headless primitives used only as explicit exceptions or internal implementation details.
_Avoid_: Radix-first, Base UI-first

**Client-first package entry**:
A package entry strategy where the default public import is treated as a client component boundary, while optional server-safe entries may be added later for pure presentation primitives.
_Avoid_: Server-safe root entry, accidental mixed boundary

**Compatibility baseline**:
The first SSR-support milestone where package exports, client boundaries, and a representative Next.js usage path are verified before deeper API or primitive redesign work.
_Avoid_: Full redesign milestone, complete shadcn parity

**Primitive behavior and accessibility**:
The post-baseline quality focus for self-owned primitives, covering keyboard interaction, focus management, ARIA semantics, dismiss behavior, layering, and controlled or uncontrolled state contracts.
_Avoid_: Visual-only shadcn parity, styling polish

**Internal primitive toolkit**:
A non-public layer of shared behavior utilities and primitive building blocks used to make complex components consistent without exposing a separate headless UI API.
_Avoid_: Public headless API, component-by-component behavior patches

**Selective Slot API**:
An API policy where `asChild` or Slot-style element replacement is considered only for components that need semantic composition, and is not part of the compatibility baseline.
_Avoid_: Full-library Slot API, shadcn API clone

**SSR-provided initial theme**:
A theme contract where server-rendered applications provide the initial theme from request-aware data or an inline bootstrap path, while browser storage remains optional client persistence.
_Avoid_: LocalStorage-first SSR theme, post-hydration theme correction

**Explicit global CSS import**:
A styling contract where consuming applications import the library's global stylesheet from their application entry or root layout instead of receiving it as a component import side effect.
_Avoid_: Automatic component-side CSS injection, hidden stylesheet import

**Scoped breaking changes**:
Intentional consumption-contract changes allowed during the pre-stable library phase when they directly support SSR compatibility, package clarity, or long-term primitive quality.
_Avoid_: Silent compatibility drift, unrestricted breaking changes

**Dist-only public exports**:
A package export contract where published entry points resolve to built artifacts and declarations, while source files remain repository-internal implementation details.
_Avoid_: Source-root export, public TS source entry

## Relationships

- An **RSC-safe Client Component** may be composed by a server-rendered application, but its interactive behavior belongs to the client runtime.
- A **Package-owned component library** keeps shared primitives under library ownership while allowing applications to compose them.
- **Self-owned primitives by default** supports a **Package-owned component library** by keeping behavior, styling, and accessibility decisions coherent across primitives.
- A **Client-first package entry** is the default delivery path for **RSC-safe Client Components**.
- A **Compatibility baseline** proves the **Client-first package entry** works in a server-rendered framework before broader primitive redesign.
- **Primitive behavior and accessibility** is the first quality deepening after the **Compatibility baseline**.
- An **Internal primitive toolkit** is the implementation path for **Primitive behavior and accessibility** while preserving the **Package-owned component library** API.
- A **Selective Slot API** may emerge from the **Internal primitive toolkit**, but is not required for the **Compatibility baseline**.
- An **SSR-provided initial theme** keeps **RSC-safe Client Components** visually stable during hydration.
- An **Explicit global CSS import** supports the **Client-first package entry** by keeping global styling setup in the consuming application's root.
- **Scoped breaking changes** may be used to establish the **Compatibility baseline** while the package remains pre-stable.
- **Dist-only public exports** make the **Compatibility baseline** represent the real package consumption path.

## Example dialogue

> **Dev:** "Do we need every primitive to run as a Server Component?"
> **Domain expert:** "No — the target is **RSC-safe Client Components**: server-rendered applications should be able to include the primitives without hydration issues, while interactivity remains client-owned."

> **Dev:** "Should consumers copy the button and menu source into their app like shadcn/ui?"
> **Domain expert:** "No — this remains a **Package-owned component library**. We want shadcn-level API and design quality, not its copy-in ownership model."

> **Dev:** "Should we bring in Radix for menus and dialogs?"
> **Domain expert:** "Only as an exception. The default is **Self-owned primitives by default** so the Windows 98 interaction model stays coherent."

> **Dev:** "Does SSR support mean the package root must be server-safe?"
> **Domain expert:** "No — the root should be a **Client-first package entry**. Server-safe entries can come later for pure presentation primitives."

> **Dev:** "Should the first phase redesign every component API?"
> **Domain expert:** "No — first establish the **Compatibility baseline**, then use that safety net to improve primitives and APIs."

> **Dev:** "After Next compatibility works, should we start by polishing visuals?"
> **Domain expert:** "No — first deepen **Primitive behavior and accessibility**, because self-owned primitives need trustworthy interaction foundations."

> **Dev:** "Should we expose our own Radix-like primitive API immediately?"
> **Domain expert:** "No — start with an **Internal primitive toolkit** so components become consistent before we decide what deserves public API surface."

> **Dev:** "Does shadcn-level API mean every component needs `asChild`?"
> **Domain expert:** "No — use a **Selective Slot API** only where semantic composition actually needs it."

> **Dev:** "Should ThemeProvider discover the user's theme from localStorage during hydration?"
> **Domain expert:** "Not as the SSR contract — use an **SSR-provided initial theme** so the server output and hydrated UI agree."

> **Dev:** "Should importing Button automatically import all global CSS?"
> **Domain expert:** "No — use an **Explicit global CSS import** from the app entry or root layout."

> **Dev:** "Can the first SSR support pass change how users import styles?"
> **Domain expert:** "Yes, as a **Scoped breaking change** because the package is pre-stable and the new contract is clearer."

> **Dev:** "Should consumers import the TypeScript source entry?"
> **Domain expert:** "No — use **Dist-only public exports** so tests and examples match published package behavior."

## Flagged ambiguities

- "Perfect SSR support" was used ambiguously — resolved: the target is **RSC-safe Client Components**, not full Server Component primitives.
- "Like shadcn/ui" was used ambiguously — resolved: the target is shadcn-level component design within a **Package-owned component library**, not a copy-in source model.
- "Autonomous primitives" was sharpened to **Self-owned primitives by default** — external headless primitives remain possible exceptions, not the foundation.
- "SSR-compatible package" was sharpened to a **Client-first package entry** for the default import, with possible server-safe entries later.
- "First phase" was resolved as the **Compatibility baseline**, not complete shadcn parity.
- "Shadcn-level quality" was sharpened to prioritize **Primitive behavior and accessibility** after compatibility, not just visual or documentation parity.
- "Self-owned primitives implementation" was resolved as an **Internal primitive toolkit** first, not immediate public headless APIs.
- "Shadcn-style API" was clarified as a **Selective Slot API**, not full-library `asChild` support.
- "Theme persistence" was clarified as **SSR-provided initial theme** for server-rendered frameworks, with browser storage optional.
- "Style support" was resolved as **Explicit global CSS import**, not hidden CSS side effects from component imports.
- "Compatibility promise" was resolved as allowing **Scoped breaking changes** for SSR support during the pre-stable phase.
- "Package exports" was resolved as **Dist-only public exports**, not source-root public entry points.
