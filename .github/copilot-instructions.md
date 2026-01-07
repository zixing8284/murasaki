# Murasaki React98 - Copilot Instructions

Windows 98-themed React component library built with Tailwind CSS v4 and React Compiler.

## React 19 Best Practices

Follow React 19 official documentation and ESLint rules strictly:
- **No setState in useEffect**: Derive state during render or use event handlers instead
- **Use `use()` hook**: For reading promises/context in render (React 19 feature)
- **Prefer `useActionState`**: For form actions instead of manual useState + handlers
- **Use `useOptimistic`**: For optimistic UI updates
- **Compiler-friendly code**: Avoid patterns that break React Compiler (mutable refs in render, etc.)

```tsx
// ❌ Bad: setState in useEffect
useEffect(() => {
  setDerivedValue(computeValue(props))
}, [props])

// ✅ Good: Derive during render
const derivedValue = computeValue(props)

// ✅ Good: useMemo for expensive computation
const derivedValue = useMemo(() => expensiveCompute(props), [props])
```

### React Rules (react.dev/reference/rules)

**Components and Hooks must be pure:**
- **Idempotent** - Same inputs (props, state, context) → same output (JSX)
- **No side effects in render** - Side effects must run outside rendering (e.g., in useEffect or event handlers)
- **Don't mutate non-local values** - Never mutate props, state, or values outside component scope during render

**Hooks rules:**
- Only call Hooks at the top level (not in loops, conditions, or nested functions)
- Only call Hooks from React functions (components or custom hooks)
- Hook names must start with `use` followed by uppercase letter

**Props and state are immutable:**
```tsx
// ❌ Bad: Mutating props
function Component({ items }) {
  items.push(newItem)  // Never mutate props!
}

// ❌ Bad: Mutating state directly
const [items, setItems] = useState([])
items.push(newItem)  // Never mutate state!

// ✅ Good: Create new references
setItems([...items, newItem])
```

**Return values and arguments to Hooks are immutable:**
- Don't mutate values returned from hooks (e.g., `useState` value)
- Don't mutate arguments passed to hooks after passing them

## Architecture

- **`src/components/`** - Component library (each component in its own folder with `demos/` subfolder)
- **`src/lib/utils.ts`** - Shared utilities including `cn()` helper that auto-injects base 11px font
- **`src/globals.css`** - Win98 CSS variables, Tailwind theme, custom utilities (`sunken-panel`, `pixelated`)
- **`src/assets/`** - SVG icons and pixel fonts (MS Sans Serif)
- **`playground/`** - Development sandbox (run with `pnpm play`)

## Component Patterns

### Styling with CVA + Tailwind
All components use `class-variance-authority` (cva) for variant-based styling:

```tsx
import { cva } from 'class-variance-authority'
import { cn } from '#/lib/utils'

const buttonVariants = cva(['base-classes'], {
  variants: { active: { true: 'active-classes' } }
})

export function Button({ className, active, ...props }) {
  return <button className={cn(buttonVariants({ active, className }))} {...props} />
}
```

### Win98 Visual Effects
Use semantic shadow utilities for 3D effects:
- `shadow-raised` - Elevated button appearance
- `shadow-sunken` - Pressed/inset appearance
- `shadow-border-field` - Input field inset border
- `sunken-panel` - Scrollable content area with groove border

### Color Variables
Always use semantic Tailwind colors (mapped to Win98 palette in globals.css):
- `bg-btn-face`, `text-btn-text`, `bg-btn-hilight`, `text-btn-shadow`
- `bg-window-bg`, `text-window-text`
- `bg-title-active`, `text-title-active-text`

### Form Controls Pattern
Radio buttons and checkboxes use hidden input + styled label with `::before`/`::after`:
- Input is visually hidden (`opacity-0 fixed`)
- Label pseudo-elements render custom checkbox/radio using SVG backgrounds
- State styling via sibling selectors: `checked:[&+label::after]:bg-[url(...)]`

### Path Alias
Use `#/` for src imports: `import { cn } from '#/lib/utils'`

### Custom Hooks
Place hooks in the component folder as `use-{name}.ts`:
- `use-dropdown-state.ts` - State management for dropdown
- `use-window-draggable.ts` - Drag behavior for windows

### Context for Grouped Components
Use React Context when child components need shared state (see `OptionGroup`):
```tsx
// option-context.ts - Define context with null default + consumer hook with runtime validation
export const OptionButtonGroupContext = createContext<OptionGroupProps | null>(null)

export function useOptionButtonGroupContext(): OptionGroupProps {
  const context = use(OptionButtonGroupContext)
  if (!context) {
    throw new Error('OptionButton must be used within an OptionGroup')
  }
  return context
}

// option-group.tsx - Provider component
export default function OptionGroup({ children, name, onChange, selectedValue }) {
  return (
    <OptionButtonGroupContext value={{ name, onChange, selectedValue }}>
      {children}
    </OptionButtonGroupContext>
  )
}
OptionGroup.Option = OptionButton  // Attach child as static property
```
**Runtime error pattern**: Always use `createContext(null)` + throw error in consumer hook. This ensures users see clear errors when components are used outside required providers.

## Commands

```bash
pnpm play      # Dev playground (Vite)
pnpm build     # Build library (tsdown)
pnpm test      # Unit tests (Vitest + Playwright)
pnpm typecheck # TypeScript validation
pnpm lint:fix  # ESLint with auto-fix
```

## Key Conventions

1. **Component exports**: Add to `src/index.ts` only when component is production-ready
2. **Demo files**: Create demos in `component-name/demos/*.tsx` to showcase variants
3. **Icons**: Place SVG icons in `src/assets/icons/` and reference via URL in Tailwind classes
4. **Spacing**: Use CSS variables (`--spacing-element`, `--spacing-label`) via Tailwind tokens
5. **Font size**: `cn()` auto-applies 11px base; override with explicit `text-[size]` if needed

## Testing

Uses Vitest with Playwright browser testing (`vitest-browser-react`):
```tsx
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from '../src'

it('renders button', async () => {
  const screen = await render(<Button>Click</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```
Run tests: `pnpm test`
