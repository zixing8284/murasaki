import type * as React from 'react'
import { createContext, use } from 'react'

export type WindowMenuBarValue = string | null
export type WindowMenuBarDirection = 'next' | 'previous'

export interface WindowMenuBarContextValue {
  value: WindowMenuBarValue
  setValue: (value: WindowMenuBarValue) => void
  focusMenu: (currentValue: string, direction: WindowMenuBarDirection, openNext: boolean) => void
}

export const WindowMenuBarContext = createContext<WindowMenuBarContextValue | null>(null)

export function useWindowMenuBarContext(component: string): WindowMenuBarContextValue {
  const context = use(WindowMenuBarContext)
  if (!context)
    throw new Error(`${component} must be used within a <WindowMenuBar>`)
  return context
}

export interface WindowMenuBarMenuContextValue {
  value: string
  open: boolean
  triggerId: string
  contentId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLElement | null>
}

export const WindowMenuBarMenuContext = createContext<WindowMenuBarMenuContextValue | null>(null)

export function useWindowMenuBarMenuContext(component: string): WindowMenuBarMenuContextValue {
  const context = use(WindowMenuBarMenuContext)
  if (!context)
    throw new Error(`${component} must be used within a <WindowMenuBarMenu>`)
  return context
}
