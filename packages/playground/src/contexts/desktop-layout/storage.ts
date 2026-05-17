import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, writeJsonStorageItem } from '../../lib/persistence'

export interface GridPosition {
  col: number
  row: number
}

export type GridLayout = Record<string, GridPosition>

/** Cell size used for v1→v2 migration only. Must stay in sync with context constants. */
const V1_CELL = 75
const V1_PADDING = 8

function parseV1(parsed: unknown): GridLayout | null {
  if (!parsed || typeof parsed !== 'object')
    return {}
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

function migrateV1toV2(): GridLayout {
  return readJsonStorageItem('local', PLAYGROUND_STORAGE_KEYS.desktopLayoutV1, parseV1) ?? {}
}

function parseV2(parsed: unknown): GridLayout | null {
  if (!parsed || typeof parsed !== 'object')
    return {}
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
  const current = readJsonStorageItem('local', PLAYGROUND_STORAGE_KEYS.desktopLayoutV2, parseV2)
  if (current) {
    return current
  }

  // Migrate from v1 pixel positions if available.
  const migrated = migrateV1toV2()
  if (Object.keys(migrated).length > 0) {
    saveLayout(migrated)
  }
  return migrated
}

export function saveLayout(layout: GridLayout): void {
  writeJsonStorageItem('local', PLAYGROUND_STORAGE_KEYS.desktopLayoutV2, layout)
}
