import type { ComponentType } from 'react'
import type { AppId } from './directory'

// ---------------------------------------------------------------------------
// Process Directory — static definition of what an app *is*
// ---------------------------------------------------------------------------

export interface ProcessComponentProps {
  windowId: string
}

export interface AppIcon {
  /** Small icon path (16×16, used in taskbar / title bar) */
  sm: string
  /** Large icon path (32×32, used on desktop) */
  lg: string
}

export interface ProcessWindowPosition {
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
}

export interface ProcessBaseWindowConfig {
  /** Class applied to the framework-owned WindowContent wrapper */
  contentClassName?: string
  className?: string
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
}

export interface ProcessDefaultWindowConfig extends ProcessBaseWindowConfig {
  type?: 'default'
}

export interface ProcessIframeWindowConfig extends ProcessBaseWindowConfig {
  type: 'iframe'
  src: string
  chrome?: 'ie2'
}

export interface ProcessNoWindowConfig {
  type: 'none'
}

export type ProcessWindowConfig = ProcessDefaultWindowConfig | ProcessIframeWindowConfig | ProcessNoWindowConfig

/** Start-menu folders an app's shortcut can be installed into. */
export type StartMenuFolder = 'programs' | 'accessories' | 'documents' | 'settings'

/** Where and how an app installs a Start-menu shortcut. */
export interface StartMenuPlacement {
  /** Which Start-menu folder the shortcut lives in. */
  folder: StartMenuFolder
  /** Ascending sort order within the folder. */
  order?: number
  /** Override row label (defaults to the app name). */
  label?: string
}

/** Where and how an app installs a Quick Launch button. */
export interface QuickLaunchPlacement {
  /** Ascending sort order along the Quick Launch strip. */
  order?: number
  /** Button title / tooltip (defaults to the app name). */
  title?: string
  /** Accessible label (defaults to the title). */
  alt?: string
}

export interface ProcessDirectoryEntry {
  /** App display name (for desktop icons, start menu, etc.) */
  name: string
  /** React component rendered inside framework-owned window chrome */
  Component?: ComponentType<ProcessComponentProps>
  /** Default window title */
  defaultTitle: string
  /** Icon paths for small (16px) and large (32px) sizes */
  icon: AppIcon
  /** When true only one instance may run at a time (default: true) */
  singleton?: boolean
  /** Show as a desktop icon */
  showOnDesktop?: boolean
  /** Show shortcut overlay arrow on the icon */
  shortcut?: boolean
  /** Install a Start-menu shortcut for this app (folder + placement). */
  startMenu?: StartMenuPlacement
  /** Install a Quick Launch button for this app. */
  quickLaunch?: QuickLaunchPlacement
  /** Open automatically once the desktop finishes booting */
  autoOpenOnStartup?: boolean
  /** Ephemeral windows participate in z-index / focus but are hidden from taskbar */
  ephemeral?: boolean
  /** Default window dimensions in px — used as both initial inline size and minimum resize constraint */
  defaultSize?: { width?: number, height?: number }
  /** Default absolute window position applied by the framework-owned shell */
  defaultPosition?: ProcessWindowPosition
  /** Window shell selected by the renderer. Defaults to a draggable/resizable window. */
  window?: ProcessWindowConfig
}

/** Static registry keyed by appId */
export type ProcessDirectory = Record<string, ProcessDirectoryEntry>

// ---------------------------------------------------------------------------
// Process — runtime state of a single running process (window)
// ---------------------------------------------------------------------------

export interface Process {
  /** The appId this process was spawned from */
  appId: AppId | (string & {})
  /** Current window title (may differ from directory default) */
  title: string
  /** Whether the window is minimized */
  minimized: boolean
  /** Whether the window is maximized */
  maximized: boolean
  /** Per-window portal container element override */
  componentWindow: HTMLElement | null
  /** Ephemeral windows participate in z-index / focus but are hidden from taskbar */
  ephemeral: boolean
  /** Component for ephemeral windows (not looked up from directory) */
  Component?: ComponentType<ProcessComponentProps>
  /** Icon for ephemeral windows (not looked up from directory) */
  icon?: AppIcon
  /** Pending file-open request carried to the window component */
  launch?: ProcessLaunch
}

/** Dictionary of running processes keyed by PID */
export type Processes = Record<string, Process>

/**
 * A request for a process to open (or reload) a specific file. The `nonce`
 * changes on every launch so a singleton window that is already running can
 * react to a fresh open of a different file.
 */
export interface ProcessLaunch {
  nonce: number
  /** Canonical virtual file-system path of the file to open. */
  path: string
}

// ---------------------------------------------------------------------------
// Context value — everything exposed by ProcessProvider
// ---------------------------------------------------------------------------

export interface ProcessContextState {
  /** All running processes */
  processes: Processes
  /** PID of the foreground (active) window, or null */
  foregroundId: string | null
  /** Ordered list of PIDs — last = topmost */
  stackOrder: string[]
  /** Global desktop container element for portals */
  container: HTMLElement | null
}

export interface ProcessContextActions {
  /** Open a process by appId. Overrides let you customise the title or open a file. */
  open: (appId: AppId, overrides?: { title?: string, launch?: { path: string } }) => void
  /** Close (terminate) a process */
  close: (id: string) => void
  /** Activate a process — bring to front & un-minimize */
  activate: (id: string) => void
  /** Minimize a process */
  minimize: (id: string) => void
  /** Toggle maximize state */
  toggleMaximize: (id: string) => void
  /** Restore a minimized process */
  restore: (id: string) => void
  /** Minimize all non-minimized windows and deactivate (Show Desktop) */
  minimizeAll: () => void
  /** Deactivate all windows (click on desktop) */
  deactivateAll: () => void
  /** Taskbar click handler — toggles minimize / restore / activate */
  handleTaskbarClick: (id: string) => void
  /** Set the global desktop container element */
  setContainer: (el: HTMLElement | null) => void
  /** Link a DOM element to a specific process (per-window portal container) */
  linkElement: (id: string, el: HTMLElement | null) => void
  /** Update a process's title */
  title: (id: string, newTitle: string) => void
  /**
   * Dynamic escape hatch — open an ephemeral window with an inline Component.
   * Use when the component is determined at runtime and not pre-registered.
   * Caller is responsible for providing id / title / icon.
   */
  openEphemeral: (
    Component: ComponentType<ProcessComponentProps>,
    options: { id: string, title: string, icon?: AppIcon, singleton?: boolean },
  ) => void
}

export type ProcessContextValue = ProcessContextState & ProcessContextActions
