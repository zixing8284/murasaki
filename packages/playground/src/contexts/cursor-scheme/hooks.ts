import type { CursorSchemeContextValue } from './context'
import { use } from 'react'
import { CursorSchemeContext } from './context'

export function useCursorScheme(): CursorSchemeContextValue {
  const ctx = use(CursorSchemeContext)
  if (!ctx)
    throw new Error('useCursorScheme must be used within a <CursorSchemeProvider>')
  return ctx
}
