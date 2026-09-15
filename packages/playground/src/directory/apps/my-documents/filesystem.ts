import { ICON } from '../../../lib/icons'

/**
 * Presentation helpers for the Explorer window. The file data itself lives in
 * the persistent virtual file system (`contexts/file-system`); this module only
 * covers Windows-style formatting and the handful of chrome icons the address
 * bar / status bar / folder tree render.
 */

export const FS_ICONS = {
  folder: ICON.folderClosed.sm,
  folderOpen: ICON.folderOpen.sm,
  myComputer: ICON.myComputer.sm,
} as const

/** The Windows-style address string for a path, e.g. `C:\My Documents`. */
export function formatAddress(path: readonly string[]): string {
  // Drop the leading Desktop / My Computer entries; start at the drive.
  const driveIndex = path.findIndex(name => /^\([A-Z]:\)$/.test(name))
  if (driveIndex === -1)
    return path[path.length - 1] ?? ''
  const drive = path[driveIndex].replace(/[()]/g, '')
  const rest = path.slice(driveIndex + 1)
  return rest.length > 0 ? `${drive}\\${rest.join('\\')}` : `${drive}\\`
}

export function formatSize(bytes: number): string {
  if (bytes === 0)
    return '0 bytes'
  if (bytes < 1024)
    return `${bytes} bytes`
  const kb = bytes / 1024
  if (kb < 1024)
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)}KB`
  const mb = kb / 1024
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)}MB`
}

/** Windows-style last-modified date, e.g. `12/31/99 12:00 PM`. */
export function formatModified(epochMs: number): string {
  const date = new Date(epochMs)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = String(date.getFullYear()).slice(-2)
  let hours = date.getHours()
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day}/${year} ${hours}:${minutes} ${meridiem}`
}
