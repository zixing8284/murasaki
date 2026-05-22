import type * as React from 'react'
import { createContext, use } from 'react'

export interface MenuSubContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLLIElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  /** Scheduled hover-close timer; cancelled when pointer re-enters trigger or content. */
  scheduleClose: () => void
  cancelClose: () => void
  scheduleOpen: () => void
  cancelOpen: () => void
}

export const MenuSubContext = createContext<MenuSubContextValue | null>(null)

export function useMenuSubContext(component: string): MenuSubContextValue {
  const ctx = use(MenuSubContext)
  if (!ctx)
    throw new Error(`${component} must be used within a <MenuSub>`)
  return ctx
}
