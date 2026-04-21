import type { GridPosition } from './storage'

function pxToNum(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/**
 * Compute the 1-indexed CSS grid cell an icon should snap to, given a drag
 * displacement from its current cell.
 *
 * Reads live `getComputedStyle` values (track sizes, gaps) so the math stays
 * in sync with whatever CSS is actually rendering — including the number of
 * tracks `auto-fill` produced at the current viewport width.
 *
 * Uses `Math.round` on the delta so moving half a slot in any direction snaps
 * to the neighbor — symmetric, independent of where the icon visually sits
 * inside its cell.
 *
 * Returns `null` when no grid element is available.
 */
export function calcGridDropTarget(
  gridEl: HTMLElement | null,
  origin: GridPosition,
  dx: number,
  dy: number,
): GridPosition | null {
  if (!gridEl) return null

  const cs = window.getComputedStyle(gridEl)
  const cols = cs.getPropertyValue('grid-template-columns').split(' ')
  const rows = cs.getPropertyValue('grid-template-rows').split(' ')
  const cellW = pxToNum(cols[0] ?? '')
  const cellH = pxToNum(rows[0] ?? '')
  if (cellW <= 0 || cellH <= 0) return null

  const colGap = pxToNum(cs.getPropertyValue('column-gap'))
  const rowGap = pxToNum(cs.getPropertyValue('row-gap'))

  const dCol = Math.round(dx / (cellW + colGap))
  const dRow = Math.round(dy / (cellH + rowGap))

  return {
    col: clamp(origin.col + dCol, 1, cols.length),
    row: clamp(origin.row + dRow, 1, rows.length),
  }
}
