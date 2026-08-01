import type { CursorSchemeId } from '../../lib/cursor-scheme'
import { createContext } from 'react'

export interface CursorSchemeContextValue {
  /** Currently applied cursor scheme. */
  schemeId: CursorSchemeId
  /** Apply and persist a cursor scheme desktop-wide. */
  setSchemeId: (id: CursorSchemeId) => void
}

export const CursorSchemeContext = createContext<CursorSchemeContextValue | null>(null)
