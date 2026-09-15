import type { VfsNode } from './types'
import { ICON } from '../../lib/icons'
import { associate } from './associations'
import { joinPath, ROOT_PATH } from './vfs-path'

/**
 * Starter tree seeded into IndexedDB on first run — a fixed snapshot of a
 * Windows 98 C: drive. Demo files carry real content so viewers work out of the
 * box: images point at bundled wallpapers/icons (`assetUrl`), text files inline
 * their body (`textContent`), and the sample PDF references a public asset.
 * Everything is user-editable afterwards; `system` folders are protected.
 */

interface SeedFile {
  type: 'file'
  name: string
  size: number
  /** Overrides for the association-derived kind/icon/openApp. */
  mimeType?: string
  assetUrl?: string
  streamUrl?: string
  textContent?: string
}

interface SeedFolder {
  type: 'folder'
  name: string
  icon?: string
  system?: boolean
  hideInTree?: boolean
  children: SeedNode[]
}

type SeedNode = SeedFile | SeedFolder

const SEED_TIME = Date.UTC(1999, 11, 31, 12, 0, 0)

// Remote sample tracks (streamed, not downloaded) preserved from the demo.
const SAMPLE_TRACK_BASE = 'https://s2jglcbck31odyaw.public.blob.vercel-storage.com/tracks'
function sampleTrackUrl(filename: string): string {
  return `${SAMPLE_TRACK_BASE}/${encodeURIComponent(filename)}`
}

const README_TEXT = [
  'Welcome to My Documents.',
  '',
  'This folder lives in your browser (IndexedDB). Drag files in from your',
  'desktop, right-click to create new documents, and double-click to open',
  'them in the built-in viewers.',
  '',
  '— Murasaki',
].join('\r\n')

const tree: SeedFolder = {
  type: 'folder',
  name: ROOT_PATH,
  icon: ICON.desktop.sm,
  system: true,
  children: [
    {
      type: 'folder',
      name: 'My Computer',
      icon: ICON.myComputer.sm,
      system: true,
      children: [
        { type: 'folder', name: '3½ Floppy (A:)', icon: ICON.floppyDrive.sm, system: true, children: [] },
        {
          type: 'folder',
          name: '(C:)',
          icon: ICON.hardDrive.sm,
          system: true,
          children: [
            { type: 'folder', name: 'Downloads', icon: ICON.downloadsFolder.sm, children: [] },
            { type: 'folder', name: 'Program Files', system: true, children: [] },
            { type: 'folder', name: 'Windows', system: true, children: [] },
            { type: 'folder', name: 'dos', system: true, children: [] },
            {
              type: 'folder',
              name: 'My Documents',
              icon: ICON.folderMyDocs.sm,
              children: [
                {
                  type: 'folder',
                  name: 'Images',
                  children: [
                    { type: 'file', name: 'water.gif', size: 82360, mimeType: 'image/gif', assetUrl: '/wallpaper/water.gif' },
                    { type: 'file', name: 'clouds.gif', size: 41200, mimeType: 'image/gif', assetUrl: '/wallpaper/animspace.gif' },
                    { type: 'file', name: 'my-computer.png', size: 3120, mimeType: 'image/png', assetUrl: '/icons/my-computer-32.png' },
                  ],
                },
                {
                  type: 'folder',
                  name: 'Media',
                  children: [
                    { type: 'file', name: 'intro.wav', size: 220400 },
                    { type: 'file', name: '五月はベリルの風をつれて.mp3', size: 4325376, mimeType: 'audio/mpeg', streamUrl: sampleTrackUrl('みとせのりこ - 五月はベリルの风をつれて.mp3') },
                    { type: 'file', name: 'Eyes On Me.mp3', size: 4876288, mimeType: 'audio/mpeg', streamUrl: sampleTrackUrl('王菲 - Eyes On Me.mp3') },
                  ],
                },
                { type: 'file', name: '1999.mp3', size: 1242972, mimeType: 'audio/mpeg', assetUrl: '/sample/1999.mp3' },
                { type: 'file', name: 'Uncle fixed the music box.mp4', size: 2518619, mimeType: 'video/mp4', assetUrl: '/sample/Uncle fixed the music box.mp4' },
                { type: 'file', name: 'SONATA8.WAV', size: 980400 },
                { type: 'file', name: 'GROOVE.MID', size: 18240 },
                { type: 'file', name: 'Welcome.pdf', size: 676, mimeType: 'application/pdf', assetUrl: '/sample/welcome.pdf' },
                { type: 'file', name: 'README.TXT', size: README_TEXT.length, textContent: README_TEXT },
                { type: 'file', name: 'empty.txt', size: 0, textContent: '' },
              ],
            },
            { type: 'file', name: 'autoexec.bat', size: 512, textContent: '@ECHO OFF\r\nPROMPT $P$G\r\n' },
            { type: 'file', name: 'config.sys', size: 384, textContent: 'DEVICE=C:\\WINDOWS\\HIMEM.SYS\r\n' },
          ],
        },
        { type: 'folder', name: '(D:)', icon: ICON.cdDrive.sm, system: true, children: [] },
        { type: 'folder', name: 'Control Panel', icon: ICON.controlPanel.sm, system: true, children: [] },
        { type: 'folder', name: 'Printers', icon: ICON.printer.sm, system: true, children: [] },
      ],
    },
    {
      type: 'folder',
      name: 'Network Neighborhood',
      icon: ICON.networkNeighborhood.sm,
      system: true,
      children: [
        { type: 'folder', name: 'Entire Network', icon: ICON.networkNeighborhood.sm, system: true, children: [] },
      ],
    },
    { type: 'folder', name: 'Recycle Bin', icon: ICON.recycleBin.sm, system: true, children: [] },
  ],
}

function flatten(node: SeedNode, parentPath: string, out: VfsNode[]): void {
  const path = joinPath(parentPath, node.name)

  if (node.type === 'folder') {
    out.push({
      path,
      parentPath,
      name: node.name,
      type: 'folder',
      icon: node.icon ?? ICON.folderClosed.sm,
      kind: 'File Folder',
      size: 0,
      createdAt: SEED_TIME,
      modifiedAt: SEED_TIME,
      system: node.system,
      hideInTree: node.hideInTree,
    })
    for (const child of node.children)
      flatten(child, path, out)
    return
  }

  const association = associate(node.name)
  out.push({
    path,
    parentPath,
    name: node.name,
    type: 'file',
    icon: association.icon,
    kind: association.kind,
    size: node.size,
    createdAt: SEED_TIME,
    modifiedAt: SEED_TIME,
    mimeType: node.mimeType,
    openApp: association.openApp,
    assetUrl: node.assetUrl,
    streamUrl: node.streamUrl,
    textContent: node.textContent,
    hasBlob: false,
  })
}

/** Build the flat list of nodes seeded on first run. */
export function buildSeedNodes(): VfsNode[] {
  const nodes: VfsNode[] = []
  flatten(tree, '', nodes)
  return nodes
}

/** Default folder the Explorer opens to. */
export const DEFAULT_PATH = 'Desktop/My Computer/(C:)/My Documents'

/** The Recycle Bin folder deleted items are moved into. */
export const RECYCLE_BIN_PATH = 'Desktop/Recycle Bin'
