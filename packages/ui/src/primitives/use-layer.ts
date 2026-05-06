import type { RefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export type LayerSide = 'top' | 'bottom' | 'left' | 'right'
export type LayerAlign = 'start' | 'center' | 'end'

export interface UseLayerOptions {
  anchorRef: RefObject<Element | null>
  /** Optional layer element used for exact collision detection and ResizeObserver updates. */
  layerRef?: RefObject<Element | null>
  /** Whether the layer is currently visible. Position is only computed while open. */
  open: boolean
  /** Preferred side; flips to the opposite side if the viewport cannot fit it. */
  side?: LayerSide
  /** Alignment along the side's cross axis relative to the anchor. */
  align?: LayerAlign
  /** Pixel gap between anchor and layer. */
  gap?: number
  /** Minimum viewport margin maintained by collision-aware shifts. */
  collisionPadding?: number
  /**
   * Estimated layer height used for viewport flip when the layer has not been
   * measured yet. Underestimating only causes a one-frame visual jump.
   */
  estimatedHeight?: number
  /** Estimated layer width used for viewport flip before measurement. */
  estimatedWidth?: number
}

export interface LayerPosition {
  /** Viewport-relative left coordinate for the layer. */
  x: number
  /** Viewport-relative top coordinate for the layer. */
  y: number
  /** Side actually used after viewport flipping. */
  side: LayerSide
}

const DEFAULT_GAP = 4
const DEFAULT_ESTIMATED_HEIGHT = 24
const DEFAULT_ESTIMATED_WIDTH = 120
const DEFAULT_COLLISION_PADDING = 4

interface LayerSize {
  height: number
  width: number
}

function clamp(value: number, min: number, max: number): number {
  if (max < min)
    return min
  return Math.max(min, Math.min(value, max))
}

function getLayerSize(
  layerRef: RefObject<Element | null> | undefined,
  estimatedHeight: number,
  estimatedWidth: number,
): LayerSize {
  const layer = layerRef?.current
  if (!layer) {
    return { height: estimatedHeight, width: estimatedWidth }
  }

  const rect = layer.getBoundingClientRect()
  return {
    height: rect.height || estimatedHeight,
    width: rect.width || estimatedWidth,
  }
}

function resolveSide({
  anchorRect,
  collisionPadding,
  gap,
  side,
  size,
}: {
  anchorRect: DOMRect
  collisionPadding: number
  gap: number
  side: LayerSide
  size: LayerSize
}): LayerSide {
  if (side === 'top') {
    return anchorRect.top - gap - size.height < collisionPadding ? 'bottom' : 'top'
  }
  if (side === 'bottom') {
    return anchorRect.bottom + gap + size.height > window.innerHeight - collisionPadding ? 'top' : 'bottom'
  }
  if (side === 'left') {
    return anchorRect.left - gap - size.width < collisionPadding ? 'right' : 'left'
  }
  return anchorRect.right + gap + size.width > window.innerWidth - collisionPadding ? 'left' : 'right'
}

function getAlignedPosition({
  align,
  anchorRect,
  collisionPadding,
  gap,
  side,
  size,
}: {
  align: LayerAlign
  anchorRect: DOMRect
  collisionPadding: number
  gap: number
  side: LayerSide
  size: LayerSize
}): LayerPosition {
  let x: number
  let y: number

  if (side === 'top' || side === 'bottom') {
    y = side === 'top' ? anchorRect.top - gap - size.height : anchorRect.bottom + gap
    if (align === 'start')
      x = anchorRect.left
    else if (align === 'end')
      x = anchorRect.right - size.width
    else
      x = anchorRect.left + anchorRect.width / 2 - size.width / 2
    x = clamp(x, collisionPadding, window.innerWidth - collisionPadding - size.width)
  }
  else {
    x = side === 'left' ? anchorRect.left - gap - size.width : anchorRect.right + gap
    if (align === 'start')
      y = anchorRect.top
    else if (align === 'end')
      y = anchorRect.bottom - size.height
    else
      y = anchorRect.top + anchorRect.height / 2 - size.height / 2
    y = clamp(y, collisionPadding, window.innerHeight - collisionPadding - size.height)
  }

  return { x, y, side }
}

/**
 * Anchor-relative positioning for transient layers.
 *
 * Scope:
 * - Sides: top | bottom | left | right
 * - Alignment: start | center | end
 * - Viewport flip and collision-aware cross-axis shifts
 * - Optional exact layer measurement via `layerRef` and ResizeObserver
 * - Recomputes on `scroll` (capture) and `resize` while open
 */
export function useLayer({
  anchorRef,
  layerRef,
  open,
  side = 'top',
  align = 'center',
  gap = DEFAULT_GAP,
  collisionPadding = DEFAULT_COLLISION_PADDING,
  estimatedHeight = DEFAULT_ESTIMATED_HEIGHT,
  estimatedWidth = DEFAULT_ESTIMATED_WIDTH,
}: UseLayerOptions): LayerPosition | null {
  const [position, setPosition] = useState<LayerPosition | null>(null)

  useLayoutEffect(() => {
    if (!open)
      return

    const anchor = anchorRef.current
    if (!anchor)
      return

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(compute)
      : null
    let observedLayer: Element | null = null

    function observeLayer(): void {
      const layer = layerRef?.current ?? null
      if (!resizeObserver || !layer || layer === observedLayer)
        return

      if (observedLayer)
        resizeObserver.unobserve(observedLayer)
      resizeObserver.observe(layer)
      observedLayer = layer
    }

    function compute(): void {
      const node = anchorRef.current
      if (!node)
        return
      observeLayer()
      const anchorRect = node.getBoundingClientRect()
      const size = getLayerSize(layerRef, estimatedHeight, estimatedWidth)
      const resolvedSide = resolveSide({ anchorRect, collisionPadding, gap, side, size })
      setPosition(getAlignedPosition({
        align,
        anchorRect,
        collisionPadding,
        gap,
        side: resolvedSide,
        size,
      }))
    }

    const frameIds = [
      window.requestAnimationFrame(() => {
        compute()
        frameIds.push(window.requestAnimationFrame(compute))
      }),
    ]

    window.addEventListener('scroll', compute, true)
    window.addEventListener('resize', compute)
    return () => {
      frameIds.forEach(frameId => window.cancelAnimationFrame(frameId))
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', compute, true)
      window.removeEventListener('resize', compute)
    }
  }, [anchorRef, layerRef, open, side, align, gap, collisionPadding, estimatedHeight, estimatedWidth])

  return open ? position : null
}
