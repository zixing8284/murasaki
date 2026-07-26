/**
 * Central registry of playground static assets.
 *
 * All `/icons/...` and `/wallpaper/...` paths shared across the shell live here
 * so:
 *   - One source of truth feeds both the components that render the icon
 *     and the startup preloader that warms them.
 *   - The build-time `playground-assets.json` manifest can group these
 *     paths into "critical" (needed for first paint of the desktop /
 *     start menu) and "warm" (background prefetch for window content).
 *
 * Paths are public-root absolute (start with `/`). Resolve them through
 * `assetPath()` before assigning to `src` so subpath deployments
 * (e.g. GitHub Pages `/murasaki/`) work.
 */

/** Public manifest path emitted by the build-time Vite plugin. */
export const ASSET_MANIFEST_PUBLIC_PATH = '/playground-assets.json'

// ---------------------------------------------------------------------------
// Desktop / wallpaper
// ---------------------------------------------------------------------------

export const DESKTOP_WALLPAPER_IMAGE = '/wallpaper/animspace.gif'
export const DESKTOP_MEDIA_ICON = '/icons/folder-my-docs-32.png'

// ---------------------------------------------------------------------------
// Start menu icons
// ---------------------------------------------------------------------------

export const START_MENU_ICONS = {
  windowsUpdate: '/icons/windows-update-16.png',
  programs: '/icons/program-group-16.png',
  documents: '/icons/folder-my-docs-16.png',
  settings: '/icons/settings-16.png',
  find: '/icons/search-file-16.png',
  help: '/icons/help-16.png',
  run: '/icons/console-prompt-16.png',
  logOff: '/icons/log-off-16.png',
  shutDown: '/icons/shut-down-16.png',
  // programs submenu
  accessories: '/icons/program-group-16.png',
  notepad: '/icons/notepad-16.png',
  calculator: '/icons/calculator-16.png',
  paint: '/icons/paint-16.png',
  internetExplorer: '/icons/internet-explorer-16.png',
  welcome: '/icons/my-computer-32.png',
  mediaPlayer: '/icons/media-player-16.png',
  webamp: '/icons/webamp-16.png',
  themeDesigner: '/icons/themes-16.png',
  // settings submenu
  controlPanel: '/icons/control-panel-16.png',
  printers: '/icons/printer-16.png',
  taskbar: '/icons/taskbar-32.png',
  // find submenu
  findFiles: '/icons/search-file-16.png',
  findComputer: '/icons/search-computer-16.png',
  findWeb: '/icons/search-web-16.png',
} as const

// ---------------------------------------------------------------------------
// Taskbar
// ---------------------------------------------------------------------------

export const TASKBAR_QUICK_LAUNCH_ICONS = [
  '/icons/desktop-16.png',
  '/icons/outlook-express-16.png',
  '/icons/internet-explorer-16.png',
  '/icons/my-computer-16.png',
] as const

export const NETWORK_ONLINE_ICONS = [
  '/icons/network-partial-on-off-16.png',
  '/icons/network-partial-off-on-16.png',
  '/icons/network-connected-16.png',
] as const

export const NETWORK_OFFLINE_ICON = '/icons/network-disconnected-16.png'

export const VOLUME_ICON = '/icons/volume-on-16.png'
export const VOLUME_MUTED_ICON = '/icons/volume-muted-16.png'

// ---------------------------------------------------------------------------
// Internet Explorer toolbar
// ---------------------------------------------------------------------------

export const IE_TOOLBAR_ICONS = {
  favorites: '/icons/favorites-16.png',
  home: '/icons/homepage-16.png',
  html: '/icons/html-file-16.png',
  mail: '/icons/mailbox-16.png',
  print: '/icons/printer-16.png',
  refresh: '/icons/refresh-20.png',
  search: '/icons/search-web-16.png',
  stop: '/icons/no-entry-16.png',
  windows: '/icons/windows-logo-16.png',
} as const

// ---------------------------------------------------------------------------
// Misc preview / app surfaces
// ---------------------------------------------------------------------------

export const PREVIEW_TASKBAR_LOGO = '/icons/windows-logo-16.png'
export const THEME_PREVIEW_RECYCLE_BIN = '/icons/recycle-bin-32.png'
export const MEDIA_PLAYER_EMPTY_BACKGROUND = '/icons/media/mediaplayer-bg.png'

// ---------------------------------------------------------------------------
// System cursors
// ---------------------------------------------------------------------------

export const SYSTEM_CURSORS = [
  '/cursor/normal.cur',
  '/cursor/busy.cur',
  '/cursor/working.cur',
  '/cursor/link.cur',
  '/cursor/help.cur',
] as const

/**
 * Larger / lower-priority images. Warmed in the background after the
 * desktop is interactive so first paint isn't blocked.
 */
export const WARM_IMAGE_ASSETS = [
  MEDIA_PLAYER_EMPTY_BACKGROUND,
  '/icons/cursor-12x21.png',
  '/icons/paint-file-16.png',
  '/icons/network-16.png',
  '/icons/smiley-16.png',
  '/wallpaper/water.gif',
] as const

/** De-duplicate while preserving insertion order. */
export function uniquePaths(paths: readonly (string | undefined | null)[]): string[] {
  const seen = new Set<string>()
  for (const path of paths) {
    if (path)
      seen.add(path)
  }
  return Array.from(seen)
}
