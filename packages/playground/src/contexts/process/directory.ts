import type { AppIcon, ProcessDirectoryEntry } from './types'
import { lazy } from 'react'

export const DEFAULT_ICON: AppIcon = {
  sm: '/img/desktop/ProgMan.png',
  lg: '/img/desktop/ProgMan.png',
}

/**
 * Process Directory — static registry of all available applications.
 *
 * Inspired by daedalOS's `contexts/process/directory.ts`.
 * Each entry defines what an app *is* (component, default title/icon, etc.).
 * Running state is tracked separately in the ProcessProvider.
 */
const directory = {
  mycomputer: {
    appId: 'mycomputer',
    name: 'My Computer',
    Component: lazy(() =>
      import('../../apps/my-computer').then(m => ({ default: m.MyComputer })),
    ),
    defaultTitle: 'My Computer',
    icon: { sm: '/img/desktop/MyComputer.png', lg: '/img/desktop/MyComputer.png' },
    singleton: true,
  },
  docs: {
    appId: 'docs',
    name: 'Component Docs',
    Component: lazy(() =>
      import('../../apps/docs/docs-app').then(m => ({ default: m.DocsApp })),
    ),
    defaultTitle: 'Component Docs',
    icon: { sm: '/img/desktop/MyComputer.png', lg: '/img/desktop/MyComputer.png' },
    singleton: true,
  },
  notepad: {
    appId: 'notepad',
    name: 'Notepad',
    Component: lazy(() =>
      import('../../apps/notepad').then(m => ({ default: m.Notepad })),
    ),
    defaultTitle: 'Untitled - Notepad',
    icon: { sm: '/img/desktop/Notepad.png', lg: '/img/desktop/Notepad.png' },
    singleton: false,
    showOnDesktop: true,
  },
} satisfies Record<string, ProcessDirectoryEntry>

export type AppId = keyof typeof directory

export default directory as Record<AppId, ProcessDirectoryEntry>
