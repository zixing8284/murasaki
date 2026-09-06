import type { TaskbarSettingsContextValue } from './context'
import { use } from 'react'
import { TaskbarSettingsContext } from './context'

export function useTaskbarSettings(): TaskbarSettingsContextValue {
  const value = use(TaskbarSettingsContext)
  if (!value)
    throw new Error('useTaskbarSettings must be used within a TaskbarSettingsProvider')
  return value
}
