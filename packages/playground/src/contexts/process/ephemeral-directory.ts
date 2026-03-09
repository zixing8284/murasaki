import type { AppIcon, ProcessDirectoryEntry } from './types'
import { lazy } from 'react'

const DISPLAY_PROPERTIES_ICON: AppIcon = {
  sm: '/img/computer.png',
  lg: '/img/computer.png',
}

/**
 * Ephemeral Directory — static registry of ephemeral (dialog-like) windows.
 *
 * All IDs are prefixed with `eph:` to guarantee no collision with the main
 * process directory (`directory.ts`).
 *
 * Ephemeral windows participate in z-index / focus but are hidden from the
 * taskbar's running-tasks list.
 */
const ephemeralDirectory = {
  'eph:displayproperties': {
    appId: 'eph:displayproperties',
    name: 'Display Properties',
    Component: lazy(() =>
      import('../../shell/taskbar/display-properties').then(m => ({ default: m.DisplayProperties })),
    ),
    defaultTitle: 'Display Properties',
    icon: DISPLAY_PROPERTIES_ICON,
    singleton: true,
  },
} satisfies Record<string, ProcessDirectoryEntry>

export type EphemeralAppId = keyof typeof ephemeralDirectory

export default ephemeralDirectory as Record<EphemeralAppId, ProcessDirectoryEntry>
