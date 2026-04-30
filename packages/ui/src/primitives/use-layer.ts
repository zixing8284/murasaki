import type { RefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export type LayerSide = 'top' | 'bottom'
export type LayerAlign = 'start' | 'center' | 'end'

export interface UseLayerOptions {
  anchorRef: RefObject<Element | null>
  /** Whether the layer is currently visible. Position is only computed while open. */
  open: boolean
  /** Preferred side; flips to the opposite side if the viewport cannot fit it. */
  side?: LayerSide
  /** Horizontal alignment relative to the anchor. */
  align?: LayerAlign
  /** Pixel gap between anchor and layer. */
  gap?: number
  /**
   * Estimated layer height used for viewport flip when the layer has not been
   * measured yet. Underestimating only causes a one-frame visual jump.
   */
  estimatedHeight?: number
}

export interface LayerPosition {
  /** Viewport-relative x for the layer's alignment anchor (use with `position: fixed`). */
  x: number
  /** Viewport-relative y for the layer's side anchor. */
  y: number
  /** Side actually used after viewport flipping. */
  side: LayerSide
}

const DEFAULT_GAP = 4
const DEFAULT_ESTIMATED_HEIGHT = 24

/**
 * Anchor-relative positioning for transient layers.
 *
 * Wave A scope:
 * - Sides: top | bottom
 * - Alignment: start | center | end
 * - Viewport flip on the cross axis only
 * - Recomputes on `scroll` (capture) and `resize` while open
 *
 * Left/right sides and collision-aware alignment shifts are deferred until
 * needed by submenu migrations (wave B).
 */
export function useLayer({
  anchorRef,
  open,
  side = 'top',
  align = 'center',
  gap = DEFAULT_GAP,
  estimatedHeight = DEFAULT_ESTIMATED_HEIGHT,
}: UseLayerOptions): LayerPosition | null {
  const [position, setPosition] = useState<LayerPosition | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }

    const anchor = anchorRef.current
    if (!anchor)
      return

    function compute(): void {
      const node = anchorRef.current
      if (!node)
        return
      const rect = node.getBoundingClientRect()

      let resolvedSide: LayerSide = side
      if (side === 'top' && rect.top - gap - estimatedHeight < 0)
        resolvedSide = 'bottom'
      else if (side === 'bottom' && rect.bottom + gap + estimatedHeight > window.innerHeight)
        resolvedSide = 'top'

      const y = resolvedSide === 'top' ? rect.top - gap : rect.bottom + gap

      let x: number
      if (align === 'start')
        x = rect.left
      else if (align === 'end')
        x = rect.right
      else
        x = rect.left + rect.width / 2

      setPosition({ x, y, side: resolvedSide })
    }

    compute()

    window.addEventListener('scroll', compute, true)
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute, true)
      window.removeEventListener('resize', compute)
    }
  }, [anchorRef, open, side, align, gap, estimatedHeight])

  return position
}
