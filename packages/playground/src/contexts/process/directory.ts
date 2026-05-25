import type { AppIcon, ProcessDirectoryEntry } from './types'
import { lazy } from 'react'

export const DEFAULT_ICON: AppIcon = {
  sm: '/icons/windows98-icons/png/program_manager-0.png',
  lg: '/icons/windows98-icons/png/program_manager-0.png',
}

/**
 * Unified app directory — static registry of all launchable windows.
 *
 * Each entry defines what an app *is* (component, title, icon, etc.).
 * Running state is tracked separately in the ProcessProvider.
 *
 * Entries with `ephemeral: true` participate in z-index / focus but are
 * hidden from the taskbar's running-tasks list (e.g. system dialogs).
 */
const directory = {
  welcome: {
    name: 'Welcome!',
    Component: lazy(() =>
      import('../../directory/apps/welcome').then(m => ({ default: m.Welcome })),
    ),
    defaultTitle: 'Welcome!',
    icon: { sm: '/icons/windows98-icons/png/user_computer-0.png', lg: '/icons/windows98-icons/png/user_computer-1.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 520, height: 420 },
    defaultPosition: { top: '10%', left: '10%' },
    window: { contentClassName: 'p-0' },
  },
  docs: {
    name: 'Murasaki UI Library Docs',
    defaultTitle: 'Murasaki UI Library Docs - Microsoft Internet Explorer',
    icon: { sm: '/icons/windows98-icons/png/msie2-3.png', lg: '/icons/windows98-icons/png/msie2-0.png' },
    singleton: true,
    showOnDesktop: true,
    shortcut: true,
    defaultSize: { width: 750 },
    defaultPosition: { top: '10%', left: '3.75rem' },
    window: { type: 'iframe', src: '/programs/docs/index.html', chrome: 'ie2', className: 'h-[90%]' },
  },
  notepad: {
    name: 'Notepad',
    Component: lazy(() =>
      import('../../directory/apps/notepad').then(m => ({ default: m.Notepad })),
    ),
    defaultTitle: 'Untitled - Notepad',
    icon: { sm: '/icons/windows98-icons/png/notepad-0.png', lg: '/icons/windows98-icons/png/notepad-1.png' },
    singleton: false,
    showOnDesktop: true,
    defaultSize: { width: 400, height: 300 },
    defaultPosition: { top: '15%', left: '20%' },
    window: { contentClassName: 'p-1' },
  },
  displayproperties: {
    name: 'Display Properties',
    Component: lazy(() =>
      import('../../directory/system/display-properties/display-properties').then(m => ({ default: m.DisplayProperties })),
    ),
    defaultTitle: 'Display Properties',
    icon: { sm: '/icons/windows98-icons/png/display_properties-0.png', lg: '/icons/windows98-icons/png/display_properties-2.png' },
    singleton: true,
    ephemeral: true,
    defaultSize: { width: 420 },
    defaultPosition: { top: '12%', left: '25%' },
    window: { disableMaximize: true, disableMinimize: true, disableResize: true, contentClassName: 'p-2' },
  },
  settings: {
    name: 'Settings',
    Component: lazy(() =>
      import('../../directory/system/settings/settings').then(m => ({ default: m.Settings })),
    ),
    defaultTitle: 'Settings',
    icon: { sm: '/icons/windows98-icons/png/settings_gear-1.png', lg: '/icons/windows98-icons/png/directory_control_panel-1.png' },
    singleton: true,
    defaultSize: { width: 398, height: 520 },
    defaultPosition: { top: '8%', left: '22%' },
    window: { disableMaximize: true, disableResize: true, contentClassName: 'p-2' },
  },
  jspaint: {
    name: 'JSPaint',
    defaultTitle: 'JSPaint',
    icon: { sm: '/icons/windows98-icons/png/paint_old-1.png', lg: '/icons/windows98-icons/png/paint_old-0.png' },
    singleton: false,
    showOnDesktop: true,
    defaultSize: { width: 900, height: 650 },
    defaultPosition: { top: '5%', left: '5%' },
    window: { type: 'iframe', src: '/programs/jspaint/index.html' },
  },
  themedesigner: {
    name: 'Theme Designer',
    Component: lazy(() =>
      import('../../directory/apps/theme-designer/theme-designer').then(m => ({ default: m.ThemeDesigner })),
    ),
    defaultTitle: 'Windows Classic Theme Designer',
    icon: { sm: '/icons/windows98-icons/png/themes-1.png', lg: '/icons/windows98-icons/png/themes-0.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 720, height: 584 },
    defaultPosition: { top: '8%', left: '12%' },
    window: { disableMaximize: true, disableResize: true },
  },
  mediaplayer: {
    name: 'Media Player',
    Component: lazy(() =>
      import('../../directory/apps/media-player/media-player').then(m => ({ default: m.MediaPlayer })),
    ),
    defaultTitle: 'Media Player',
    icon: { sm: '/icons/windows98-icons/png/media_player-1.png', lg: '/icons/windows98-icons/png/media_player-0.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 640, height: 480 },
    defaultPosition: { top: '15%', left: '25%' },
  },
  outlookexpress: {
    name: 'Outlook Express',
    Component: lazy(() =>
      import('../../directory/apps/outlook-express').then(m => ({ default: m.OutlookExpress })),
    ),
    defaultTitle: 'Untitled - Outlook Express',
    icon: { sm: '/icons/windows98-icons/png/outlook_express-2.png', lg: '/icons/windows98-icons/png/outlook_express-2.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 560, height: 480 },
    defaultPosition: { top: '15%', left: '25%' },
    window: { contentClassName: 'p-0' },
  },
  webamp: {
    name: 'Webamp',
    Component: lazy(() =>
      import('../../directory/apps/webamp/webamp').then(m => ({ default: m.WebampApp })),
    ),
    defaultTitle: 'Webamp',
    icon: { sm: '/icons/desktop/Webamp16.png', lg: '/icons/desktop/Webamp.png' },
    singleton: true,
    showOnDesktop: true,
    window: { type: 'none' },
  },
} satisfies Record<string, ProcessDirectoryEntry>

export type AppId = keyof typeof directory

/**
 * Type-safe constants for app IDs — use these instead of string literals.
 *
 * @example
 * ```ts
 * open(APP_ID.NOTEPAD)
 * open(APP_ID.DISPLAY_PROPERTIES)
 * ```
 */
export const APP_ID = {
  WELCOME: 'welcome',
  DOCS: 'docs',
  NOTEPAD: 'notepad',
  DISPLAY_PROPERTIES: 'displayproperties',
  SETTINGS: 'settings',
  JSPaintApp: 'jspaint',
  THEME_DESIGNER: 'themedesigner',
  MEDIA_PLAYER: 'mediaplayer',
  OUTLOOK_EXPRESS: 'outlookexpress',
  WEBAMP: 'webamp',
} as const satisfies Record<string, AppId>

export function getStartupAppIds(): AppId[] {
  return Object.entries(directory as Record<AppId, ProcessDirectoryEntry>)
    .filter(([, entry]) => entry.autoOpenOnStartup)
    .map(([appId]) => appId as AppId)
}

export default directory as Record<AppId, ProcessDirectoryEntry>
