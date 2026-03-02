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
      import('../../components/my-computer-window').then(m => ({ default: m.MyComputerWindow })),
    ),
    defaultTitle: 'My Computer',
    defaultIcon: '/img/desktop/MyComputer.png',
    singleton: true,
  },
  docs: {
    appId: 'docs',
    Component: lazy(() =>
      import('../../components/docs-window/docs-window').then(m => ({ default: m.DocsWindow })),
    ),
    defaultTitle: 'Component Docs',
    defaultIcon: '/img/desktop/MyComputer.png',
    singleton: true,
  },
  notepad: {
    appId: 'notepad',
    Component: lazy(() =>
      import('../../components/notepad-window').then(m => ({ default: m.NotepadWindow })),
    ),
    defaultTitle: 'Untitled - Notepad',
    defaultIcon: '/img/desktop/Notepad.png',
    singleton: false,
  },
}

export default directory
