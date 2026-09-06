import type { AppIcon, ProcessDirectoryEntry } from './types'
import { lazy } from 'react'

export const DEFAULT_ICON: AppIcon = {
  sm: '/icons/program-manager-32.png',
  lg: '/icons/program-manager-32.png',
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
    icon: { sm: '/icons/my-computer-16.png', lg: '/icons/my-computer-32.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 520, height: 420 },
    defaultPosition: { top: '10%', left: '10%' },
    window: { contentClassName: 'p-0' },
  },
  docs: {
    name: 'Murasaki UI Library Docs',
    defaultTitle: 'Murasaki UI Library Docs - Microsoft Internet Explorer',
    icon: { sm: '/icons/internet-explorer-16.png', lg: '/icons/internet-explorer-32.png' },
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
    icon: { sm: '/icons/notepad-16.png', lg: '/icons/notepad-32.png' },
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
    icon: { sm: '/icons/display-settings-16.png', lg: '/icons/display-settings-32.png' },
    singleton: true,
    ephemeral: true,
    defaultSize: { width: 420, height: 560 },
    defaultPosition: { top: '12%', left: '25%' },
    window: { disableMaximize: true, disableMinimize: true, disableResize: true, contentClassName: 'p-2' },
  },
  settings: {
    name: 'Settings',
    Component: lazy(() =>
      import('../../directory/system/settings/settings').then(m => ({ default: m.Settings })),
    ),
    defaultTitle: 'Settings',
    icon: { sm: '/icons/settings-16.png', lg: '/icons/control-panel-16.png' },
    singleton: true,
    defaultSize: { width: 398, height: 520 },
    defaultPosition: { top: '8%', left: '22%' },
    window: { disableMaximize: true, disableResize: true, contentClassName: 'p-2' },
  },
  mouseproperties: {
    name: 'Mouse Properties',
    Component: lazy(() =>
      import('../../directory/system/mouse-properties/mouse-properties').then(m => ({ default: m.MouseProperties })),
    ),
    defaultTitle: 'Mouse Properties',
    icon: { sm: '/icons/mouse-16.png', lg: '/icons/mouse-32.png' },
    singleton: true,
    defaultSize: { width: 400, height: 464 },
    defaultPosition: { top: '10%', left: '28%' },
    window: { disableMaximize: true, disableResize: true, contentClassName: 'p-2' },
  },
  jspaint: {
    name: 'JSPaint',
    defaultTitle: 'JSPaint',
    icon: { sm: '/icons/paint-16.png', lg: '/icons/paint-32.png' },
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
    icon: { sm: '/icons/themes-16.png', lg: '/icons/themes-32.png' },
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
    icon: { sm: '/icons/media-player-16.png', lg: '/icons/media-player-32.png' },
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
    icon: { sm: '/icons/outlook-express-16.png', lg: '/icons/outlook-express-16.png' },
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
    icon: { sm: '/icons/webamp-16.png', lg: '/icons/webamp-32.png' },
    singleton: true,
    showOnDesktop: true,
    window: { type: 'none' },
  },
  internetexplorer: {
    name: 'Internet Explorer',
    Component: lazy(() =>
      import('../../directory/apps/internet-explorer/internet-explorer').then(m => ({ default: m.InternetExplorer })),
    ),
    defaultTitle: 'Microsoft Internet Explorer',
    icon: { sm: '/icons/internet-explorer-16.png', lg: '/icons/internet-explorer-32.png' },
    singleton: true,
    defaultSize: { width: 900, height: 620 },
    defaultPosition: { top: '5%', left: '5%' },
    window: { type: 'none' },
  },
  mydocuments: {
    name: 'My Documents',
    Component: lazy(() =>
      import('../../directory/apps/my-documents/my-documents').then(m => ({ default: m.MyDocuments })),
    ),
    defaultTitle: 'My Documents',
    icon: { sm: '/icons/folder-my-docs-16.png', lg: '/icons/folder-my-docs-32.png' },
    singleton: true,
    showOnDesktop: true,
    defaultSize: { width: 640, height: 460 },
    defaultPosition: { top: '10%', left: '15%' },
    window: { contentClassName: 'p-0' },
  },
  taskbarproperties: {
    name: 'Taskbar Properties',
    Component: lazy(() =>
      import('../../directory/system/taskbar-properties/taskbar-properties').then(m => ({ default: m.TaskbarProperties })),
    ),
    defaultTitle: 'Taskbar Properties',
    icon: { sm: '/icons/taskbar-16.png', lg: '/icons/taskbar-32.png' },
    singleton: true,
    ephemeral: true,
    defaultSize: { width: 360, height: 428 },
    defaultPosition: { top: '12%', left: '30%' },
    window: { disableMaximize: true, disableMinimize: true, disableResize: true, contentClassName: 'p-2' },
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
  MOUSE_PROPERTIES: 'mouseproperties',
  JSPaintApp: 'jspaint',
  THEME_DESIGNER: 'themedesigner',
  MEDIA_PLAYER: 'mediaplayer',
  OUTLOOK_EXPRESS: 'outlookexpress',
  WEBAMP: 'webamp',
  INTERNET_EXPLORER: 'internetexplorer',
  MY_DOCUMENTS: 'mydocuments',
  TASKBAR_PROPERTIES: 'taskbarproperties',
} as const satisfies Record<string, AppId>

export function getStartupAppIds(): AppId[] {
  return Object.entries(directory as Record<AppId, ProcessDirectoryEntry>)
    .filter(([, entry]) => entry.autoOpenOnStartup)
    .map(([appId]) => appId as AppId)
}

export default directory as Record<AppId, ProcessDirectoryEntry>
