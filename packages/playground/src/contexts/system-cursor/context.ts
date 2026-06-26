import type { SystemCursorActions } from './types'
import { createContext } from 'react'

/**
 * Actions context for the system cursor registry. Stable for the provider's
 * lifetime, so consumers that only register sources never re-render on state
 * changes (mirrors the split-context pattern used by the process context).
 */
export const SystemCursorContext = createContext<SystemCursorActions | null>(null)
