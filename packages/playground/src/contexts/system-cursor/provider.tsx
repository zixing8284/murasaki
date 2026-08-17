import type { ReactNode } from 'react'
import type { SystemCursorKind } from './types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useProcesses } from '../process/hooks'
import { SystemCursorContext } from './context'

interface CursorCounts {
  working: number
  busy: number
}

const EMPTY_COUNTS: CursorCounts = { working: 0, busy: 0 }

/**
 * Resolve the highest-priority active cursor kind. `busy` outranks `working`;
 * an empty string clears the attribute so the default cursor applies.
 */
function resolveCursor(counts: CursorCounts): SystemCursorKind | '' {
  if (counts.busy > 0)
    return 'busy'
  if (counts.working > 0)
    return 'working'
  return ''
}

/**
 * Provides a ref-counted registry of transient desktop-level cursor sources
 * and reflects the effective state onto the desktop container element via
 * `data-desktop-cursor`.
 *
 * This matches Win98 where Explorer's thread cursor appears "global" because
 * the desktop window covers the entire screen. Per-window cursors use
 * `data-system-cursor` on individual window frames and override the desktop
 * cursor via higher CSS specificity.
 *
 * Sources register via `useSystemBusy`. Multiple windows can be launching or
 * loading at once; the desktop shows the highest-priority active kind.
 */
export function SystemCursorProvider({ children }: { children: ReactNode }): React.ReactElement {
  const { container } = useProcesses()
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
    if (!container)
      return
    if (lastWrittenRef.current === cursor)
      return
    lastWrittenRef.current = cursor
    if (cursor)
      container.dataset.desktopCursor = cursor
    else
      delete container.dataset.desktopCursor
  }, [cursor, container])

  useEffect(() => {
    if (!container)
      return
    return () => {
      delete container.dataset.desktopCursor
    }
  }, [container])

  return (
    <SystemCursorContext value={actions}>
      {children}
    </SystemCursorContext>
  )
}
