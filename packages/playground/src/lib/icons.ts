/**
 * Central icon catalog — the single source of truth for every shell icon path.
 *
 * Think of this as the system icon cache (like a Windows resource DLL): each
 * icon is registered once here under a semantic name, then referenced by the
 * app registry (`directory.ts`), the Start menu, the taskbar, the desktop, and
 * the virtual filesystem. Adding or re-skinning an icon happens in exactly one
 * place and every surface that shows it stays in sync.
 *
 * Paths are public-root absolute (start with `/`). Resolve them through
 * `assetPath()` before assigning to `src` so subpath deployments work.
 */

/** An icon with its 16px (menu / taskbar / title bar) and 32px (desktop) variant. */
export interface IconAsset {
  /** 16px variant. */
  sm: string
  /** 32px variant. Falls back to the 16px art when a 32px asset is unavailable. */
  lg: string
}

const ROOT = '/icons'

/** 16px-only icon — the same art is reused (pixel-doubled) at large sizes. */
function px16(name: string): IconAsset {
  const path = `${ROOT}/${name}-16.png`
  return { sm: path, lg: path }
}

/** 32px-only icon. */
function px32(name: string): IconAsset {
  const path = `${ROOT}/${name}-32.png`
  return { sm: path, lg: path }
}

/** Icon shipping distinct 16px and 32px art (`{name}-16.png` / `{name}-32.png`). */
function px16x32(name: string): IconAsset {
  return { sm: `${ROOT}/${name}-16.png`, lg: `${ROOT}/${name}-32.png` }
}

/** Icon whose small and large art live at explicit, non-matching paths. */
function custom(sm: string, lg: string): IconAsset {
  return { sm, lg }
}

export const ICON = {
  // --- Shell / apps ---------------------------------------------------------
  programManager: px32('program-manager'),
  murasaki: px16x32('murasaki'),
  myComputer: px16x32('my-computer'),
  internetExplorer: px16x32('internet-explorer'),
  notepad: px16x32('notepad'),
  displaySettings: px16x32('display-settings'),
  settings: custom(`${ROOT}/settings-16.png`, `${ROOT}/control-panel-16.png`),
  controlPanel: px16('control-panel'),
  mouse: px16x32('mouse'),
  paint: px16x32('paint'),
  themes: px16x32('themes'),
  mediaPlayer: px16x32('media-player'),
  outlookExpress: px16('outlook-express'),
  webamp: px16x32('webamp'),
  folderMyDocs: px16x32('folder-my-docs'),
  taskbar: px16('taskbar'),

  // --- Start menu decorative rows ------------------------------------------
  windowsUpdate: px16('windows-update'),
  programGroup: px16('program-group'),
  searchFile: px16('search-file'),
  searchComputer: px16('search-computer'),
  searchWeb: px16('search-web'),
  help: px16('help'),
  consolePrompt: px16('console-prompt'),
  logOff: px16('log-off'),
  shutDown: px16('shut-down'),
  calculator: px16('calculator'),
  printer: px16('printer'),
  windowsButton: px16('windows-button'),

  // --- Taskbar --------------------------------------------------------------
  showDesktop: px16('show-desktop'),

  // --- Virtual filesystem ---------------------------------------------------
  folderClosed: px16('folder-closed'),
  folderOpen: px16('folder-open'),
  downloadsFolder: px16('downloads-folder'),
  desktop: px16('desktop'),
  hardDrive: px16('hard-drive'),
  floppyDrive: px16('floppy-drive'),
  cdDrive: px16('cd-drive'),
  networkNeighborhood: px16('network-neighborhood'),
  recycleBin: px16x32('recycle-bin'),
  recycleBinFull: px16x32('recycle-bin-full'),
  textFile: px16('text-file'),
  documentFile: px16x32('document-file'),
  audioFile: px16x32('audio-file'),
  midiFile: px16('midi-file'),
  imageFile: px16x32('image-file'),
  htmlFile: px16('html-file'),
} satisfies Record<string, IconAsset>

export type IconName = keyof typeof ICON

/** Every registered icon path (both sizes), de-duplicated — used for preloading. */
export function getAllIconPaths(): string[] {
  const seen = new Set<string>()
  for (const asset of Object.values(ICON)) {
    seen.add(asset.sm)
    seen.add(asset.lg)
  }
  return Array.from(seen)
}
