import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { PLAYGROUND_STORAGE_KEYS } from '../../lib/persistence/schema'
import { TaskbarSettingsContext } from './context'

const STORAGE_KEY = PLAYGROUND_STORAGE_KEYS.taskbarSmallStartIcons

function readStoredSmallIcons(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  }
  catch {
    return false
  }
}

/**
 * Holds the Taskbar Properties settings shared between the Start menu (which
 * sizes its top-level icons from `smallStartIcons`) and the Taskbar Properties
 * window (which toggles it). Persisted to localStorage so it survives reloads.
 */
export function TaskbarSettingsProvider({ children }: { children: ReactNode }): ReactElement {
  const [smallStartIcons, setSmallStartIcons] = useState<boolean>(readStoredSmallIcons)

  const applySmallStartIcons = useCallback((value: boolean) => {
    setSmallStartIcons(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
    }
    catch {
      // Ignore storage failures (private mode / quota).
    }
  }, [])

  const value = useMemo(
    () => ({ smallStartIcons, setSmallStartIcons: applySmallStartIcons }),
    [smallStartIcons, applySmallStartIcons],
  )

  return <TaskbarSettingsContext value={value}>{children}</TaskbarSettingsContext>
}
