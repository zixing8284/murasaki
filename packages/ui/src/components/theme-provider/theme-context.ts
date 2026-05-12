import { createContext, use } from 'react'

export const themeIds = [
  'windows-95',
  'windows-98',
  'windows-standard',
  'rainy-day',
  'rose',
  'slate',
  'spruce',
  'desert',
] as const

export type ThemeId = typeof themeIds[number]

export const themeLabels: Record<ThemeId, string> = {
  'windows-95': 'Windows 95',
  'windows-98': 'Windows 98',
  'windows-standard': 'Windows Standard',
  'rainy-day': 'Rainy Day',
  'rose': 'Rose',
  'slate': 'Slate',
  'spruce': 'Spruce',
  'desert': 'Desert',
}

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
