import type { ReactNode } from 'react'
import type { SystemCursorKind } from './types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SystemCursorContext } from './context'

interface CursorCounts {
  working: number
  busy: number
}

const EMPTY_COUNTS: CursorCounts = { working: 0, busy: 0 }

/**
 * Resolve the highest-priority active cursor kind. `busy` outranks `working`;
 * an empty string clears the attribute so the default body cursor applies.
 */
function resolveCursor(counts: CursorCounts): SystemCursorKind | '' {
  if (counts.busy > 0)
    return 'busy'
  if (counts.working > 0)
    return 'working'
  return ''
}

/**
 * Provides a ref-counted registry of transient system cursor sources and
 * reflects the effective state onto `document.body.dataset.systemCursor`.
 *
 * Sources register via `useSystemBusy`. Multiple windows can be launching or
 * loading at once; the body shows the highest-priority active kind. CSS in
 * `style.css` maps each `data-system-cursor` value to a pixel `.cur` asset.
 */
export function SystemCursorProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [counts, setCounts] = useState<CursorCounts>(EMPTY_COUNTS)

  // Stable actions for the provider's lifetime — only closes over setCounts.
  const actions = useMemo(() => ({
    register(kind: SystemCursorKind): () => void {
      setCounts(prev => ({ ...prev, [kind]: prev[kind] + 1 }))
      let released = false
      return () => {
        if (released)
          return
        released = true
        setCounts(prev => ({ ...prev, [kind]: Math.max(0, prev[kind] - 1) }))
      }
    },
  }), [])

  const cursor = resolveCursor(counts)
  const lastWrittenRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastWrittenRef.current === cursor)
      return
    lastWrittenRef.current = cursor
    if (cursor)
      document.body.dataset.systemCursor = cursor
    else
      delete document.body.dataset.systemCursor
  }, [cursor])

  useEffect(() => () => {
    delete document.body.dataset.systemCursor
  }, [])

  return (
    <SystemCursorContext value={actions}>
      {children}
    </SystemCursorContext>
  )
}
