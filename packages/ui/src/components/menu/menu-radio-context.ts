import { createContext, use } from 'react'

/**
 * Selection state shared by a `MenuRadioGroup` with its `MenuRadioItem`s.
 *
 * @internal
 */
export interface MenuRadioGroupContextValue {
  /** The value of the currently selected radio item. */
  value: string | undefined
  /** Select a radio item by value. */
  onValueChange: (value: string) => void
}

export const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null)

/** Access the enclosing {@link MenuRadioGroupContextValue}, or `null` when ungrouped. */
export function useMenuRadioGroupContext(): MenuRadioGroupContextValue | null {
  return use(MenuRadioGroupContext)
}
