/**
 * Cursor scheme registry.
 *
 * Mirrors the Windows Mouse Properties "Pointers" scheme selector. Each scheme
 * maps a set of named pointers to `.cur` assets under a base path. The active
 * scheme is applied desktop-wide by toggling `data-cursor-scheme` on `<html>`;
 * `style.css` remaps every `--cursor-*` token for the non-default scheme.
 *
 * Pointer file names are shared across schemes — only `basePath` differs — so
 * the two sets stay in lock-step and the `.cur` assets can be dropped in by
 * name (see `public/cursor/` and `public/cursor/3d/`).
 */

export const CURSOR_SCHEME_IDS = ['windows-standard', 'windows-3d'] as const

export type CursorSchemeId = (typeof CURSOR_SCHEME_IDS)[number]

export interface CursorPointerDef {
  /** Windows pointer role label shown in the Mouse Properties list. */
  label: string
  /** `.cur` file name, shared by every scheme. */
  file: string
}

export interface CursorSchemeDef {
  id: CursorSchemeId
  name: string
  /** Public-root path holding this scheme's `.cur` files. */
  basePath: string
  pointers: readonly CursorPointerDef[]
}

/** Ordered to match the Windows Standard pointer list. */
const POINTERS: readonly CursorPointerDef[] = [
  { label: 'Normal Select', file: 'normal.cur' },
  { label: 'Help Select', file: 'help.cur' },
  { label: 'Working In Background', file: 'working.cur' },
  { label: 'Busy', file: 'busy.cur' },
  { label: 'Precision Select', file: 'precision.cur' },
  { label: 'Text Select', file: 'text.cur' },
  { label: 'Handwriting', file: 'handwriting.cur' },
  { label: 'Unavailable', file: 'not-allowed.cur' },
  { label: 'Vertical Resize', file: 'ns-resize.cur' },
  { label: 'Horizontal Resize', file: 'ew-resize.cur' },
  { label: 'Diagonal Resize 1', file: 'nwse-resize.cur' },
  { label: 'Diagonal Resize 2', file: 'nesw-resize.cur' },
  { label: 'Move', file: 'move.cur' },
  { label: 'Alternate Select', file: 'alternate.cur' },
  { label: 'Link Select', file: 'link.cur' },
]

export const CURSOR_SCHEMES: Record<CursorSchemeId, CursorSchemeDef> = {
  'windows-standard': {
    id: 'windows-standard',
    name: 'Windows Standard',
    basePath: '/cursor',
    pointers: POINTERS,
  },
  'windows-3d': {
    id: 'windows-3d',
    name: 'Windows 3D',
    basePath: '/cursor/3d',
    pointers: POINTERS,
  },
}

export const DEFAULT_CURSOR_SCHEME_ID: CursorSchemeId = 'windows-standard'

export function isCursorSchemeId(value: unknown): value is CursorSchemeId {
  return typeof value === 'string' && (CURSOR_SCHEME_IDS as readonly string[]).includes(value)
}

/** Public-root path to a pointer's `.cur` file within a scheme. */
export function cursorPointerPath(scheme: CursorSchemeDef, pointer: CursorPointerDef): string {
  return `${scheme.basePath}/${pointer.file}`
}
