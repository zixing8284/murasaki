import type { ReactNode } from 'react'
import type { GridLayout, GridPosition } from './storage'
import { useCallback, useMemo, useState } from 'react'
import { DesktopLayoutContext } from './context'
import { loadLayout, saveLayout } from './storage'

export function DesktopLayoutProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [positions, setPositions] = useState<GridLayout>(() => loadLayout())

  const setPosition = useCallback((id: string, pos: GridPosition) => {
    setPositions((prev) => {
      const next: GridLayout = { ...prev, [id]: pos }
      saveLayout(next)
      return next
    })
  }, [])

  const isCellOccupied = useCallback(
    (col: number, row: number, excludeId?: string): boolean =>
      Object.entries(positions).some(
        ([id, p]) => id !== excludeId && p.col === col && p.row === row,
      ),
    [positions],
  )

  const getDefaultPosition = useCallback(
    (index: number): GridPosition => ({ col: 1, row: index + 1 }),
    [],
  )

  const value = useMemo(
    () => ({ positions, setPosition, isCellOccupied, getDefaultPosition }),
    [positions, setPosition, isCellOccupied, getDefaultPosition],
  )

  return <DesktopLayoutContext value={value}>{children}</DesktopLayoutContext>
}
