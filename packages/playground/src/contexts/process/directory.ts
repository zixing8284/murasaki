import type { ProcessDirectory } from './types'
import { lazy } from 'react'

/**
 * Process Directory — static registry of all available applications.
 *
 * Inspired by daedalOS's `contexts/process/directory.ts`.
 * Each entry defines what an app *is* (component, default title/icon, etc.).
 * Running state is tracked separately in the ProcessProvider.
 */
const directory: ProcessDirectory = {
  mycomputer: {
    appId: 'mycomputer',
    Component: lazy(() =>
      import('../../apps/my-computer').then(m => ({ default: m.MyComputer })),
    ),
    defaultTitle: 'My Computer',
    defaultIcon: '/img/desktop/MyComputer.png',
    singleton: true,
  },
  docs: {
    appId: 'docs',
    Component: lazy(() =>
      import('../../apps/docs/docs-app').then(m => ({ default: m.DocsApp })),
    ),
    defaultTitle: 'Component Docs',
    defaultIcon: '/img/desktop/MyComputer.png',
    singleton: true,
  },
  notepad: {
    appId: 'notepad',
    Component: lazy(() =>
      import('../../apps/notepad').then(m => ({ default: m.Notepad })),
    ),
    defaultTitle: 'Untitled - Notepad',
    defaultIcon: '/img/desktop/Notepad.png',
    singleton: false,
  },
}

export default directory
