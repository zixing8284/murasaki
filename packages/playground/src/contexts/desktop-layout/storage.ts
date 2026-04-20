export interface GridPosition {
  col: number
  row: number
}

export type GridLayout = Record<string, GridPosition>

const LAYOUT_V2_KEY = 'murasaki.desktop.layout.v2'
const LAYOUT_V1_KEY = 'murasaki.desktop.layout.v1'

/** Cell size used for v1→v2 migration only. Must stay in sync with context constants. */
const V1_CELL = 75
const V1_PADDING = 8

function migrateV1toV2(): GridLayout {
  try {
    const raw = window.localStorage.getItem(LAYOUT_V1_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const result: GridLayout = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        value
        && typeof value === 'object'
        && typeof (value as { x: number }).x === 'number'
        && typeof (value as { y: number }).y === 'number'
      ) {
        const { x, y } = value as { x: number, y: number }
        result[id] = {
          col: Math.max(1, Math.round((x - V1_PADDING) / V1_CELL) + 1),
          row: Math.max(1, Math.round((y - V1_PADDING) / V1_CELL) + 1),
        }
      }
    }
    return result
  }
  catch {
    return {}
  }
}

function parseV2(raw: string): GridLayout {
  const parsed = JSON.parse(raw) as unknown
  if (!parsed || typeof parsed !== 'object') return {}
  const result: GridLayout = {}
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (
      value
      && typeof value === 'object'
      && typeof (value as GridPosition).col === 'number'
      && typeof (value as GridPosition).row === 'number'
    ) {
      result[id] = {
        col: (value as GridPosition).col,
        row: (value as GridPosition).row,
      }
    }
  }
  return result
}

export function loadLayout(): GridLayout {
  if (typeof window === 'undefined') return {}
  try {
    const v2Raw = window.localStorage.getItem(LAYOUT_V2_KEY)
    if (v2Raw) return parseV2(v2Raw)
    // Migrate from v1 pixel positions if available.
    const migrated = migrateV1toV2()
    if (Object.keys(migrated).length > 0) {
      saveLayout(migrated)
    }
    return migrated
  }
  catch {
    return {}
  }
}

export function saveLayout(layout: GridLayout): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LAYOUT_V2_KEY, JSON.stringify(layout))
  }
  catch {
    // Ignore quota / serialization errors — layout is best effort.
  }
}
