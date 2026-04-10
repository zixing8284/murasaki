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
  },
  docs: {
    name: 'Component Docs',
    Component: lazy(() =>
      import('../../directory/apps/docs/docs-app').then(m => ({ default: m.DocsApp })),
    ),
    defaultTitle: 'Component Docs',
    icon: { sm: '/img/desktop/MyComputer.png', lg: '/img/desktop/MyComputer.png' },
    singleton: true,
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
} as const satisfies Record<string, AppId>

export default directory as Record<AppId, ProcessDirectoryEntry>
