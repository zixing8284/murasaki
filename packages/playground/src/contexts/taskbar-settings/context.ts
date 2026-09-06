import { createContext } from 'react'

export interface TaskbarSettingsContextValue {
  /** When true, the Start menu renders its top-level entries with small (16px) icons. */
  smallStartIcons: boolean
  setSmallStartIcons: (value: boolean) => void
}

export const TaskbarSettingsContext = createContext<TaskbarSettingsContextValue | null>(null)
