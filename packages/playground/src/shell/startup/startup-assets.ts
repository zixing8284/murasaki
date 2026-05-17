import { appDirectory, DEFAULT_ICON } from '../../contexts/process'
import {
  DESKTOP_MEDIA_ICON,
  DESKTOP_WALLPAPER_IMAGE,
  IE_TOOLBAR_ICONS,
  NETWORK_OFFLINE_ICON,
  NETWORK_ONLINE_ICONS,
  PREVIEW_TASKBAR_LOGO,
  START_MENU_ICONS,
  TASKBAR_QUICK_LAUNCH_ICONS,
  THEME_PREVIEW_RECYCLE_BIN,
  uniquePaths,
  WARM_IMAGE_ASSETS,
} from '../../lib/playground-assets'

/**
 * App-icon paths (both sm + lg) drawn from the unified app directory.
 * Icons live in the start menu, taskbar, and desktop, so they belong in
 * the critical preload group.
 */
function getAppIconPaths(): string[] {
  return Object.values(appDirectory).flatMap(entry => [entry.icon.sm, entry.icon.lg])
}

/**
 * The smallest set of assets that must be in cache before showing the
 * desktop. Keeps first paint feeling instant for the start menu, taskbar
 * tray and desktop icons. Heavy program payloads (docs iframe, JSPaint,
 * Webamp bundles) are intentionally excluded.
 */
export function getCriticalAssetPaths(): string[] {
  return uniquePaths([
    DESKTOP_WALLPAPER_IMAGE,
    DESKTOP_MEDIA_ICON,
    DEFAULT_ICON.sm,
    DEFAULT_ICON.lg,
    PREVIEW_TASKBAR_LOGO,
    THEME_PREVIEW_RECYCLE_BIN,
    ...getAppIconPaths(),
    ...Object.values(START_MENU_ICONS),
    ...TASKBAR_QUICK_LAUNCH_ICONS,
    ...NETWORK_ONLINE_ICONS,
    NETWORK_OFFLINE_ICON,
    ...Object.values(IE_TOOLBAR_ICONS),
  ])
}

/** Non-blocking second tier — fetched after the desktop becomes interactive. */
export function getWarmAssetPaths(): string[] {
  return uniquePaths([...WARM_IMAGE_ASSETS])
}
