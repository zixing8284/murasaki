import type { IconLayout, IconPosition } from './storage'
import { createContext } from 'react'

/** Size (px) of a single desktop grid cell. */
export const GRID_SIZE = 75
/** Icon width (px) — matches the `w-16` class on DesktopIcon. */
export const ICON_WIDTH = 64
/** Approximate icon height incl. label (px). */
export const ICON_HEIGHT = 54
/** Inner padding around the desktop grid origin. */
export const DESKTOP_PADDING = 8

export interface DesktopLayoutContextValue {
  positions: IconLayout
  alignToGrid: boolean
  /** Snap an arbitrary {x,y} to the current grid. Does not apply when grid mode is off. */
  snap: (pos: IconPosition) => IconPosition
  /** Persist the position of a single icon. */
  setPosition: (id: string, pos: IconPosition) => void
  /** Toggle / set the align-to-grid mode. Turning it on snaps all existing positions. */
  setAlignToGrid: (value: boolean) => void
  /** Column-first default position for an icon that has no persisted entry yet. */
  getDefaultPosition: (index: number) => IconPosition
}

export const DesktopLayoutContext = createContext<DesktopLayoutContextValue | null>(null)
