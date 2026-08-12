import type { RefObject } from 'react'
import type { DesktopLayoutContextValue, GridLayout } from '../../contexts/desktop-layout'
import type { ShellInputPoint, ShellInputSession, ShellInputSurface } from '../input/shell-input-registry'
import { useCallback, useMemo, useRef, useState } from 'react'
import { calcGridDropDelta } from '../../contexts/desktop-layout'
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

function readGridPosFromDOM(el: HTMLElement, gridEl: HTMLElement): { col: number, row: number } | null {
  const cs = window.getComputedStyle(gridEl)
  const cellW = Number.parseFloat(cs.getPropertyValue('grid-template-columns').split(' ')[0] ?? '')
  const cellH = Number.parseFloat(cs.getPropertyValue('grid-template-rows').split(' ')[0] ?? '')
  if (!(cellW > 0) || !(cellH > 0))
    return null
  const colGap = Number.parseFloat(cs.columnGap) || 0
  const rowGap = Number.parseFloat(cs.rowGap) || 0
  const paddingLeft = Number.parseFloat(cs.paddingLeft) || 0
  const paddingTop = Number.parseFloat(cs.paddingTop) || 0

  const gridRect = gridEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const relX = elRect.left + elRect.width / 2 - gridRect.left - paddingLeft
  const relY = elRect.top + elRect.height / 2 - gridRect.top - paddingTop

  const col = Math.round(relX / (cellW + colGap)) + 1
  const row = Math.round(relY / (cellH + rowGap)) + 1
  if (col < 1 || row < 1)
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
    // Resolve grid position for this icon. Auto-placed icons (no stored position)
    // have no explicit col/row, so compute the position from the DOM layout.
    const grid = gridRef.current
    const iconEl = iconRef.current
    if (!iconEl)
      return null

    let resolvedCol = col
    let resolvedRow = row
    if (resolvedCol === undefined || resolvedRow === undefined) {
      if (!grid)
        return null
      const pos = readGridPosFromDOM(iconEl, grid)
      if (!pos)
        return null
      resolvedCol = pos.col
      resolvedRow = pos.row
    }

    // For multi-drag: auto-placed selected icons also need resolved positions.
    let resolvedPositions = positions
    if (grid && selectedIds.length > 1) {
      const unresolved = selectedIds.filter(sid => sid !== id && !positions[sid])
      if (unresolved.length > 0) {
        const extra: GridLayout = {}
        grid.querySelectorAll<HTMLElement>('[data-file-id]').forEach((el) => {
          const iconId = el.dataset.fileId
          if (!iconId || !unresolved.includes(iconId))
            return
          const pos = readGridPosFromDOM(el, grid)
          if (pos)
            extra[iconId] = pos
        })
        if (Object.keys(extra).length > 0)
          resolvedPositions = { ...positions, ...extra }
      }
    }

    const isSelected = selectedIds.includes(id)
    const items = buildDragItems(id, resolvedCol, resolvedRow, resolvedPositions, selectedIds)
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

    const finish = (): void => {
      onDragPreviewChange(null)
    }

    return {
      captureIframes: true,
      onMove(nextPoint) {
        const dx = nextPoint.clientX - drag.startClientX
        const dy = nextPoint.clientY - drag.startClientY

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
