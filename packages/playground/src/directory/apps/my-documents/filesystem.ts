import type { AppId } from '../../../contexts/process/directory'
import { APP_ID } from '../../../contexts/process/directory'

/**
 * A tiny in-memory virtual filesystem powering the My Documents / Explorer
 * window. It is intentionally static (a fixed snapshot of a Windows 98 C:
 * drive) — enough to browse folders, open a couple of file types, and mirror
 * the look of the classic Explorer, without a persistence layer.
 */

export interface FsFile {
  type: 'file'
  name: string
  /** 16px icon path (rendered pixel-doubled in the large-icon grid). */
  icon: string
  /** Human-readable type shown in details / status contexts. */
  kind: string
  /** Size in bytes. */
  size: number
  /** App launched on open, when the type is supported. */
  openApp?: AppId
}

export interface FsFolder {
  type: 'folder'
  name: string
  /** Optional custom 16px icon (defaults to a closed folder). */
  icon?: string
  children: FsNode[]
}

export type FsNode = FsFile | FsFolder

export const FS_ICONS = {
  folder: '/icons/folder-closed-16.png',
  folderOpen: '/icons/folder-open-16.png',
  myDocuments: '/icons/folder-my-docs-16.png',
  myComputer: '/icons/my-computer-16.png',
  desktop: '/icons/desktop-16.png',
  hardDrive: '/icons/hard-drive-16.png',
  floppy: '/icons/floppy-drive-16.png',
  cdDrive: '/icons/cd-drive-16.png',
  network: '/icons/network-neighborhood-16.png',
  controlPanel: '/icons/control-panel-16.png',
  printers: '/icons/printer-16.png',
  recycleBin: '/icons/recycle-bin-16.png',
  textFile: '/icons/text-file-16.png',
  document: '/icons/document-file-16.png',
  audio: '/icons/audio-file-16.png',
  midi: '/icons/midi-file-16.png',
  image: '/icons/image-file-16.png',
} as const

function textFile(name: string, size: number): FsFile {
  return { type: 'file', name, icon: FS_ICONS.textFile, kind: 'Text Document', size, openApp: APP_ID.NOTEPAD }
}

function audioFile(name: string, size: number): FsFile {
  return { type: 'file', name, icon: FS_ICONS.audio, kind: 'Audio File', size, openApp: APP_ID.MEDIA_PLAYER }
}

function midiFile(name: string, size: number): FsFile {
  return { type: 'file', name, icon: FS_ICONS.midi, kind: 'MIDI Sequence', size, openApp: APP_ID.MEDIA_PLAYER }
}

function imageFile(name: string, size: number): FsFile {
  return { type: 'file', name, icon: FS_ICONS.image, kind: 'Image', size }
}

function documentFile(name: string, size: number): FsFile {
  return { type: 'file', name, icon: FS_ICONS.document, kind: 'Document', size }
}

const myDocuments: FsFolder = {
  type: 'folder',
  name: 'My Documents',
  icon: FS_ICONS.myDocuments,
  children: [
    { type: 'folder', name: 'Images', children: [
      imageFile('sunset.jpg', 48210),
      imageFile('logo.gif', 3120),
    ] },
    { type: 'folder', name: 'Media', children: [
      audioFile('intro.wav', 220400),
    ] },
    audioFile('1999.mp3', 4120000),
    audioFile('SONATA8.WAV', 980400),
    midiFile('GROOVE.MID', 18240),
    documentFile('The California Ideology.pdf', 220100),
    documentFile('parableofthesower.pdf', 512300),
    textFile('README.TXT', 2048),
    textFile('empty.txt', 0),
  ],
}

const driveC: FsFolder = {
  type: 'folder',
  name: '(C:)',
  icon: FS_ICONS.hardDrive,
  children: [
    { type: 'folder', name: 'Downloads', children: [] },
    { type: 'folder', name: 'Program Files', children: [] },
    { type: 'folder', name: 'Windows', children: [] },
    { type: 'folder', name: 'dos', children: [] },
    myDocuments,
    textFile('autoexec.bat', 512),
    textFile('config.sys', 384),
  ],
}

const myComputer: FsFolder = {
  type: 'folder',
  name: 'My Computer',
  icon: FS_ICONS.myComputer,
  children: [
    { type: 'folder', name: '3½ Floppy (A:)', icon: FS_ICONS.floppy, children: [] },
    driveC,
    { type: 'folder', name: '(D:)', icon: FS_ICONS.cdDrive, children: [] },
    { type: 'folder', name: 'Control Panel', icon: FS_ICONS.controlPanel, children: [] },
    { type: 'folder', name: 'Printers', icon: FS_ICONS.printers, children: [] },
  ],
}

/** Root shown at the top of the folder tree. */
export const DESKTOP_ROOT: FsFolder = {
  type: 'folder',
  name: 'Desktop',
  icon: FS_ICONS.desktop,
  children: [
    myComputer,
    { type: 'folder', name: 'Network Neighborhood', icon: FS_ICONS.network, children: [] },
    { type: 'folder', name: 'Recycle Bin', icon: FS_ICONS.recycleBin, children: [] },
  ],
}

/** Default folder the window opens to. */
export const DEFAULT_PATH: readonly string[] = ['Desktop', 'My Computer', '(C:)', 'My Documents']

export function isFolder(node: FsNode): node is FsFolder {
  return node.type === 'folder'
}

/** Resolve a path (array of node names from the root) to its folder, or null. */
export function resolveFolder(path: readonly string[]): FsFolder | null {
  if (path.length === 0 || path[0] !== DESKTOP_ROOT.name)
    return null
  let current: FsFolder = DESKTOP_ROOT
  for (let i = 1; i < path.length; i++) {
    const next = current.children.find(
      (child): child is FsFolder => isFolder(child) && child.name === path[i],
    )
    if (!next)
      return null
    current = next
  }
  return current
}

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

/** Total size of the immediate file children of a folder. */
export function folderSize(folder: FsFolder): number {
  return folder.children.reduce((sum, child) => (child.type === 'file' ? sum + child.size : sum), 0)
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
