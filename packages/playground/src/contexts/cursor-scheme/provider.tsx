import type { ReactElement, ReactNode } from 'react'
import type { CursorSchemeId } from '../../lib/cursor-scheme'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { assetPath } from '../../lib/asset-path'
import { CURSOR_SCHEMES, DEFAULT_CURSOR_SCHEME_ID, isCursorSchemeId } from '../../lib/cursor-scheme'
import { PLAYGROUND_STORAGE_KEYS } from '../../lib/persistence/schema'
import { CursorSchemeContext } from './context'

const STORAGE_KEY = PLAYGROUND_STORAGE_KEYS.cursorScheme

function readStoredScheme(): CursorSchemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isCursorSchemeId(stored) ? stored : DEFAULT_CURSOR_SCHEME_ID
  }
  catch {
    return DEFAULT_CURSOR_SCHEME_ID
  }
}

/** Warm the HTTP cache for a scheme's pointer files so cursors swap instantly. */
function preloadScheme(id: CursorSchemeId): void {
  const scheme = CURSOR_SCHEMES[id]
  for (const pointer of scheme.pointers) {
    const image = new Image()
    image.src = assetPath(`${scheme.basePath}/${pointer.file}`)
  }
}

/**
 * The default scheme owns the base `--cursor-*` tokens in `style.css`, so it
 * leaves `data-cursor-scheme` unset; any other scheme sets the attribute a
 * matching `html[data-cursor-scheme="…"]` block keys off.
 */
function applySchemeAttribute(id: CursorSchemeId): void {
  const root = document.documentElement
  if (id === DEFAULT_CURSOR_SCHEME_ID)
    delete root.dataset.cursorScheme
  else
    root.dataset.cursorScheme = id
}

/**
 * Applies the persisted Mouse Properties cursor scheme desktop-wide and exposes
 * a setter for the Mouse Properties window. The attribute is applied in a
 * layout effect so the persisted scheme is in place before first paint.
 */
export function CursorSchemeProvider({ children }: { children: ReactNode }): ReactElement {
  const [schemeId, setSchemeId] = useState<CursorSchemeId>(readStoredScheme)

  useLayoutEffect(() => {
    applySchemeAttribute(schemeId)
    preloadScheme(schemeId)
  }, [schemeId])

  const applyScheme = useCallback((id: CursorSchemeId) => {
    setSchemeId(id)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    }
    catch {
      // Ignore storage failures (private mode / quota).
    }
  }, [])

  const value = useMemo(() => ({ schemeId, setSchemeId: applyScheme }), [schemeId, applyScheme])

  return <CursorSchemeContext value={value}>{children}</CursorSchemeContext>
}
