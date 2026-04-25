import type { ProcessContextActions, ProcessContextState } from './types'
import { createContext } from 'react'

/**
 * State context — re-renders consumers whenever the running-process map,
 * focus, stacking order, or root container changes.
 */
export const ProcessStateContext = createContext<ProcessContextState | null>(null)

/**
 * Actions context — value is established once at mount and never changes,
 * so consumers that only call actions never re-render on state updates.
 */
export const ProcessActionsContext = createContext<ProcessContextActions | null>(null)
