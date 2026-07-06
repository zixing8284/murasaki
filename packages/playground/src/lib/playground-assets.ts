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
export const DESKTOP_MEDIA_ICON = '/icons/windows98-icons/png/directory_open_file_mydocs-0.png'

// ---------------------------------------------------------------------------
// Start menu icons
// ---------------------------------------------------------------------------

export const START_MENU_ICONS = {
  windowsUpdate: '/icons/windows98-icons/png/windows_update_small-0.png',
  programs: '/icons/windows98-icons/png/file_program_group-1.png',
  documents: '/icons/windows98-icons/png/directory_open_file_mydocs-2.png',
  settings: '/icons/windows98-icons/png/settings_gear-1.png',
  find: '/icons/windows98-icons/png/search_file-2.png',
  help: '/icons/windows98-icons/png/help_book_small-1.png',
  run: '/icons/windows98-icons/png/console_prompt-1.png',
  logOff: '/icons/windows98-icons/png/users_key-1.png',
  shutDown: '/icons/windows98-icons/png/shut_down_normal-1.png',
  // programs submenu
  accessories: '/icons/windows98-icons/png/file_program_group-1.png',
  notepad: '/icons/windows98-icons/png/notepad-0.png',
  calculator: '/icons/windows98-icons/png/calculator-1.png',
  paint: '/icons/windows98-icons/png/paint_old-1.png',
  internetExplorer: '/icons/windows98-icons/png/msie2-3.png',
  welcome: '/icons/windows98-icons/png/user_computer-1.png',
  mediaPlayer: '/icons/windows98-icons/png/media_player-1.png',
  webamp: '/icons/desktop/Webamp16.png',
  themeDesigner: '/icons/windows98-icons/png/themes-1.png',
  // settings submenu
  controlPanel: '/icons/windows98-icons/png/directory_control_panel-1.png',
  printers: '/icons/windows98-icons/png/printer-1.png',
  taskbar: '/icons/windows98-icons/png/start_menu_shortcuts.png',
  // find submenu
  findFiles: '/icons/windows98-icons/png/search_file-2.png',
  findComputer: '/icons/windows98-icons/png/search_computer-1.png',
  findWeb: '/icons/windows98-icons/png/search_web-1.png',
} as const

// ---------------------------------------------------------------------------
// Taskbar
// ---------------------------------------------------------------------------

export const TASKBAR_QUICK_LAUNCH_ICONS = [
  '/icons/windows98-icons/png/desktop-3.png',
  '/icons/windows98-icons/png/outlook_express-2.png',
  '/icons/windows98-icons/png/msie2-3.png',
  '/icons/windows98-icons/png/user_computer-0.png',
] as const

export const NETWORK_ONLINE_ICONS = [
  '/icons/windows98-icons/png/conn_pcs_on_off.png',
  '/icons/windows98-icons/png/conn_pcs_off_on.png',
  '/icons/windows98-icons/png/conn_pcs_on_on.png',
] as const

export const NETWORK_OFFLINE_ICON = '/icons/windows98-icons/png/conn_pcs_no_network.png'

export const VOLUME_ICON = '/icons/windows98-icons/png/loudspeaker_rays-1.png'
export const VOLUME_MUTED_ICON = '/icons/windows98-icons/png/loudspeaker_muted-1.png'

// ---------------------------------------------------------------------------
// Internet Explorer toolbar
// ---------------------------------------------------------------------------

export const IE_TOOLBAR_ICONS = {
  favorites: '/icons/windows98-icons/png/directory_favorites-1.png',
  home: '/icons/windows98-icons/png/homepage-1.png',
  html: '/icons/windows98-icons/png/html-0.png',
  mail: '/icons/windows98-icons/png/mailbox_world-1.png',
  print: '/icons/windows98-icons/png/printer-1.png',
  refresh: '/icons/windows98-icons/png/overlay_refresh-1.png',
  search: '/icons/windows98-icons/png/search_web-1.png',
  stop: '/icons/windows98-icons/png/no-0.png',
  windows: '/icons/windows98-icons/png/windows-4.png',
} as const

// ---------------------------------------------------------------------------
// Misc preview / app surfaces
// ---------------------------------------------------------------------------

export const PREVIEW_TASKBAR_LOGO = '/icons/windows98-icons/png/windows-4.png'
export const THEME_PREVIEW_RECYCLE_BIN = '/icons/windows98-icons/png/recycle_bin_empty-0.png'
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
  '/icons/misc/cursor.png',
  '/icons/windows98-icons/png/paint_file-0.png',
  '/icons/misc/network.png',
  '/icons/misc/smiley.png',
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
