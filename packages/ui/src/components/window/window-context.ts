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
  /** Container element for drag constraints (null = viewport) */
  container: HTMLElement | null
  /** Whether the window is using fixed or absolute positioning */
  positioning: 'absolute' | 'fixed'
  /** Whether dragging is enabled */
  draggable: boolean
}

export interface WindowRefs {
  /** Ref callback for the window frame element (drag target) */
  setFrameRef: (el: HTMLDivElement | null) => void
  /** Ref callback for the title bar element (drag handle) */
  setTitleBarRef: (el: HTMLDivElement | null) => void
}

export interface WindowContextValue {
  state: WindowState
  actions: WindowActions
  meta: WindowMeta
}

export const WindowContext = createContext<WindowContextValue | null>(null)
export const WindowRefsContext = createContext<WindowRefs | null>(null)

export function useWindowContext(): WindowContextValue {
  const context = use(WindowContext)
  if (!context) {
    throw new Error('Window compound components must be used within Window.Provider')
  }
  return context
}

export function useWindowRefs(): WindowRefs {
  const refs = use(WindowRefsContext)
  if (!refs) {
    throw new Error('Window compound components must be used within Window.Provider')
  }
  return refs
}
