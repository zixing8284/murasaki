import type { ReactNode } from 'react'
import type { GridLayout, GridPosition } from './storage'
import { useRef, useState } from 'react'
import { DesktopLayoutContext } from './context'
import { loadLayout, saveLayout } from './storage'

const getDefaultPosition = (index: number): GridPosition => ({ col: 1, row: index + 1 })

export function DesktopLayoutProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [storedPositions, setStoredPositions] = useState<GridLayout>(() => loadLayout())
  const gridRef = useRef<HTMLElement | null>(null)

  const setPosition = (id: string, pos: GridPosition): void => {
    setStoredPositions((prev) => {
      const next: GridLayout = { ...prev, [id]: pos }
      saveLayout(next)
      return next
    })
  }

  const setPositions = (updates: GridLayout): void => {
    setStoredPositions((prev) => {
      const next: GridLayout = { ...prev, ...updates }
      saveLayout(next)
      return next
    })
  }

  const value = { positions: storedPositions, setPosition, setPositions, getDefaultPosition, gridRef }

  return <DesktopLayoutContext value={value}>{children}</DesktopLayoutContext>
}
