import type { ProcessContextValue } from './types'
import { createContext } from 'react'

/**
 * React context for the process management system.
 * Must be consumed inside a `<ProcessProvider>`.
 */
export const ProcessContext = createContext<ProcessContextValue | null>(null)
