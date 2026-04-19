export interface IconPosition {
  x: number
  y: number
}

export type IconLayout = Record<string, IconPosition>

const LAYOUT_KEY = 'murasaki.desktop.layout.v1'
const ALIGN_KEY = 'murasaki.desktop.alignToGrid.v1'

export function loadLayout(): IconLayout {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LAYOUT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const result: IconLayout = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        value
        && typeof value === 'object'
        && typeof (value as IconPosition).x === 'number'
        && typeof (value as IconPosition).y === 'number'
      ) {
        result[id] = { x: (value as IconPosition).x, y: (value as IconPosition).y }
      }
    }
    return result
  }
  catch {
    return {}
  }
}

export function saveLayout(layout: IconLayout): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
  }
  catch {
    // Ignore quota / serialization errors — layout is best effort.
  }
}

export function loadAlignToGrid(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(ALIGN_KEY) === 'true'
  }
  catch {
    return false
  }
}

export function saveAlignToGrid(value: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ALIGN_KEY, String(value))
  }
  catch {
    // Ignore.
  }
}
