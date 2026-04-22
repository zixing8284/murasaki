import { useCallback, useMemo, useState } from 'react'
import {
  BUTTON_FACE_DERIVED_KEYS,
  DEFAULT_COLORS,
  deriveFromButtonFace,
  TITLEBAR_DERIVED_KEYS,
} from './color-utils'
import { parseThemeFile } from './theme-file'

export interface ThemeColorsState {
  /** All 31 color values (CSS variable name → hex), including derived */
  allColors: Record<string, string>
  /** Whether ButtonFace-derived colors are auto-calculated */
  linkElements: boolean
  /** Whether titlebar gradients are linked (when OFF, gradient = identity of base) */
  titlebarGradients: boolean
  /** Set a single color by CSS variable name */
  setColor: (key: string, hex: string) => void
  /** Toggle link-elements mode */
  setLinkElements: (enabled: boolean) => void
  /** Toggle titlebar gradients mode */
  setTitlebarGradients: (enabled: boolean) => void
  /** Load all colors from a parsed .theme file content string */
  loadFromThemeFile: (content: string) => void
  /** Reset to default Windows 98 colors */
  resetToDefaults: () => void
  /** Check if a color key is currently derived (hidden from picker) */
  isDerived: (key: string) => boolean
}

export function useThemeColors(): ThemeColorsState {
  const [colors, setColors] = useState<Record<string, string>>(() => ({ ...DEFAULT_COLORS }))
  const [linkElements, setLinkElements] = useState(true)
  const [titlebarGradients, setTitlebarGradients] = useState(true)

  // Compute derived colors from current ButtonFace + settings
  const allColors = useMemo(() => {
    const result = { ...colors }

    if (linkElements) {
      const derived = deriveFromButtonFace(colors['button-face'])
      Object.assign(result, derived)
    }

    if (!titlebarGradients) {
      result['gradient-active-title'] = result['active-title']
      result['gradient-inactive-title'] = result['inactive-title']
    }

    return result
  }, [colors, linkElements, titlebarGradients])

  const setColor = useCallback((key: string, hex: string) => {
    setColors(prev => ({ ...prev, [key]: hex }))
  }, [])

  const loadFromThemeFile = useCallback((content: string) => {
    const parsed = parseThemeFile(content)
    setColors(prev => ({ ...prev, ...parsed }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setColors({ ...DEFAULT_COLORS })
  }, [])

  const isDerived = useCallback((key: string): boolean => {
    if (linkElements && (BUTTON_FACE_DERIVED_KEYS as readonly string[]).includes(key)) {
      return true
    }
    if (!titlebarGradients && (TITLEBAR_DERIVED_KEYS as readonly string[]).includes(key)) {
      return true
    }
    return false
  }, [linkElements, titlebarGradients])

  return {
    allColors,
    linkElements,
    titlebarGradients,
    setColor,
    setLinkElements,
    setTitlebarGradients,
    loadFromThemeFile,
    resetToDefaults,
    isDerived,
  }
}
