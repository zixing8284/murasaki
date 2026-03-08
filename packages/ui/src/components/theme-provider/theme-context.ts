import { createContext, use } from 'react'

export type ThemeId = 'solarized-dark' | 'windows-98'

export const themeIds: ThemeId[] = ['windows-98', 'solarized-dark']

export interface ThemeContextValue {
  /** Currently applied theme id. */
  themeId: ThemeId
  /** Switch the active theme. */
  setTheme: (id: ThemeId) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = use(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>')
  }
  return ctx
}
