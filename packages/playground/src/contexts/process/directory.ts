import type { AppIcon, ProcessDirectoryEntry } from './types'
import { lazy } from 'react'

export const DEFAULT_ICON: AppIcon = {
  sm: '/icons/windows98-icons/ico/program_manager.ico',
  lg: '/icons/windows98-icons/ico/program_manager.ico',
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
  mycomputer: {
    name: 'My Computer',
    Component: lazy(() =>
      import('../../directory/apps/my-computer').then(m => ({ default: m.MyComputer })),
    ),
    defaultTitle: 'My Computer',
    icon: { sm: '/icons/windows98-icons/ico/computer.ico', lg: '/icons/windows98-icons/ico/computer.ico' },
    singleton: true,
    defaultSize: { width: 520 },
    defaultPosition: { top: '10%', left: '10%' },
    window: { contentClassName: 'p-2' },
  },
  docs: {
    name: 'Murasaki UI Library Docs',
    defaultTitle: 'Murasaki UI Library Docs - Microsoft Internet Explorer',
    icon: { sm: '/icons/windows98-icons/ico/msie2.ico', lg: '/icons/windows98-icons/ico/msie2.ico' },
    singleton: true,
    showOnDesktop: true,
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
    icon: { sm: '/icons/windows98-icons/ico/notepad.ico', lg: '/icons/windows98-icons/ico/notepad.ico' },
    singleton: false,
    showOnDesktop: true,
    defaultSize: { width: 400, height: 300 },
    defaultPosition: { top: '15%', left: '20%' },
  },
  displayproperties: {
    name: 'Display Properties',
    Component: lazy(() =>
      import('../../directory/system/display-properties/display-properties').then(m => ({ default: m.DisplayProperties })),
    ),
    defaultTitle: 'Display Properties',
    icon: { sm: '/icons/windows98-icons/ico/display_properties.ico', lg: '/icons/windows98-icons/ico/display_properties.ico' },
    singleton: true,
    ephemeral: true,
    defaultSize: { width: 420 },
    defaultPosition: { top: '12%', left: '25%' },
    window: { disableMaximize: true, disableMinimize: true, disableResize: true },
  },
  jspaint: {
    name: 'JSPaint',
    defaultTitle: 'JSPaint',
    icon: { sm: '/icons/windows98-icons/ico/paint.ico', lg: '/icons/windows98-icons/ico/paint.ico' },
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
    icon: { sm: '/icons/windows98-icons/ico/themes.ico', lg: '/icons/windows98-icons/ico/themes.ico' },
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
    icon: { sm: '/icons/windows98-icons/ico/media_player.ico', lg: '/icons/windows98-icons/ico/media_player.ico' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 640, height: 480 },
    defaultPosition: { top: '15%', left: '25%' },
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
  MY_COMPUTER: 'mycomputer',
  DOCS: 'docs',
  NOTEPAD: 'notepad',
  DISPLAY_PROPERTIES: 'displayproperties',
  JSPaintApp: 'jspaint',
  THEME_DESIGNER: 'themedesigner',
  MEDIA_PLAYER: 'mediaplayer',
  WEBAMP: 'webamp',
} as const satisfies Record<string, AppId>

export default directory as Record<AppId, ProcessDirectoryEntry>
