import type { GridLayout, GridPosition } from './storage'

export interface GridDropDelta {
  dCol: number
  dRow: number
  cols: number
  rows: number
}

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
  const delta = calcGridDropDelta(gridEl, dx, dy)
  if (!delta)
    return null

  return {
    col: clamp(origin.col + delta.dCol, 1, delta.cols),
    row: clamp(origin.row + delta.dRow, 1, delta.rows),
  }
}

export function calcGridDropDelta(
  gridEl: HTMLElement | null,
  dx: number,
  dy: number,
): GridDropDelta | null {
  if (!gridEl)
    return null

  const cs = window.getComputedStyle(gridEl)
  const cols = cs.getPropertyValue('grid-template-columns').split(' ')
  const rows = cs.getPropertyValue('grid-template-rows').split(' ')
  const cellW = pxToNum(cols[0] ?? '')
  const cellH = pxToNum(rows[0] ?? '')
  if (cellW <= 0 || cellH <= 0)
    return null

  const colGap = pxToNum(cs.getPropertyValue('column-gap'))
  const rowGap = pxToNum(cs.getPropertyValue('row-gap'))

  const dCol = Math.round(dx / (cellW + colGap))
  const dRow = Math.round(dy / (cellH + rowGap))

  return {
    dCol,
    dRow,
    cols: cols.length,
    rows: rows.length,
  }
}

/**
 * Resolve a concrete, collision-free grid cell for *every* desktop icon.
 *
 * The desktop is a fully JS-managed grid: each icon is given an explicit cell so
 * occupancy is always known and dragging one icon never reflows the others.
 *
 * - Icons with a valid, in-bounds, non-overlapping stored position keep it
 *   (these are the ones the user has explicitly dragged). An out-of-bounds row
 *   or a collision falls through to auto-placement so icons never stack.
 * - The remaining icons are auto-placed column-first into the first free cell,
 *   reproducing the classic Explorer "fill top-to-bottom, then next column"
 *   arrangement. This runs only for icons the user has never dragged, so a
 *   pristine desktop still arranges (and re-wraps on resize) responsively.
 *
 * `ids` must be in render order so auto-placement stays stable and deterministic.
 */
export function resolveDesktopLayout(
  ids: readonly string[],
  stored: GridLayout,
  rows: number,
): GridLayout {
  const maxRow = Math.max(1, rows)
  const result: GridLayout = {}
  const occupied = new Set<string>()
  const cellKey = (col: number, row: number): string => `${col}:${row}`

  for (const id of ids) {
    const pos = stored[id]
    if (!pos || pos.col < 1 || pos.row < 1 || pos.row > maxRow)
      continue
    const key = cellKey(pos.col, pos.row)
    if (occupied.has(key))
      continue
    occupied.add(key)
    result[id] = { col: pos.col, row: pos.row }
  }

  let col = 1
  let row = 1
  const takeFreeCell = (): GridPosition => {
    for (;;) {
      if (row > maxRow) {
        row = 1
        col += 1
      }
      const key = cellKey(col, row)
      if (!occupied.has(key)) {
        occupied.add(key)
        const cell = { col, row }
        row += 1
        return cell
      }
      row += 1
    }
  }

  for (const id of ids) {
    if (!result[id])
      result[id] = takeFreeCell()
  }

  return result
}
