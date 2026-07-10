import { createContext, useContext, type ReactNode } from 'react'
import { themes, type ColorTokens } from '@murasaki-io/tokens'

const ThemeContext = createContext<ColorTokens>(themes['windows-98'])

export function ThemeProvider({
  themeId = 'windows-98',
  children,
}: {
  themeId?: string
  children: ReactNode
}) {
  const colors = themes[themeId] ?? themes['windows-98']
  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>
}

export function useTheme(): ColorTokens {
  return useContext(ThemeContext)
}
