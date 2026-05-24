import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { DesktopLayoutContextValue, GridLayout } from '../../contexts/desktop-layout'
import { useEffect, useRef } from 'react'
import { calcGridDropDelta } from '../../contexts/desktop-layout'

const DRAG_THRESHOLD = 3

export type DesktopCellOccupancyChecker = (
  col: number,
  row: number,
  excludeIds?: string | readonly string[],
) => boolean

export interface DesktopDragPreview {
  ids: readonly string[]
  offset: { dx: number, dy: number }
}

interface DragItem {
  id: string
  col: number
  row: number
}

interface DragState {
  pointerId: number
  startClientX: number
  startClientY: number
  moved: boolean
  iconEl: HTMLDivElement
  items: DragItem[]
}

export interface UseDesktopIconDragOptions {
  id: string
  col: number | undefined
  row: number | undefined
  positions: GridLayout
  selectedIds: readonly string[]
  gridRef: RefObject<HTMLElement | null>
  setPositions: DesktopLayoutContextValue['setPositions']
  isCellOccupied: DesktopCellOccupancyChecker
  onSelect: (id: string, additive: boolean, preserveSelectedGroup: boolean) => void
  onDragPreviewChange: (preview: DesktopDragPreview | null) => void
}

export interface UseDesktopIconDragReturn {
  /**
   * Set to `true` by the drag handler when a real drop occurred so the next
   * click can be ignored. The consumer is expected to flip it back to false
   * inside its onClick handler.
   */
  suppressClickRef: RefObject<boolean>
  handlePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

function readGridPos(el: HTMLElement): { col: number, row: number } | null {
  const cs = window.getComputedStyle(el)
  const col = Number.parseInt(cs.gridColumnStart, 10)
  const row = Number.parseInt(cs.gridRowStart, 10)
  if (!Number.isFinite(col) || !Number.isFinite(row))
    return null
  return { col, row }
}

function buildDragItems(
  id: string,
  col: number,
  row: number,
  positions: GridLayout,
  selectedIds: readonly string[],
): DragItem[] {
  const dragIds = selectedIds.includes(id) ? selectedIds : [id]
  const seen = new Set<string>()
  const items: DragItem[] = []

  for (const dragId of dragIds) {
    if (seen.has(dragId))
      continue

    const position = dragId === id ? { col, row } : positions[dragId]
    if (!position)
      continue

    seen.add(dragId)
    items.push({ id: dragId, col: position.col, row: position.row })
  }

  if (!seen.has(id))
    items.unshift({ id, col, row })

  return items
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
  positions,
  selectedIds,
  gridRef,
  setPositions,
  isCellOccupied,
  onSelect,
  onDragPreviewChange,
}: UseDesktopIconDragOptions): UseDesktopIconDragReturn {
  const dragRef = useRef<DragState | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const suppressClickRef = useRef(false)

  // Abort any in-flight drag when the icon unmounts (e.g. removed mid-drag).
  // Listeners live on `window`, so without this they would leak.
  useEffect(() => () => cleanupRef.current?.(), [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0)
      return
    event.preventDefault()
    event.stopPropagation()

    // Resolve grid position for this icon. Auto-placed icons (no stored position)
    // have no explicit col/row, so read the computed position from the DOM.
    let resolvedCol = col
    let resolvedRow = row
    if (resolvedCol === undefined || resolvedRow === undefined) {
      const pos = readGridPos(event.currentTarget)
      if (!pos)
        return
      resolvedCol = pos.col
      resolvedRow = pos.row
    }

    // For multi-drag: auto-placed selected icons also need resolved positions.
    let resolvedPositions = positions
    const grid = gridRef.current
    if (grid && selectedIds.length > 1) {
      const unresolved = selectedIds.filter(sid => sid !== id && !positions[sid])
      if (unresolved.length > 0) {
        const extra: GridLayout = {}
        grid.querySelectorAll<HTMLElement>('[data-file-id]').forEach((el) => {
          const iconId = el.dataset.fileId
          if (!iconId || !unresolved.includes(iconId))
            return
          const pos = readGridPos(el)
          if (pos)
            extra[iconId] = pos
        })
        if (Object.keys(extra).length > 0)
          resolvedPositions = { ...positions, ...extra }
      }
    }

    const isSelected = selectedIds.includes(id)
    const items = buildDragItems(id, resolvedCol, resolvedRow, resolvedPositions, selectedIds)
    onSelect(id, event.ctrlKey || event.metaKey, isSelected && selectedIds.length > 1)

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
      items,
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

      onDragPreviewChange({
        ids: drag.items.map(item => item.id),
        offset: { dx, dy },
      })
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
      onDragPreviewChange(null)
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

      const delta = calcGridDropDelta(grid, clientX - drag.startClientX, clientY - drag.startClientY)
      if (!delta)
        return

      const minCol = Math.min(...drag.items.map(item => item.col))
      const maxCol = Math.max(...drag.items.map(item => item.col))
      const minRow = Math.min(...drag.items.map(item => item.row))
      const maxRow = Math.max(...drag.items.map(item => item.row))
      const dCol = clamp(delta.dCol, 1 - minCol, delta.cols - maxCol)
      const dRow = clamp(delta.dRow, 1 - minRow, delta.rows - maxRow)

      if (dCol === 0 && dRow === 0)
        return

      const movingIds = drag.items.map(item => item.id)
      const targetCells = new Set<string>()
      const nextPositions: GridLayout = {}

      for (const item of drag.items) {
        const target = { col: item.col + dCol, row: item.row + dRow }
        const targetKey = `${target.col}:${target.row}`
        if (targetCells.has(targetKey) || isCellOccupied(target.col, target.row, movingIds))
          return
        targetCells.add(targetKey)
        nextPositions[item.id] = target
      }

      setPositions(nextPositions)
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

  return { suppressClickRef, handlePointerDown }
}
