import { createContext, use } from 'react'

// ─── Context ──────────────────────────────────────────────────────────────────

export interface ContextMenuContextValue {
  open: boolean
  x: number
  y: number
  /** Element to constrain the popup within (null = viewport). */
  container: HTMLElement | null
  openAt: (x: number, y: number) => void
  close: () => void
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the surrounding `<ContextMenu>` state and imperative controls.
 *
 * Throws when used outside of a `<ContextMenu>`.
 */
export function useContextMenu(): ContextMenuContextValue {
  const ctx = use(ContextMenuContext)
  if (!ctx) {
    throw new Error('useContextMenu must be used within a <ContextMenu>')
  }
  return ctx
}
