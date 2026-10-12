import type { ReactNode } from 'react'
import type { GridLayout, GridPosition } from './storage'
import { useEffect, useRef, useState } from 'react'
import { DesktopLayoutContext } from './context'
import { loadLayout, saveLayout } from './storage'

const getDefaultPosition = (index: number): GridPosition => ({ col: 1, row: index + 1 })

export function DesktopLayoutProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [storedPositions, setStoredPositions] = useState<GridLayout>(() => loadLayout())
  const gridRef = useRef<HTMLElement | null>(null)
  const isInitialRef = useRef(true)

  // Persist layout changes as a side effect of state settling so the updater
  // functions stay pure (React may invoke them twice under StrictMode/concurrent
  // rendering). Skip the initial mount so a pristine desktop isn't written back
  // before the user actually moves an icon.
  useEffect(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false
      return
    }
    saveLayout(storedPositions)
  }, [storedPositions])

  const setPosition = (id: string, pos: GridPosition): void => {
    setStoredPositions(prev => ({ ...prev, [id]: pos }))
  }

  const setPositions = (updates: GridLayout): void => {
    setStoredPositions(prev => ({ ...prev, ...updates }))
  }

  const value = { positions: storedPositions, setPosition, setPositions, getDefaultPosition, gridRef }

  return <DesktopLayoutContext value={value}>{children}</DesktopLayoutContext>
}
