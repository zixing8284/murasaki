import type { RefObject } from 'react'
import { useRef, useState } from 'react'
import { CELL_HEIGHT, DESKTOP_PADDING, ROW_GAP } from '../../contexts/desktop-layout/context'

export interface UseDesktopGridRowsReturn {
  /** Ref to the desktop grid element, used for pointer-geometry math. */
  desktopRef: RefObject<HTMLDivElement | null>
  /** The desktop grid element once mounted, used as an input surface. */
  desktopEl: HTMLDivElement | null
  /** Number of icon rows that currently fit, kept in sync via ResizeObserver. */
  gridRows: number
  /** Ref callback for the grid element; wires up the layout ref + observer. */
  setGridEl: (el: HTMLDivElement | null) => (() => void) | void
}

/**
 * Owns the desktop grid element wiring: it publishes the element to the layout
 * context (`gridRef`), exposes it for input-surface registration (`desktopEl`),
 * and keeps `gridRows` in sync with the available height via a `ResizeObserver`.
 *
 * `gridRows` drives deterministic column-first auto-placement, so it must match
 * the number of rows CSS `auto-fill` actually renders at the current size.
 */
export function useDesktopGridRows(gridRef: RefObject<HTMLElement | null>): UseDesktopGridRowsReturn {
  const [gridRows, setGridRows] = useState(10)
  const desktopRef = useRef<HTMLDivElement>(null)
  const [desktopEl, setDesktopEl] = useState<HTMLDivElement | null>(null)

  const setGridEl = (el: HTMLDivElement | null): (() => void) | void => {
    if (!el)
      return
    desktopRef.current = el
    setDesktopEl(el)
    gridRef.current = el

    const computeRows = (): void => {
      const availableHeight = el.clientHeight - DESKTOP_PADDING * 2
      setGridRows(Math.max(1, Math.floor((availableHeight + ROW_GAP) / (CELL_HEIGHT + ROW_GAP))))
    }
    computeRows()
    const observer = new ResizeObserver(computeRows)
    observer.observe(el)

    return () => {
      observer.disconnect()
      gridRef.current = null
    }
  }

  return { desktopRef, desktopEl, gridRows, setGridEl }
}
