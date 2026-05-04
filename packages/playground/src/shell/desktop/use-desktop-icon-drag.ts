import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { DesktopLayoutContextValue } from '../../contexts/desktop-layout'
import { useEffect, useRef, useState } from 'react'
import { calcGridDropTarget } from '../../contexts/desktop-layout'

const DRAG_THRESHOLD = 3

export type DesktopCellOccupancyChecker = (col: number, row: number, excludeId?: string) => boolean

interface DragState {
  pointerId: number
  startClientX: number
  startClientY: number
  moved: boolean
  iconEl: HTMLDivElement
  col: number
  row: number
}

export interface UseDesktopIconDragOptions {
  id: string
  col: number
  row: number
  gridRef: RefObject<HTMLElement | null>
  setPosition: DesktopLayoutContextValue['setPosition']
  isCellOccupied: DesktopCellOccupancyChecker
  onSelect: (id: string) => void
}

export interface UseDesktopIconDragReturn {
  dragOffset: { dx: number, dy: number } | null
  /**
   * Set to `true` by the drag handler when a real drop occurred so the next
   * click can be ignored. The consumer is expected to flip it back to false
   * inside its onClick handler.
   */
  suppressClickRef: RefObject<boolean>
  handlePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
}

/**
 * Drives desktop-icon drag interactions: pointer threshold, live offset,
 * grid drop computation, and full event-listener teardown on every exit
 * path (pointerup, pointercancel, blur, visibility hidden, unmount).
 *
 * Centralising this logic keeps the component focused on rendering and
 * makes it easier to reason about cleanup on edge cases.
 */
export function useDesktopIconDrag({
  id,
  col,
  row,
  gridRef,
  setPosition,
  isCellOccupied,
  onSelect,
}: UseDesktopIconDragOptions): UseDesktopIconDragReturn {
  const [dragOffset, setDragOffset] = useState<{ dx: number, dy: number } | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const suppressClickRef = useRef(false)

  // Abort any in-flight drag when the icon unmounts (e.g. removed mid-drag).
  // Listeners live on `window`, so without this they would leak.
  useEffect(() => () => cleanupRef.current?.(), [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0)
      return
    event.stopPropagation()
    onSelect(id)

    // Defensive reset: clear any stale state from a previous drag that was
    // never completed (e.g. pointerup swallowed by an overlay or iframe).
    cleanupRef.current?.()

    const iconEl = event.currentTarget
    const drag: DragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
      iconEl,
      col,
      row,
    }
    dragRef.current = drag

    const onPointerMove = (e: PointerEvent): void => {
      if (e.pointerId !== drag.pointerId)
        return
      const dx = e.clientX - drag.startClientX
      const dy = e.clientY - drag.startClientY

      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD)
          return
        drag.moved = true
      }

      setDragOffset({ dx, dy })
    }

    function cleanup(): void {
      // Only the most-recent cleanup may run. Stale closures (e.g. from a
      // re-entrant pointerdown) become no-ops here.
      if (cleanupRef.current !== cleanup)
        return
      cleanupRef.current = null
      dragRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('blur', onAbort)
      document.removeEventListener('visibilitychange', onVisibility)
      setDragOffset(null)
    }

    function commitDrop(clientX: number, clientY: number): void {
      if (!drag.moved)
        return
      suppressClickRef.current = true

      const previousPointerEvents = drag.iconEl.style.pointerEvents
      drag.iconEl.style.pointerEvents = 'none'
      const hitTarget = drag.iconEl.ownerDocument.elementFromPoint(clientX, clientY)
      drag.iconEl.style.pointerEvents = previousPointerEvents

      const grid = gridRef.current
      if (!grid || !hitTarget || !grid.contains(hitTarget))
        return

      const target = calcGridDropTarget(
        grid,
        { col: drag.col, row: drag.row },
        clientX - drag.startClientX,
        clientY - drag.startClientY,
      )
      if (
        target
        && (target.col !== drag.col || target.row !== drag.row)
        && !isCellOccupied(target.col, target.row, id)
      ) {
        setPosition(id, target)
      }
    }

    function onPointerUp(e: PointerEvent): void {
      if (e.pointerId !== drag.pointerId)
        return
      commitDrop(e.clientX, e.clientY)
      cleanup()
    }

    function onPointerCancel(e: PointerEvent): void {
      if (e.pointerId !== drag.pointerId)
        return
      cleanup()
    }

    function onAbort(): void {
      cleanup()
    }

    function onVisibility(): void {
      if (document.visibilityState === 'hidden')
        cleanup()
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('blur', onAbort)
    document.addEventListener('visibilitychange', onVisibility)

    cleanupRef.current = cleanup
  }

  return { dragOffset, suppressClickRef, handlePointerDown }
}
