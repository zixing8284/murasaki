import type { AppId } from '../process/directory'
import type { VfsNode } from './types'
import { ICON } from '../../lib/icons'
import { APP_ID } from '../process/directory'

/** Broad handling category derived from a file's extension. */
export type FileCategory = 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'other'

export interface FileAssociation {
  category: FileCategory
  /** Human-readable type label ("PNG Image", "Text Document", …). */
  kind: string
  /** 16px icon path. */
  icon: string
  /** App launched on open, when the category is handled. */
  openApp?: AppId
}

const IMAGE_KINDS: Record<string, string> = {
  apng: 'APNG Image',
  avif: 'AVIF Image',
  bmp: 'Bitmap Image',
  gif: 'GIF Image',
  ico: 'Icon',
  jfif: 'JPEG Image',
  jpeg: 'JPEG Image',
  jpg: 'JPEG Image',
  png: 'PNG Image',
  svg: 'SVG Image',
  webp: 'WebP Image',
}

const AUDIO_EXTENSIONS = new Set(['aac', 'flac', 'm4a', 'mp3', 'oga', 'ogg', 'opus', 'wav', 'weba'])
const MIDI_EXTENSIONS = new Set(['mid', 'midi', 'rmi'])
const VIDEO_EXTENSIONS = new Set(['avi', 'm4v', 'mkv', 'mov', 'mp4', 'ogv', 'webm'])

const TEXT_KINDS: Record<string, string> = {
  bat: 'MS-DOS Batch File',
  cfg: 'Configuration File',
  cmd: 'Windows Command Script',
  css: 'Cascading Style Sheet',
  csv: 'CSV File',
  htm: 'HTML Document',
  html: 'HTML Document',
  ini: 'Configuration Settings',
  js: 'JavaScript File',
  json: 'JSON File',
  log: 'Text Document',
  md: 'Markdown Document',
  sys: 'System File',
  ts: 'TypeScript File',
  txt: 'Text Document',
  xml: 'XML Document',
}

/** Lower-case extension without the dot, or `''` when there is none. */
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot <= 0 ? '' : name.slice(dot + 1).toLowerCase()
}

/** Resolve how a file should be labelled, iconed, and opened. */
export function associate(name: string): FileAssociation {
  const ext = extensionOf(name)

  if (ext in IMAGE_KINDS)
    return { category: 'image', kind: IMAGE_KINDS[ext], icon: ICON.imageFile.sm, openApp: APP_ID.IMAGE_VIEWER }

  if (ext === 'pdf')
    return { category: 'pdf', kind: 'Adobe Acrobat Document', icon: ICON.documentFile.sm, openApp: APP_ID.PDF_VIEWER }

  if (MIDI_EXTENSIONS.has(ext))
    return { category: 'audio', kind: 'MIDI Sequence', icon: ICON.midiFile.sm, openApp: APP_ID.MEDIA_PLAYER }

  if (AUDIO_EXTENSIONS.has(ext))
    return { category: 'audio', kind: 'Audio File', icon: ICON.audioFile.sm, openApp: APP_ID.MEDIA_PLAYER }

  if (VIDEO_EXTENSIONS.has(ext))
    return { category: 'video', kind: 'Video Clip', icon: ICON.mediaPlayer.sm, openApp: APP_ID.MEDIA_PLAYER }

  if (ext === 'htm' || ext === 'html')
    return { category: 'text', kind: TEXT_KINDS[ext], icon: ICON.htmlFile.sm, openApp: APP_ID.NOTEPAD }

  if (ext in TEXT_KINDS)
    return { category: 'text', kind: TEXT_KINDS[ext], icon: ICON.textFile.sm, openApp: APP_ID.NOTEPAD }

  return { category: 'other', kind: ext ? `${ext.toUpperCase()} File` : 'File', icon: ICON.documentFile.sm }
}

/** Category for an existing node, honoring its stored open-app override. */
export function categoryOf(node: VfsNode): FileCategory {
  return associate(node.name).category
}

/** The app that should open a node (explicit override, else by extension). */
export function openAppForNode(node: VfsNode): AppId | undefined {
  return node.openApp ?? associate(node.name).openApp
}
