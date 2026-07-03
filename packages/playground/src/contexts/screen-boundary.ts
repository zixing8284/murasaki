import type { RefObject } from 'react'
import { createContext, use } from 'react'

/**
 * Provides the Win98 screen element ref to deeply nested components.
 * Used as the `boundaryRef` for floating UI (e.g. WindowMenuBarContent)
 * so position calculations are constrained to the screen area rather than
 * the full viewport.
 */
export const ScreenBoundaryContext = createContext<RefObject<Element | null> | null>(null)

export function useScreenBoundary(): RefObject<Element | null> | null {
  return use(ScreenBoundaryContext)
}
