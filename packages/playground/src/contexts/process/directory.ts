import type { ComponentType } from 'react'
import type { AppIcon, ProcessComponentProps, ProcessDirectoryEntry, StartMenuFolder } from './types'
import { lazy } from 'react'
import { ICON } from '../../lib/icons'

export const DEFAULT_ICON: AppIcon = ICON.programManager

/**
 * Declare a lazily-loaded system app. Returns the `lazy` component used to
 * render the window plus the raw `preload` loader the shell warms in the
 * background after boot, so the window opens instantly instead of showing an
 * in-window loading state. External apps (iframes, remote bundles) omit this.
 */
type AppModuleLoader = () => Promise<{ default: ComponentType<ProcessComponentProps> }>
function lazyApp(load: AppModuleLoader): { Component: ComponentType<ProcessComponentProps>, preload: AppModuleLoader } {
  return { Component: lazy(load), preload: load }
}

/**
 * Unified app directory — the "installer manifest" for every launchable window.
 *
 * Each entry declares what an app *is* (component, title, icon) and where it is
 * "installed": `showOnDesktop` drops a desktop icon, `startMenu` files a
 * Start-menu shortcut, and `quickLaunch` pins a taskbar button. The desktop,
 * Start menu, and taskbar all *derive* their contents from this one registry
 * (see the selectors below), so adding an app here makes it appear everywhere
 * automatically — no per-surface wiring.
 *
 * Running state is tracked separately in the ProcessProvider. Entries with
 * `ephemeral: true` participate in z-index / focus but are hidden from the
 * taskbar's running-tasks list (e.g. system dialogs).
 */
const directory = {
  welcome: {
    name: 'Welcome!',
    ...lazyApp(() =>
      import('../../directory/apps/welcome').then(m => ({ default: m.Welcome })),
    ),
    defaultTitle: 'Welcome!',
    icon: ICON.murasaki,
    singleton: true,
    showOnDesktop: true,
    startMenu: { folder: 'programs', order: 20 },
    quickLaunch: { order: 30, alt: 'Welcome' },
    defaultSize: { width: 520, height: 420 },
    defaultPosition: { top: '10%', left: '10%' },
    window: { contentClassName: 'p-0' },
  },
  docs: {
    name: 'Murasaki UI Library Docs',
    defaultTitle: 'Murasaki UI Library Docs - Microsoft Internet Explorer',
    icon: ICON.internetExplorer,
    singleton: true,
    showOnDesktop: true,
    shortcut: true,
    defaultSize: { width: 750 },
    defaultPosition: { top: '10%', left: '3.75rem' },
    window: { type: 'iframe', src: '/programs/docs/index.html', chrome: 'ie2', className: 'h-[90%]' },
  },
  notepad: {
    name: 'Notepad',
    ...lazyApp(() =>
      import('../../directory/apps/notepad').then(m => ({ default: m.Notepad })),
    ),
    defaultTitle: 'Untitled - Notepad',
    icon: ICON.notepad,
    singleton: false,
    showOnDesktop: true,
    startMenu: { folder: 'accessories', order: 10 },
    defaultSize: { width: 400, height: 300 },
    defaultPosition: { top: '15%', left: '20%' },
    window: { contentClassName: 'p-0' },
  },
  displayproperties: {
    name: 'Display Properties',
    ...lazyApp(() =>
      import('../../directory/system/display-properties/display-properties').then(m => ({ default: m.DisplayProperties })),
    ),
    defaultTitle: 'Display Properties',
    icon: ICON.displaySettings,
    singleton: true,
    ephemeral: true,
    defaultSize: { width: 420, height: 560 },
    defaultPosition: { top: '12%', left: '25%' },
    window: { disableMaximize: true, disableMinimize: true, disableResize: true, contentClassName: 'p-2' },
  },
  settings: {
    name: 'Settings',
    ...lazyApp(() =>
      import('../../directory/system/settings/settings').then(m => ({ default: m.Settings })),
    ),
    defaultTitle: 'Settings',
    icon: ICON.settings,
    singleton: true,
    startMenu: { folder: 'settings', order: 10, label: 'Control Panel' },
    defaultSize: { width: 398, height: 520 },
    defaultPosition: { top: '8%', left: '22%' },
    window: { disableMaximize: true, disableResize: true, contentClassName: 'p-2' },
  },
  mouseproperties: {
    name: 'Mouse Properties',
    ...lazyApp(() =>
      import('../../directory/system/mouse-properties/mouse-properties').then(m => ({ default: m.MouseProperties })),
    ),
    defaultTitle: 'Mouse Properties',
    icon: ICON.mouse,
    singleton: true,
    startMenu: { folder: 'settings', order: 20, label: 'Mouse…' },
    defaultSize: { width: 400, height: 464 },
    defaultPosition: { top: '10%', left: '28%' },
    window: { disableMaximize: true, disableResize: true, contentClassName: 'p-2' },
  },
  jspaint: {
    name: 'JSPaint',
    defaultTitle: 'JSPaint',
    icon: ICON.paint,
    singleton: false,
    showOnDesktop: true,
    defaultSize: { width: 900, height: 650 },
    defaultPosition: { top: '5%', left: '5%' },
    window: { type: 'iframe', src: '/programs/jspaint/index.html' },
  },
  themedesigner: {
    name: 'Theme Designer',
    ...lazyApp(() =>
      import('../../directory/apps/theme-designer/theme-designer').then(m => ({ default: m.ThemeDesigner })),
    ),
    defaultTitle: 'Windows Classic Theme Designer',
    icon: ICON.themes,
    singleton: true,
    showOnDesktop: true,
    startMenu: { folder: 'programs', order: 50 },
    defaultSize: { width: 720, height: 584 },
    defaultPosition: { top: '8%', left: '12%' },
    window: { disableMaximize: true, disableResize: true },
  },
  mediaplayer: {
    name: 'Media Player',
    ...lazyApp(() =>
      import('../../directory/apps/media-player/media-player').then(m => ({ default: m.MediaPlayer })),
    ),
    defaultTitle: 'Media Player',
    icon: ICON.mediaPlayer,
    singleton: true,
    showOnDesktop: true,
    startMenu: { folder: 'programs', order: 30 },
    defaultSize: { width: 640, height: 480 },
    defaultPosition: { top: '15%', left: '25%' },
  },
  outlookexpress: {
    name: 'Outlook Express',
    ...lazyApp(() =>
      import('../../directory/apps/outlook-express').then(m => ({ default: m.OutlookExpress })),
    ),
    defaultTitle: 'Untitled - Outlook Express',
    icon: ICON.outlookExpress,
    singleton: true,
    showOnDesktop: true,
    quickLaunch: { order: 10, alt: 'Email Me' },
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
    icon: ICON.webamp,
    singleton: true,
    showOnDesktop: true,
    startMenu: { folder: 'programs', order: 40 },
    window: { type: 'none' },
  },
  internetexplorer: {
    name: 'Internet Explorer',
    ...lazyApp(() =>
      import('../../directory/apps/internet-explorer/internet-explorer').then(m => ({ default: m.InternetExplorer })),
    ),
    defaultTitle: 'Microsoft Internet Explorer',
    icon: ICON.internetExplorer,
    singleton: true,
    startMenu: { folder: 'programs', order: 10 },
    quickLaunch: { order: 20, alt: 'Internet' },
    defaultSize: { width: 900, height: 620 },
    defaultPosition: { top: '5%', left: '5%' },
    window: { type: 'none' },
  },
  mydocuments: {
    name: 'My Documents',
    ...lazyApp(() =>
      import('../../directory/apps/my-documents/my-documents').then(m => ({ default: m.MyDocuments })),
    ),
    defaultTitle: 'My Documents',
    icon: ICON.folderMyDocs,
    singleton: true,
    showOnDesktop: true,
    startMenu: { folder: 'documents', order: 10 },
    defaultSize: { width: 640, height: 460 },
    defaultPosition: { top: '10%', left: '15%' },
    window: { contentClassName: 'p-0' },
  },
  imageviewer: {
    name: 'Image Viewer',
    ...lazyApp(() =>
      import('../../directory/apps/image-viewer/image-viewer').then(m => ({ default: m.ImageViewer })),
    ),
    defaultTitle: 'Image Viewer',
    icon: ICON.imageFile,
    singleton: false,
    startMenu: { folder: 'accessories', order: 20 },
    defaultSize: { width: 560, height: 460 },
    defaultPosition: { top: '10%', left: '18%' },
    window: { contentClassName: 'p-0' },
  },
  pdfviewer: {
    name: 'PDF Viewer',
    ...lazyApp(() =>
      import('../../directory/apps/pdf-viewer/pdf-viewer').then(m => ({ default: m.PdfViewer })),
    ),
    defaultTitle: 'PDF Viewer',
    icon: ICON.documentFile,
    singleton: false,
    defaultSize: { width: 640, height: 720 },
    defaultPosition: { top: '5%', left: '20%' },
    window: { contentClassName: 'p-0' },
  },
  taskbarproperties: {
    name: 'Taskbar Properties',
    ...lazyApp(() =>
      import('../../directory/system/taskbar-properties/taskbar-properties').then(m => ({ default: m.TaskbarProperties })),
    ),
    defaultTitle: 'Taskbar Properties',
    icon: ICON.taskbar,
    singleton: true,
    ephemeral: true,
    startMenu: { folder: 'settings', order: 30, label: 'Taskbar…' },
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
  IMAGE_VIEWER: 'imageviewer',
  PDF_VIEWER: 'pdfviewer',
  TASKBAR_PROPERTIES: 'taskbarproperties',
} as const satisfies Record<string, AppId>

export function getStartupAppIds(): AppId[] {
  return Object.entries(directory as Record<AppId, ProcessDirectoryEntry>)
    .filter(([, entry]) => entry.autoOpenOnStartup)
    .map(([appId]) => appId as AppId)
}

// ---------------------------------------------------------------------------
// Derived shell surfaces — the desktop, Start menu, and taskbar read these
// selectors instead of maintaining their own hand-written app lists.
// ---------------------------------------------------------------------------

const entries = Object.entries(directory) as [AppId, ProcessDirectoryEntry][]

/**
 * Loaders for every system app's lazy chunk. The shell warms these in the
 * background once the desktop is up so system windows open instantly.
 */
export function getSystemAppChunkLoaders(): Array<() => Promise<unknown>> {
  return entries
    .filter(([, entry]) => entry.preload != null)
    .map(([, entry]) => entry.preload as () => Promise<unknown>)
}

const warmedAppChunks = new Set<string>()

/**
 * Warm a single app's lazy chunk on user intent (hovering / focusing a
 * launcher), so the window opens instantly if the user then clicks. Deduped so
 * repeated hovers don't refetch; a failure clears the flag so a later hover can
 * retry. Apps without a `preload` loader (iframes, remote bundles) are no-ops.
 */
export function preloadApp(appId: AppId | (string & {})): void {
  if (warmedAppChunks.has(appId))
    return
  const load = directory[appId as AppId]?.preload
  if (!load)
    return
  warmedAppChunks.add(appId)
  void load().catch(() => {
    warmedAppChunks.delete(appId)
  })
}

export interface DesktopAppItem {
  appId: AppId
  label: string
  icon: AppIcon
}

/** Apps that place an icon on the desktop, in registry order. */
export function getDesktopApps(): DesktopAppItem[] {
  return entries
    .filter(([, entry]) => entry.showOnDesktop)
    .map(([appId, entry]) => ({ appId, label: entry.name, icon: entry.icon }))
}

export interface StartMenuAppItem {
  appId: AppId
  label: string
  icon: AppIcon
}

/** Apps whose Start-menu shortcut is installed into `folder`, sorted by order. */
export function getStartMenuApps(folder: StartMenuFolder): StartMenuAppItem[] {
  return entries
    .filter(([, entry]) => entry.startMenu?.folder === folder)
    .sort(([, a], [, b]) => (a.startMenu?.order ?? 0) - (b.startMenu?.order ?? 0))
    .map(([appId, entry]) => ({ appId, label: entry.startMenu?.label ?? entry.name, icon: entry.icon }))
}

export interface QuickLaunchAppItem {
  appId: AppId
  title: string
  alt: string
  icon: AppIcon
}

/** Apps pinned to the Quick Launch strip, sorted by order. */
export function getQuickLaunchApps(): QuickLaunchAppItem[] {
  return entries
    .filter(([, entry]) => entry.quickLaunch != null)
    .sort(([, a], [, b]) => (a.quickLaunch?.order ?? 0) - (b.quickLaunch?.order ?? 0))
    .map(([appId, entry]) => {
      const title = entry.quickLaunch?.title ?? entry.name
      return { appId, title, alt: entry.quickLaunch?.alt ?? title, icon: entry.icon }
    })
}

export default directory as Record<AppId, ProcessDirectoryEntry>
