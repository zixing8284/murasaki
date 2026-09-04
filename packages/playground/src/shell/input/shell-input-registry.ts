import { createContext, use, useEffect } from 'react'

export type ShellInputSource = 'mouse' | 'touch'

export interface ShellInputPoint {
  clientX: number
  clientY: number
  source: ShellInputSource
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export interface ShellInputSession {
  captureIframes?: boolean
  onMove?: (point: ShellInputPoint) => void
  onEnd?: (point: ShellInputPoint) => void
  onCancel?: () => void
}

export interface ShellInputSurface {
  id: string
  element: HTMLElement | null
  priority: number
  zIndex?: () => number
  enabled?: () => boolean
  contains?: (point: ShellInputPoint) => boolean
  onStart: (point: ShellInputPoint) => ShellInputSession | null
}

export interface ShellInputContextValue {
  registerSurface: (surface: ShellInputSurface) => () => void
}

export const ShellInputContext = createContext<ShellInputContextValue | null>(null)

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"], [role="menuitem"]'

export function closestInteractive(target: EventTarget | Element | null): Element | null {
  return target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null
}

export function isRawPointOnInteractive(point: ShellInputPoint): boolean {
  return closestInteractive(document.elementFromPoint(point.clientX, point.clientY)) !== null
}

export function useShellInputSurface(surface: ShellInputSurface | null): void {
  const context = use(ShellInputContext)

  useEffect(() => {
    if (!surface || !context)
      return
    return context.registerSurface(surface)
  }, [context, surface])
}
