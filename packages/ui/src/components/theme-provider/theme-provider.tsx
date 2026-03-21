import type { ThemeId } from '#/components/theme-provider/theme-context'
import { ThemeContext, themeIds } from '#/components/theme-provider/theme-context'
import { useScrollbarTheme } from '#/hooks/use-scrollbar-theme'
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'murasaki-theme'
const DEFAULT_THEME: ThemeId = 'windows-98'

export interface ThemeProviderProps {
  /** Initial theme. Falls back to localStorage, then `'windows-98'`. */
  defaultTheme?: ThemeId
  children: React.ReactNode
}

export function ThemeProvider({
  defaultTheme,
  children,
}: ThemeProviderProps): React.ReactElement {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (defaultTheme)
      return defaultTheme
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && themeIds.includes(stored as ThemeId))
        return stored as ThemeId
    }
    catch { /* SSR / private browsing */ }
    return DEFAULT_THEME
  })

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    }
    catch { /* ignore */ }
  }, [])

  // Toggle data-theme attribute on <html>
  useEffect(() => {
    const el = document.documentElement
    if (themeId === DEFAULT_THEME) {
      el.removeAttribute('data-theme')
    }
    else {
      el.setAttribute('data-theme', themeId)
    }
    return () => el.removeAttribute('data-theme')
  }, [themeId])

  // Sync scrollbar arrow SVG colors with --button-text
  useScrollbarTheme(themeId)

  return (
    <ThemeContext value={{ themeId, setTheme }}>
      {children}
    </ThemeContext>
  )
}
