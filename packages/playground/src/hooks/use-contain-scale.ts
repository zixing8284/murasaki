import type { RefObject } from 'react'
import { useLayoutEffect, useState } from 'react'

export interface ContainFit {
  /** Uniform scale that fits the fixed content inside the container. */
  scale: number
  /** Whole-pixel left offset that centres the scaled content in the container. */
  offsetX: number
  /** Whole-pixel top offset that centres the scaled content in the container. */
  offsetY: number
}

const IDENTITY_FIT: ContainFit = { scale: 1, offsetX: 0, offsetY: 0 }

/**
 * Largest uniform scale (plus centring offsets) that fits a fixed
 * `contentWidth × contentHeight` logical surface inside the observed container
 * (contain fit, like elternal.world's virtual OS canvas).
 *
 * The caller applies the result as `translate(offsetX, offsetY) scale(scale)`
 * with `transform-origin: 0 0`. Returning the offset alongside the scale is
 * deliberate — the two must update in the SAME commit. If the surface were
 * flex-centred instead (position reacts to the viewport synchronously) while
 * the scale arrived a frame later via this observer, the letterboxed desktop
 * would visibly lurch on every resize/browser-zoom step.
 *
 * The container element must have no padding/border of its own so its measured
 * box equals the available area.
 */
export function useContainScale(
  containerRef: RefObject<HTMLElement | null>,
  contentWidth: number,
  contentHeight: number,
): ContainFit {
  const [fit, setFit] = useState<ContainFit>(IDENTITY_FIT)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el)
      return

    const apply = (width: number, height: number): void => {
      if (width <= 0 || height <= 0)
        return
      const scale = Math.min(width / contentWidth, height / contentHeight)
      const offsetX = Math.round((width - contentWidth * scale) / 2)
      const offsetY = Math.round((height - contentHeight * scale) / 2)
      setFit(prev =>
        Math.abs(prev.scale - scale) < 0.0005 && prev.offsetX === offsetX && prev.offsetY === offsetY
          ? prev
          : { scale, offsetX, offsetY },
      )
    }

    const measure = (): void => apply(el.clientWidth, el.clientHeight)
    measure()

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (box)
        apply(box.width, box.height)
    })
    observer.observe(el)

    // `resize` fires before paint, shrinking the window→scale lag the
    // ResizeObserver alone leaves (the observer can trail by a frame).
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [containerRef, contentWidth, contentHeight])

  return fit
}
