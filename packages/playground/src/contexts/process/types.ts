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
}

/** Dictionary of running processes keyed by PID */
export type Processes = Record<string, Process>

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
  /** Open a process by appId. Overrides let you customise the title. */
  open: (appId: AppId, overrides?: { title?: string }) => void
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
