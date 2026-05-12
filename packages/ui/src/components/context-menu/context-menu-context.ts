import { createContext, use } from 'react'

// ─── Context ──────────────────────────────────────────────────────────────────

export interface ContextMenuContextValue {
  open: boolean
  x: number
  y: number
  /** Element to constrain the popup within (null = viewport). */
  container: HTMLElement | null
  /**
   * Usable height for the popup on the resolved side, after collision
   * padding. Populated by `<ContextMenuContent>` once the layer has
   * computed its position. Consumers can pass this to a child
   * `<Menu maxHeight={…}>` to engage the scroll-arrow steppers.
   */
  availableHeight: number | null
  /** Usable width for the popup on the resolved side. */
  availableWidth: number | null
  openAt: (x: number, y: number) => void
  close: () => void
  /** Internal: invoked by `<ContextMenuContent>` to publish layer metrics. */
  setAvailableSize: (height: number | null, width: number | null) => void
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
