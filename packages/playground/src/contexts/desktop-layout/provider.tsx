import type { ReactNode } from 'react'
import type { GridLayout, GridPosition } from './storage'
import { useCallback, useMemo, useRef, useState } from 'react'
import { DesktopLayoutContext } from './context'
import { loadLayout, saveLayout } from './storage'

export function DesktopLayoutProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [storedPositions, setStoredPositions] = useState<GridLayout>(() => loadLayout())
  const gridRef = useRef<HTMLElement | null>(null)

  const setPosition = useCallback((id: string, pos: GridPosition) => {
    setStoredPositions((prev) => {
      const next: GridLayout = { ...prev, [id]: pos }
      saveLayout(next)
      return next
    })
  }, [])

  const setPositions = useCallback((updates: GridLayout) => {
    setStoredPositions((prev) => {
      const next: GridLayout = { ...prev, ...updates }
      saveLayout(next)
      return next
    })
  }, [])

  const getDefaultPosition = useCallback(
    (index: number): GridPosition => ({ col: 1, row: index + 1 }),
    [],
  )

  const value = useMemo(
    () => ({ positions: storedPositions, setPosition, setPositions, getDefaultPosition, gridRef }),
    [storedPositions, setPosition, setPositions, getDefaultPosition],
  )

  return <DesktopLayoutContext value={value}>{children}</DesktopLayoutContext>
}
