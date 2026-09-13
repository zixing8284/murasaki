import { getAllIconPaths } from '../../lib/icons'
import {
  DESKTOP_WALLPAPER_IMAGE,
  IE_TOOLBAR_ICONS,
  NETWORK_OFFLINE_ICON,
  NETWORK_ONLINE_ICONS,
  PREVIEW_TASKBAR_LOGO,
  SYSTEM_CURSORS,
  uniquePaths,
  WARM_IMAGE_ASSETS,
} from '../../lib/playground-assets'

/**
 * The smallest set of assets that must be in cache before showing the
 * desktop. Keeps first paint feeling instant for the start menu, taskbar
 * tray and desktop icons. Heavy program payloads (docs iframe, JSPaint,
 * Webamp bundles) are intentionally excluded.
 *
 * The full icon catalog (app, Start-menu, taskbar, and filesystem icons) is
 * warmed via `getAllIconPaths()`, so newly-registered icons are preloaded
 * automatically without touching this list.
 */
export function getCriticalAssetPaths(): string[] {
  return uniquePaths([
    DESKTOP_WALLPAPER_IMAGE,
    ...getAllIconPaths(),
    PREVIEW_TASKBAR_LOGO,
    ...NETWORK_ONLINE_ICONS,
    NETWORK_OFFLINE_ICON,
    ...Object.values(IE_TOOLBAR_ICONS),
    ...SYSTEM_CURSORS,
  ])
}

/** Non-blocking second tier — fetched after the desktop becomes interactive. */
export function getWarmAssetPaths(): string[] {
  return uniquePaths([...WARM_IMAGE_ASSETS])
}
