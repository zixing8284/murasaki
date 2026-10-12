import type { RefObject } from 'react'
import type { DesktopLayoutContextValue, GridLayout } from '../../contexts/desktop-layout'
import type { ShellInputPoint, ShellInputSession, ShellInputSurface } from '../input/shell-input-registry'
import { useCallback, useMemo, useRef, useState } from 'react'
import { calcGridDropDelta } from '../../contexts/desktop-layout'
import { getScreenFromLocalMatrix, scaleMagnitude } from '../input/geometry'
import { useShellInputSurface } from '../input/shell-input-registry'

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
  onOpen: () => void
}

export interface UseDesktopIconDragReturn {
  /**
   * Set to `true` by the drag handler when a real drop occurred so the next
   * click can be ignored. The consumer is expected to flip it back to false
   * inside its onClick handler.
   */
  suppressClickRef: RefObject<boolean>
  setIconRef: (el: HTMLDivElement | null) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
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
  onOpen,
}: UseDesktopIconDragOptions): UseDesktopIconDragReturn {
  const suppressClickRef = useRef(false)
  const iconRef = useRef<HTMLDivElement | null>(null)
  const lastTapRef = useRef(0)
  const [iconElement, setIconElement] = useState<HTMLDivElement | null>(null)

  const setIconRef = (el: HTMLDivElement | null): void => {
    iconRef.current = el
    setIconElement(el)
  }

  const beginDrag = useCallback((point: ShellInputPoint): ShellInputSession | null => {
    const iconEl = iconRef.current
    // The desktop layout assigns every icon an explicit grid cell, so a missing
    // col/row means this icon isn't placed yet and can't be dragged.
    if (!iconEl || col === undefined || row === undefined)
      return null

    // The desktop is uniformly scaled by a `transform: scale()` ancestor, so
    // client-space pointer deltas must be divided by the scale to land in the
    // desktop's own logical pixels (grid cells, drag-preview translate).
    const scale = scaleMagnitude(getScreenFromLocalMatrix(iconEl))

    const isSelected = selectedIds.includes(id)
    const items = buildDragItems(id, col, row, positions, selectedIds)
    onSelect(id, point.ctrlKey || point.metaKey, isSelected && selectedIds.length > 1)

    const drag: DragState = {
      startClientX: point.clientX,
      startClientY: point.clientY,
      moved: false,
      iconEl,
      items,
    }

    function commitDrop(clientX: number, clientY: number): void {
      if (!drag.moved)
        return
      suppressClickRef.current = true
      const grid = gridRef.current
      if (!grid)
        return

      const gridRect = grid.getBoundingClientRect()
      if (clientX < gridRect.left || clientX > gridRect.right || clientY < gridRect.top || clientY > gridRect.bottom)
        return

      const delta = calcGridDropDelta(grid, (clientX - drag.startClientX) / scale, (clientY - drag.startClientY) / scale)
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
      const moved: GridLayout = {}

      for (const item of drag.items) {
        const target = { col: item.col + dCol, row: item.row + dRow }
        const targetKey = `${target.col}:${target.row}`
        if (targetCells.has(targetKey) || isCellOccupied(target.col, target.row, movingIds))
          return
        targetCells.add(targetKey)
        moved[item.id] = target
      }

      // `positions` is the full resolved layout (every icon has a cell), so
      // persisting it together with the moves pins the untouched icons in place.
      // Vacated cells stay empty instead of triggering a reflow — the dragged
      // icon moves and nothing else shifts, matching the classic desktop.
      setPositions({ ...positions, ...moved })
    }

    const finish = (): void => {
      onDragPreviewChange(null)
    }

    return {
      captureIframes: true,
      onMove(nextPoint) {
        const dx = (nextPoint.clientX - drag.startClientX) / scale
        const dy = (nextPoint.clientY - drag.startClientY) / scale

        if (!drag.moved) {
          if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD)
            return
          drag.moved = true
        }

        onDragPreviewChange({
          ids: drag.items.map(item => item.id),
          offset: { dx, dy },
        })
      },
      onEnd(endPoint) {
        if (drag.moved) {
          commitDrop(endPoint.clientX, endPoint.clientY)
        }
        else {
          const now = Date.now()
          if (now - lastTapRef.current <= 400) {
            lastTapRef.current = 0
            onOpen()
          }
          else {
            lastTapRef.current = now
          }
        }
        finish()
      },
      onCancel: finish,
    }
  }, [col, gridRef, id, isCellOccupied, onDragPreviewChange, onOpen, onSelect, positions, row, selectedIds, setPositions])

  const surface = useMemo<ShellInputSurface | null>(() => {
    if (!iconElement)
      return null
    return {
      id: `desktop-icon:${id}`,
      element: iconElement,
      priority: 1000,
      onStart: beginDrag,
    }
  }, [beginDrag, iconElement, id])

  useShellInputSurface(surface)

  return { suppressClickRef, setIconRef }
}
