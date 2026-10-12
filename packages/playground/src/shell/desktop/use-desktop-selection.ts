import type { Dispatch, RefObject, SetStateAction } from 'react'
import type { ShellInputPoint, ShellInputSession, ShellInputSurface } from '../input/shell-input-registry'
import { useCallback, useMemo, useState } from 'react'
import { getScreenFromLocalMatrix, scaleMagnitude } from '../input/geometry'
import { useShellInputSurface } from '../input/shell-input-registry'

export const SELECTION_THRESHOLD = 2

export interface SelectionRect {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function getSelectionBox(rect: SelectionRect): { left: number, top: number, width: number, height: number } {
  return {
    left: Math.min(rect.startX, rect.currentX),
    top: Math.min(rect.startY, rect.currentY),
    width: Math.abs(rect.currentX - rect.startX),
    height: Math.abs(rect.currentY - rect.startY),
  }
}

function mergeSelectedIds(baseIds: readonly string[], selectedIds: readonly string[]): string[] {
  return Array.from(new Set([...baseIds, ...selectedIds]))
}

export interface UseDesktopSelectionOptions {
  desktopRef: RefObject<HTMLDivElement | null>
  desktopEl: HTMLDivElement | null
  /** Clears any in-progress icon drag preview when a marquee selection begins. */
  clearDragPreview: () => void
}

export interface UseDesktopSelectionReturn {
  selectedIconIds: string[]
  setSelectedIconIds: Dispatch<SetStateAction<string[]>>
  selectionRect: SelectionRect | null
  handleIconSelect: (id: string, additive: boolean, preserveSelectedGroup: boolean) => void
}

/**
 * Owns desktop icon selection: click/ctrl-click toggling plus marquee (lasso)
 * selection driven through the shell input registry.
 *
 * All pointer geometry is converted into the desktop's own logical pixels by
 * dividing out the ancestor `transform: scale()`, so the marquee rectangle and
 * hit-testing stay correct regardless of the desktop's fit scaling.
 */
export function useDesktopSelection({
  desktopRef,
  desktopEl,
  clearDragPreview,
}: UseDesktopSelectionOptions): UseDesktopSelectionReturn {
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>([])
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)

  const getDesktopPoint = useCallback((clientX: number, clientY: number): { x: number, y: number } | null => {
    const desktop = desktopRef.current
    if (!desktop)
      return null

    const rect = desktop.getBoundingClientRect()
    // The desktop is uniformly scaled by a `transform: scale()` ancestor. Divide
    // client-space offsets by the scale so the returned point (and the marquee
    // rendered from it) lives in the desktop's own logical pixels.
    const scale = scaleMagnitude(getScreenFromLocalMatrix(desktop))
    return {
      x: Math.max(0, Math.min((clientX - rect.left) / scale, rect.width / scale)),
      y: Math.max(0, Math.min((clientY - rect.top) / scale, rect.height / scale)),
    }
  }, [desktopRef])

  const getIconIdsInSelection = useCallback((rect: SelectionRect): string[] => {
    const desktop = desktopRef.current
    if (!desktop)
      return []

    const desktopBounds = desktop.getBoundingClientRect()
    const scale = scaleMagnitude(getScreenFromLocalMatrix(desktop))
    const box = getSelectionBox(rect)
    const selectedIds: string[] = []

    desktop.querySelectorAll<HTMLElement>('[data-file-id]').forEach((iconEl) => {
      const id = iconEl.dataset.fileId
      if (!id)
        return

      const iconBounds = iconEl.getBoundingClientRect()
      const iconRect = {
        left: (iconBounds.left - desktopBounds.left) / scale,
        top: (iconBounds.top - desktopBounds.top) / scale,
        right: (iconBounds.right - desktopBounds.left) / scale,
        bottom: (iconBounds.bottom - desktopBounds.top) / scale,
      }

      if (
        box.left < iconRect.right
        && box.left + box.width > iconRect.left
        && box.top < iconRect.bottom
        && box.top + box.height > iconRect.top
      ) {
        selectedIds.push(id)
      }
    })

    return selectedIds
  }, [desktopRef])

  const handleIconSelect = (id: string, additive: boolean, preserveSelectedGroup: boolean): void => {
    setSelectedIconIds((currentIds) => {
      if (additive) {
        if (currentIds.includes(id))
          return currentIds.filter(selectedId => selectedId !== id)
        return [...currentIds, id]
      }

      if (preserveSelectedGroup && currentIds.includes(id))
        return currentIds

      return [id]
    })
  }

  const beginLassoSelection = useCallback((point: ShellInputPoint): ShellInputSession | null => {
    const start = getDesktopPoint(point.clientX, point.clientY)
    if (!start)
      return null

    const drag = {
      startX: start.x,
      startY: start.y,
      additive: point.ctrlKey || point.metaKey,
      baseSelectedIds: point.ctrlKey || point.metaKey ? selectedIconIds : [],
      moved: false,
    }
    clearDragPreview()
    if (!drag.additive)
      setSelectedIconIds([])
    setSelectionRect({ startX: start.x, startY: start.y, currentX: start.x, currentY: start.y })

    const update = (nextPoint: ShellInputPoint): void => {
      const current = getDesktopPoint(nextPoint.clientX, nextPoint.clientY)
      if (!current)
        return

      const nextRect = {
        startX: drag.startX,
        startY: drag.startY,
        currentX: current.x,
        currentY: current.y,
      }

      if (!drag.moved) {
        if (
          Math.abs(current.x - drag.startX) < SELECTION_THRESHOLD
          && Math.abs(current.y - drag.startY) < SELECTION_THRESHOLD
        ) {
          return
        }
        drag.moved = true
      }

      setSelectionRect(nextRect)
      const idsInSelection = getIconIdsInSelection(nextRect)
      setSelectedIconIds(
        drag.additive
          ? mergeSelectedIds(drag.baseSelectedIds, idsInSelection)
          : idsInSelection,
      )
    }

    const finish = (): void => setSelectionRect(null)

    return {
      onMove: update,
      onEnd: finish,
      onCancel: finish,
    }
  }, [clearDragPreview, getDesktopPoint, getIconIdsInSelection, selectedIconIds])

  const lassoSurface = useMemo<ShellInputSurface | null>(() => {
    if (!desktopEl)
      return null
    return {
      id: 'desktop:lasso',
      element: desktopEl,
      priority: 100,
      contains(point: ShellInputPoint) {
        return document.elementFromPoint(point.clientX, point.clientY) === desktopEl
      },
      onStart: beginLassoSelection,
    }
  }, [beginLassoSelection, desktopEl])
  useShellInputSurface(lassoSurface)

  return { selectedIconIds, setSelectedIconIds, selectionRect, handleIconSelect }
}
