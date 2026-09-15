import type { VfsNode } from '../../../contexts/file-system'
import { associate } from '../../../contexts/file-system'

export type SortKey = 'name' | 'size' | 'type' | 'modified'
export type SortDir = 'asc' | 'desc'

export interface SortState {
  key: SortKey
  dir: SortDir
}

function compareNodes(a: VfsNode, b: VfsNode, key: SortKey): number {
  switch (key) {
    case 'size':
      return a.size - b.size
    case 'modified':
      return a.modifiedAt - b.modifiedAt
    case 'type': {
      const aType = a.type === 'folder' ? 'File Folder' : associate(a.name).kind
      const bType = b.type === 'folder' ? 'File Folder' : associate(b.name).kind
      return aType.localeCompare(bType)
    }
    case 'name':
    default:
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  }
}

/** Sort nodes with folders grouped first (classic Explorer behavior). */
export function sortNodes(nodes: readonly VfsNode[], { key, dir }: SortState): VfsNode[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type)
      return a.type === 'folder' ? -1 : 1
    const primary = compareNodes(a, b, key)
    if (primary !== 0)
      return primary * sign
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }) * sign
  })
}
