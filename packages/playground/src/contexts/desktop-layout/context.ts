import type { RefObject } from 'react'
import type { GridLayout, GridPosition } from './storage'
import { createContext } from 'react'

/** Width of a desktop grid cell (px). */
export const CELL_WIDTH = 72
/** Height of a desktop grid cell (px). Sized to fit the icon plus a 2-line label. */
export const CELL_HEIGHT = 68
/** Horizontal gap between cells (px). */
export const COLUMN_GAP = 4
/** Vertical gap between cells (px). */
export const ROW_GAP = 8
/** Inner padding around the desktop grid (px). */
export const DESKTOP_PADDING = 8

export interface DesktopLayoutContextValue {
  positions: GridLayout
  /** Persist the grid position of a single icon. */
  setPosition: (id: string, pos: GridPosition) => void
  /** Persist the grid positions of several icons in one layout update. */
  setPositions: (positions: GridLayout) => void
  /** Column-first default position for an icon that has no persisted entry yet. */
  getDefaultPosition: (index: number) => GridPosition
  /** Ref to the desktop grid container. Consumers use `.current` for drop math. */
  gridRef: RefObject<HTMLElement | null>
}

export const DesktopLayoutContext = createContext<DesktopLayoutContextValue | null>(null)
