import type { ReactNode } from 'react'
import type { IconLayout, IconPosition } from './storage'
import { useCallback, useMemo, useState } from 'react'
import {
  DESKTOP_PADDING,
  DesktopLayoutContext,
  GRID_SIZE,
} from './context'
import {
  loadAlignToGrid,
  loadLayout,
  saveAlignToGrid,
  saveLayout,
} from './storage'

function snapValue(value: number): number {
  // Anchor grid origin at DESKTOP_PADDING so snapped positions align with defaults.
  const offset = value - DESKTOP_PADDING
  return Math.round(offset / GRID_SIZE) * GRID_SIZE + DESKTOP_PADDING
}

function snapPosition(pos: IconPosition): IconPosition {
  return { x: snapValue(pos.x), y: snapValue(pos.y) }
}

export function DesktopLayoutProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [positions, setPositions] = useState<IconLayout>(() => loadLayout())
  const [alignToGrid, setAlignToGridState] = useState<boolean>(() => loadAlignToGrid())

  const setPosition = useCallback((id: string, pos: IconPosition) => {
    setPositions((prev) => {
      const next: IconLayout = { ...prev, [id]: pos }
      saveLayout(next)
      return next
    })
  }, [])

  const setAlignToGrid = useCallback((value: boolean) => {
    setAlignToGridState(value)
    saveAlignToGrid(value)
    if (value) {
      // Snap all existing positions immediately so the grid mode is visible.
      setPositions((prev) => {
        const next: IconLayout = {}
        for (const [id, pos] of Object.entries(prev)) {
          next[id] = snapPosition(pos)
        }
        saveLayout(next)
        return next
      })
    }
  }, [])

  const snap = useCallback(
    (pos: IconPosition): IconPosition => (alignToGrid ? snapPosition(pos) : pos),
    [alignToGrid],
  )

  const getDefaultPosition = useCallback(
    (index: number): IconPosition => ({
      x: DESKTOP_PADDING,
      y: DESKTOP_PADDING + index * GRID_SIZE,
    }),
    [],
  )

  const value = useMemo(
    () => ({ positions, alignToGrid, snap, setPosition, setAlignToGrid, getDefaultPosition }),
    [positions, alignToGrid, snap, setPosition, setAlignToGrid, getDefaultPosition],
  )

  return <DesktopLayoutContext value={value}>{children}</DesktopLayoutContext>
}
