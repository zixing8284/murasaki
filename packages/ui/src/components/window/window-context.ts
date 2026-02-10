import { createContext, use } from 'react'

export interface WindowState {
  active: boolean
  maximized: boolean
}

export interface WindowActions {
  setMaximized: (maximized: boolean) => void
  toggleMaximized: () => void
}

export interface WindowMeta {
  /** Whether the window is using fixed or absolute positioning */
  positioning: 'absolute' | 'fixed'
}

export interface WindowContextValue {
  state: WindowState
  actions: WindowActions
  meta: WindowMeta
}

export const WindowContext = createContext<WindowContextValue | null>(null)

export function useWindowContext(): WindowContextValue {
  const context = use(WindowContext)
  if (!context) {
    throw new Error('Window compound components must be used within Window.Provider')
  }
  return context
}
