import type { ThemeId } from '@murasaki/react98'
import { themeIds } from '@murasaki/react98'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PLAYGROUND_STORAGE_KEYS, readJsonStorageItem, removeStorageItem, writeJsonStorageItem } from '../../../lib/persistence'
import {
  ALL_COLOR_KEYS,
  BUTTON_FACE_DERIVED_KEYS,
  deriveFromButtonFace,
  readThemeColorsFromCss,
  TITLEBAR_DERIVED_KEYS,
} from './color-utils'
import { parseThemeFile } from './theme-file'

export type ThemeSchemeSelection = ThemeId | 'custom'

interface StoredThemeDesignerDraft {
  colors: Record<string, string>
  linkElements: boolean
  titlebarGradients: boolean
  currentSchemeId: ThemeSchemeSelection
}

const THEME_DRAFT_WRITE_DEBOUNCE_MS = 200

function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value)
}

function isThemeSchemeSelection(value: unknown): value is ThemeSchemeSelection {
  return value === 'custom' || (typeof value === 'string' && themeIds.includes(value as ThemeId))
}

function parseThemeDesignerDraft(value: unknown): StoredThemeDesignerDraft | null {
  if (!value || typeof value !== 'object')
    return null

  const draft = value as Partial<StoredThemeDesignerDraft>
  if (
    typeof draft.linkElements !== 'boolean'
    || typeof draft.titlebarGradients !== 'boolean'
    || !isThemeSchemeSelection(draft.currentSchemeId)
    || !draft.colors
    || typeof draft.colors !== 'object'
  ) {
    return null
  }

  const colors: Record<string, string> = {}
  for (const key of ALL_COLOR_KEYS) {
    const color = draft.colors[key]
    if (typeof color === 'string' && isHexColor(color)) {
      colors[key] = color.toLowerCase()
    }
  }

  return {
    colors,
    linkElements: draft.linkElements,
    titlebarGradients: draft.titlebarGradients,
    currentSchemeId: draft.currentSchemeId,
  }
}

function readStoredThemeDesignerDraft(): StoredThemeDesignerDraft | null {
  return readJsonStorageItem(
    'local',
    PLAYGROUND_STORAGE_KEYS.themeDesignerDraft,
    parseThemeDesignerDraft,
  )
}

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
  const [initialDraft] = useState(() => readStoredThemeDesignerDraft())
  const [colors, setColors] = useState<Record<string, string>>(() => ({
    ...readThemeColorsFromCss('windows-98'),
    ...(initialDraft?.colors ?? {}),
  }))
  const [linkElements, setLinkElements] = useState(initialDraft?.linkElements ?? false)
  const [titlebarGradients, setTitlebarGradients] = useState(initialDraft?.titlebarGradients ?? true)
  const [currentSchemeId, setCurrentSchemeId] = useState<ThemeSchemeSelection>(initialDraft?.currentSchemeId ?? 'windows-98')
  const skipNextPersistRef = useRef(true)
  const clearDraftRef = useRef(false)

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

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return undefined
    }

    if (clearDraftRef.current) {
      clearDraftRef.current = false
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      writeJsonStorageItem('local', PLAYGROUND_STORAGE_KEYS.themeDesignerDraft, {
        colors,
        linkElements,
        titlebarGradients,
        currentSchemeId,
      } satisfies StoredThemeDesignerDraft)
    }, THEME_DRAFT_WRITE_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [colors, currentSchemeId, linkElements, titlebarGradients])

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
    clearDraftRef.current = true
    removeStorageItem('local', PLAYGROUND_STORAGE_KEYS.themeDesignerDraft)
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
