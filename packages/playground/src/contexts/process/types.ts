import type { ComponentType } from 'react'

// ---------------------------------------------------------------------------
// Process Directory — static definition of what an app *is*
// ---------------------------------------------------------------------------

export interface ProcessComponentProps {
  windowId: string
}

export interface ProcessDirectoryEntry {
  /** Unique identifier for this app type */
  appId: string
  /** React component rendered inside the window */
  Component: ComponentType<ProcessComponentProps>
  /** Default window title */
  defaultTitle: string
  /** Default icon path */
  defaultIcon: string
  /** When true only one instance may run at a time (default: true) */
  singleton?: boolean
}

/** Static registry keyed by appId */
export type ProcessDirectory = Record<string, ProcessDirectoryEntry>

// ---------------------------------------------------------------------------
// Process — runtime state of a single running process (window)
// ---------------------------------------------------------------------------

export interface Process {
  /** The appId this process was spawned from */
  appId: string
  /** Current window title (may differ from directory default) */
  title: string
  /** Current icon path */
  icon: string
  /** Whether the window is minimized */
  minimized: boolean
  /** Whether the window is maximized */
  maximized: boolean
  /** Per-window portal container element override */
  componentWindow: HTMLElement | null
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
  /** Open a process by appId. Overrides let you customise title/icon. */
  open: (appId: string, overrides?: { title?: string, icon?: string }) => void
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
  /** Update a process's icon */
  icon: (id: string, newIcon: string) => void
}

export type ProcessContextValue = ProcessContextState & ProcessContextActions
