import type { AppIcon, ProcessDirectoryEntry } from './types'
import { lazy } from 'react'

export const DEFAULT_ICON: AppIcon = {
  sm: '/img/desktop/ProgMan.png',
  lg: '/img/desktop/ProgMan.png',
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
    icon: { sm: '/img/desktop/MyComputer.png', lg: '/img/desktop/MyComputer.png' },
    singleton: true,
    defaultSize: { width: 520 },
  },
  docs: {
    name: 'Murasaki UI Library Docs',
    Component: lazy(() =>
      import('../../directory/apps/docs/docs').then(m => ({ default: m.DocsApp })),
    ),
    defaultTitle: 'Murasaki UI Library Docs',
    icon: { sm: '/img/desktop/MyComputer.png', lg: '/img/desktop/MyComputer.png' },
    singleton: true,
    defaultSize: { width: 750 },
  },
  notepad: {
    name: 'Notepad',
    Component: lazy(() =>
      import('../../directory/apps/notepad').then(m => ({ default: m.Notepad })),
    ),
    defaultTitle: 'Untitled - Notepad',
    icon: { sm: '/img/desktop/Notepad.png', lg: '/img/desktop/Notepad.png' },
    singleton: false,
    showOnDesktop: true,
    defaultSize: { width: 400, height: 300 },
  },
  displayproperties: {
    name: 'Display Properties',
    Component: lazy(() =>
      import('../../directory/system/display-properties/display-properties').then(m => ({ default: m.DisplayProperties })),
    ),
    defaultTitle: 'Display Properties',
    icon: { sm: '/img/display_16.png', lg: '/img/display_16.png' },
    singleton: true,
    ephemeral: true,
    defaultSize: { width: 420 },
  },
  jspaint: {
    name: 'JSPaint',
    Component: lazy(() =>
      import('../../directory/apps/jspaint').then(m => ({ default: m.JspaintApp })),
    ),
    defaultTitle: 'JSPaint',
    icon: { sm: '/img/desktop/InternetExplorer.png', lg: '/img/desktop/InternetExplorer.png' },
    singleton: false,
    showOnDesktop: true,
    defaultSize: { width: 900, height: 650 },
  },
  themedesigner: {
    name: 'Theme Designer',
    Component: lazy(() =>
      import('../../directory/apps/theme-designer/theme-designer').then(m => ({ default: m.ThemeDesigner })),
    ),
    defaultTitle: 'Windows Classic Theme Designer',
    icon: { sm: '/img/display_16.png', lg: '/img/display_16.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 720, height: 584 },
  },
  mediaplayer: {
    name: 'Media Player',
    Component: lazy(() =>
      import('../../directory/apps/media-player/media-player').then(m => ({ default: m.MediaPlayer })),
    ),
    defaultTitle: 'Media Player',
    icon: { sm: '/img/desktop/ProgMan.png', lg: '/img/desktop/ProgMan.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 640, height: 480 },
  },
  webamp: {
    name: 'Webamp',
    Component: lazy(() =>
      import('../../directory/apps/webamp/webamp').then(m => ({ default: m.WebampApp })),
    ),
    defaultTitle: 'Webamp',
    icon: { sm: '/img/desktop/Webamp16.png', lg: '/img/desktop/Webamp.png' },
    singleton: true,
    showOnDesktop: true,
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
