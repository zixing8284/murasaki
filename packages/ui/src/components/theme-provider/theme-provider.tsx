/* eslint-disable react-refresh/only-export-components */

import type { ThemeId } from './theme-context'
import { useEffect, useState } from 'react'
import { ThemeContext, themeIds } from './theme-context'

export { themeIds, themeLabels, useTheme } from './theme-context'
export type { ThemeContextValue, ThemeId } from './theme-context'

const STORAGE_KEY = 'murasaki-theme'
const DEFAULT_THEME: ThemeId = 'windows-98'

function isThemeId(value: string | null): value is ThemeId {
  return value !== null && themeIds.includes(value as ThemeId)
}

export interface ThemeProviderProps {
  /** Initial theme supplied by the app. SSR apps should provide this from request-aware data. */
  defaultTheme?: ThemeId
  /** Browser persistence key. Set to `null` to disable localStorage persistence. */
  storageKey?: string | null
  /** Optional element that receives `data-theme` instead of `<html>`. */
  attributeTarget?: HTMLElement | null
  children: React.ReactNode
}

export function ThemeProvider(props: ThemeProviderProps): React.ReactElement {
  const {
    defaultTheme,
    storageKey = STORAGE_KEY,
    children,
  } = props
  const hasAttributeTarget = 'attributeTarget' in props
  const attributeTarget = props.attributeTarget

  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (defaultTheme !== undefined || storageKey === null || typeof window === 'undefined')
      return defaultTheme ?? DEFAULT_THEME
    try {
      const stored = localStorage.getItem(storageKey)
      if (isThemeId(stored))
        return stored
    }
    catch { /* ignore */ }
    return DEFAULT_THEME
  })

  const setTheme = (id: ThemeId): void => {
    setThemeId(id)
    if (storageKey === null)
      return
    try {
      localStorage.setItem(storageKey, id)
    }
    catch { /* ignore */ }
  }

  // Toggle data-theme on the chosen root. Skip writes when the attribute already
  // matches the desired state to avoid the cleanup→set churn that previously caused
  // a brief flash where data-theme was wiped between transitions.
  useEffect(() => {
    const el = hasAttributeTarget ? attributeTarget : document.documentElement
    if (!el)
      return

    const current = el.getAttribute('data-theme')
    const nextAttribute = themeId === DEFAULT_THEME && !hasAttributeTarget ? null : themeId
    if (nextAttribute === null) {
      if (current !== null)
        el.removeAttribute('data-theme')
    }
    else if (current !== nextAttribute) {
      el.setAttribute('data-theme', nextAttribute)
    }
  }, [attributeTarget, hasAttributeTarget, themeId])

  useEffect(() => {
    if (!hasAttributeTarget || !attributeTarget)
      return

    const el = attributeTarget
    return () => {
      el.removeAttribute('data-theme')
    }
  }, [attributeTarget, hasAttributeTarget])

  return (
    <ThemeContext value={{ themeId, setTheme }}>
      {children}
    </ThemeContext>
  )
}
