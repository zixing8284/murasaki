import type { RefObject } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

export type LayerSide = 'top' | 'bottom' | 'left' | 'right'
export type LayerAlign = 'start' | 'center' | 'end'

export interface UseLayerOptions {
  /**
   * Reference to the anchor element. Either this or `anchorRect` is required.
   */
  anchorRef?: RefObject<Element | null>
  /**
   * Virtual anchor: a function that returns a `DOMRect`-like rectangle to
   * position against. Useful for pointer-anchored layers (e.g. context menus)
   * where there is no real anchor element.
   */
  anchorRect?: () => DOMRect | null
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
  /**
   * Optional element whose bounding rect is used as the collision boundary in
   * place of the viewport. When omitted, falls back to `window.innerWidth` /
   * `window.innerHeight`.
   */
  boundaryRef?: RefObject<Element | null> | undefined
}

export interface LayerPosition {
  /** Viewport-relative left coordinate for the layer. */
  x: number
  /** Viewport-relative top coordinate for the layer. */
  y: number
  /** Side actually used after viewport flipping. */
  side: LayerSide
  /**
   * Pixels of usable height available to the layer on the resolved side,
   * after `collisionPadding`. Capped to the available space when the layer
   * exceeds the boundary so consumers can apply `max-height` and engage
   * internal scrolling.
   */
  availableHeight: number
  /** Pixels of usable width available to the layer on the resolved side. */
  availableWidth: number
}

const DEFAULT_GAP = 4
const DEFAULT_ESTIMATED_HEIGHT = 24
const DEFAULT_ESTIMATED_WIDTH = 120
const DEFAULT_COLLISION_PADDING = 4

interface LayerSize {
  height: number
  width: number
}

interface Boundary {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
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

  // Use clientHeight/clientWidth (content + padding, no border) instead of
  // getBoundingClientRect() (content + padding + border). The returned size
  // is used as a CSS maxHeight/maxWidth constraint, which operates on the
  // content box — including border would overstate the available space and
  // create a feedback loop when the layer has a border.
  return {
    height: layer.clientHeight || estimatedHeight,
    width: layer.clientWidth || estimatedWidth,
  }
}

function getBoundary(boundaryRef: RefObject<Element | null> | undefined): Boundary {
  const node = boundaryRef?.current
  if (node) {
    const rect = node.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    }
  }
  const width = window.innerWidth
  const height = window.innerHeight
  return { top: 0, left: 0, right: width, bottom: height, width, height }
}

function resolveSide({
  anchorRect,
  boundary,
  collisionPadding,
  gap,
  side,
  size,
}: {
  anchorRect: DOMRect
  boundary: Boundary
  collisionPadding: number
  gap: number
  side: LayerSide
  size: LayerSize
}): LayerSide {
  if (side === 'top' || side === 'bottom') {
    const topSpace = anchorRect.top - gap - boundary.top - collisionPadding
    const bottomSpace = boundary.bottom - anchorRect.bottom - gap - collisionPadding
    const preferred = side === 'top' ? topSpace : bottomSpace
    if (preferred >= size.height)
      return side
    return topSpace > bottomSpace ? 'top' : 'bottom'
  }
  const leftSpace = anchorRect.left - gap - boundary.left - collisionPadding
  const rightSpace = boundary.right - anchorRect.right - gap - collisionPadding
  const preferred = side === 'left' ? leftSpace : rightSpace
  if (preferred >= size.width)
    return side
  return leftSpace > rightSpace ? 'left' : 'right'
}

function getAlignedPosition({
  align,
  anchorRect,
  boundary,
  collisionPadding,
  gap,
  side,
  size,
}: {
  align: LayerAlign
  anchorRect: DOMRect
  boundary: Boundary
  collisionPadding: number
  gap: number
  side: LayerSide
  size: LayerSize
}): LayerPosition {
  let x: number
  let y: number
  let availableHeight: number
  let availableWidth: number

  if (side === 'top' || side === 'bottom') {
    // Side axis = vertical; cap availableHeight to space on the resolved side.
    if (side === 'top') {
      const space = anchorRect.top - gap - boundary.top - collisionPadding
      availableHeight = Math.max(0, Math.min(size.height, space))
      y = anchorRect.top - gap - availableHeight
    }
    else {
      const space = boundary.bottom - anchorRect.bottom - gap - collisionPadding
      availableHeight = Math.max(0, Math.min(size.height, space))
      y = anchorRect.bottom + gap
    }

    // Cross axis = horizontal; clamp inside boundary.
    if (align === 'start')
      x = anchorRect.left
    else if (align === 'end')
      x = anchorRect.right - size.width
    else
      x = anchorRect.left + anchorRect.width / 2 - size.width / 2

    const minX = boundary.left + collisionPadding
    const maxX = boundary.right - collisionPadding - size.width
    if (maxX < minX) {
      x = minX
      availableWidth = Math.max(0, boundary.width - 2 * collisionPadding)
    }
    else {
      x = clamp(x, minX, maxX)
      availableWidth = size.width
    }
  }
  else {
    if (side === 'left') {
      const space = anchorRect.left - gap - boundary.left - collisionPadding
      availableWidth = Math.max(0, Math.min(size.width, space))
      x = anchorRect.left - gap - availableWidth
    }
    else {
      const space = boundary.right - anchorRect.right - gap - collisionPadding
      availableWidth = Math.max(0, Math.min(size.width, space))
      x = anchorRect.right + gap
    }

    if (align === 'start')
      y = anchorRect.top
    else if (align === 'end')
      y = anchorRect.bottom - size.height
    else
      y = anchorRect.top + anchorRect.height / 2 - size.height / 2

    const minY = boundary.top + collisionPadding
    const maxY = boundary.bottom - collisionPadding - size.height
    if (maxY < minY) {
      y = minY
      availableHeight = Math.max(0, boundary.height - 2 * collisionPadding)
    }
    else {
      y = clamp(y, minY, maxY)
      availableHeight = size.height
    }
  }

  return { x, y, side, availableHeight, availableWidth }
}

/**
 * Anchor-relative positioning for transient layers.
 *
 * Scope:
 * - Sides: top | bottom | left | right
 * - Alignment: start | center | end
 * - Viewport (or `boundaryRef`) flip and collision-aware cross-axis shifts
 * - Reports `availableHeight` / `availableWidth` on the resolved side so
 *   consumers can apply `max-height` and engage internal scrolling
 * - Optional exact layer measurement via `layerRef` and ResizeObserver
 * - Recomputes on `scroll` (capture) and `resize` while open
 */
export function useLayer({
  anchorRef,
  anchorRect: anchorRectFn,
  layerRef,
  open,
  side = 'top',
  align = 'center',
  gap = DEFAULT_GAP,
  collisionPadding = DEFAULT_COLLISION_PADDING,
  estimatedHeight = DEFAULT_ESTIMATED_HEIGHT,
  estimatedWidth = DEFAULT_ESTIMATED_WIDTH,
  boundaryRef,
}: UseLayerOptions): [LayerPosition | null, ready: boolean] {
  const [position, setPosition] = useState<LayerPosition | null>(null)
  const [ready, setReady] = useState(false)
  const computedRef = useRef(false)

  useLayoutEffect(() => {
    if (open)
      return

    const frameId = window.requestAnimationFrame(() => {
      setPosition(null)
      setReady(false)
      computedRef.current = false
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [open])

  useLayoutEffect(() => {
    if (!open)
      return

    if (!anchorRef?.current && !anchorRectFn)
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
      let anchorRect: DOMRect | null = null
      const node = anchorRef?.current
      if (node) {
        anchorRect = node.getBoundingClientRect()
      }
      else if (anchorRectFn) {
        anchorRect = anchorRectFn()
      }
      if (!anchorRect)
        return
      observeLayer()
      const size = getLayerSize(layerRef, estimatedHeight, estimatedWidth)
      const boundary = getBoundary(boundaryRef)
      const resolvedSide = resolveSide({ anchorRect, boundary, collisionPadding, gap, side, size })
      setPosition(getAlignedPosition({
        align,
        anchorRect,
        boundary,
        collisionPadding,
        gap,
        side: resolvedSide,
        size,
      }))
      if (!computedRef.current) {
        computedRef.current = true
        setReady(true)
      }
    }

    // Schedule the first compute outside the effect's synchronous body so
    // React does not receive a layout-effect state update, then refine once
    // more after intrinsic sizing has settled.
    const frameIds: number[] = [
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
  }, [anchorRef, anchorRectFn, layerRef, open, side, align, gap, collisionPadding, estimatedHeight, estimatedWidth, boundaryRef])

  return [open ? position : null, open && ready]
}
