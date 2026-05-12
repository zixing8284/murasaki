import type { ThemeId } from '@murasaki/react98'
import { useCallback, useMemo, useState } from 'react'
import {
  BUTTON_FACE_DERIVED_KEYS,
  deriveFromButtonFace,
  readThemeColorsFromCss,
  TITLEBAR_DERIVED_KEYS,
} from './color-utils'
import { parseThemeFile } from './theme-file'

export type ThemeSchemeSelection = ThemeId | 'custom'

export interface ThemeColorsState {
  /** All theme color values (CSS variable name → hex), including derived */
  allColors: Record<string, string>
  /** Whether ButtonFace-derived colors are auto-calculated */
  linkElements: boolean
  /** Whether titlebar gradients are linked (when OFF, gradient = identity of base) */
  titlebarGradients: boolean
  /** Current built-in scheme selection, or custom when colors have been edited */
  currentSchemeId: ThemeSchemeSelection
  /** Set a single color by CSS variable name */
  setColor: (key: string, hex: string) => void
  /** Toggle link-elements mode */
  setLinkElements: (enabled: boolean) => void
  /** Toggle titlebar gradients mode */
  setTitlebarGradients: (enabled: boolean) => void
  /** Load all colors from a parsed .theme file content string */
  loadFromThemeFile: (content: string) => void
  /** Load a built-in color scheme */
  loadBuiltInScheme: (id: ThemeId) => void
  /** Reset to default Windows 98 colors */
  resetToDefaults: () => void
  /** Check if a color key is currently derived (hidden from picker) */
  isDerived: (key: string) => boolean
}

export function useThemeColors(): ThemeColorsState {
  const [colors, setColors] = useState<Record<string, string>>(() => readThemeColorsFromCss('windows-98'))
  const [linkElements, setLinkElements] = useState(false)
  const [titlebarGradients, setTitlebarGradients] = useState(true)
  const [currentSchemeId, setCurrentSchemeId] = useState<ThemeSchemeSelection>('windows-98')

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
    setCurrentSchemeId('custom')
  }, [])

  const handleSetLinkElements = useCallback((enabled: boolean) => {
    setLinkElements(enabled)
    setCurrentSchemeId('custom')
  }, [])

  const handleSetTitlebarGradients = useCallback((enabled: boolean) => {
    setTitlebarGradients(enabled)
    setCurrentSchemeId('custom')
  }, [])

  const loadFromThemeFile = useCallback((content: string) => {
    const parsed = parseThemeFile(content)
    setColors(prev => ({ ...prev, ...parsed }))
    setCurrentSchemeId('custom')
  }, [])

  const loadBuiltInScheme = useCallback((id: ThemeId) => {
    setColors(readThemeColorsFromCss(id))
    setLinkElements(false)
    setTitlebarGradients(true)
    setCurrentSchemeId(id)
  }, [])

  const resetToDefaults = useCallback(() => {
    setColors(readThemeColorsFromCss('windows-98'))
    setLinkElements(false)
    setTitlebarGradients(true)
    setCurrentSchemeId('windows-98')
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
    currentSchemeId,
    setColor,
    setLinkElements: handleSetLinkElements,
    setTitlebarGradients: handleSetTitlebarGradients,
    loadFromThemeFile,
    loadBuiltInScheme,
    resetToDefaults,
    isDerived,
  }
}
