import type { ScrollMetrics } from './use-scroll-state'

import { createContext, use } from 'react'

export interface ScrollAreaContextValue {
  /** Ref to the native scrollable viewport element */
  viewportRef: React.RefObject<HTMLDivElement | null>
  /** Current scroll layout metrics */
  metrics: ScrollMetrics
  /** Ref for the vertical track element */
  vTrackRef: React.RefObject<HTMLDivElement | null>
  /** Ref for the horizontal track element */
  hTrackRef: React.RefObject<HTMLDivElement | null>
  /** Scroll the viewport by arrow step */
  scrollStep: (axis: 'v' | 'h', direction: -1 | 1) => void
  /** Scroll the viewport by page */
  scrollPage: (axis: 'v' | 'h', direction: -1 | 1) => void
  /** Begin thumb drag */
  startDrag: (axis: 'v' | 'h', startPos: number, pointerId: number) => void
  /** Auto-repeat helper for arrow buttons */
  startRepeat: (action: () => void) => () => void
  /** Bar thickness (width for vertical, used for layout) */
  BAR_SIZE: number
  /** Button height (17px, matching SVG) */
  BTN_HEIGHT: number
}

export const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null)

export function useScrollAreaContext(): ScrollAreaContextValue {
  const context = use(ScrollAreaContext)
  if (!context) {
    throw new Error('ScrollArea compound components must be used within ScrollArea')
  }
  return context
}
