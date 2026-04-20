import type { GridLayout, GridPosition } from './storage'
import { createContext } from 'react'

/** Width of a desktop grid cell (px). */
export const CELL_WIDTH = 75
/** Height of a desktop grid cell (px). */
export const CELL_HEIGHT = 75
/** Inner padding around the desktop grid (px). */
export const DESKTOP_PADDING = 8

export interface DesktopLayoutContextValue {
  positions: GridLayout
  /** Persist the grid position of a single icon. */
  setPosition: (id: string, pos: GridPosition) => void
  /** Check whether a grid cell is occupied (optionally exclude one icon). */
  isCellOccupied: (col: number, row: number, excludeId?: string) => boolean
  /** Column-first default position for an icon that has no persisted entry yet. */
  getDefaultPosition: (index: number) => GridPosition
}

export const DesktopLayoutContext = createContext<DesktopLayoutContextValue | null>(null)
