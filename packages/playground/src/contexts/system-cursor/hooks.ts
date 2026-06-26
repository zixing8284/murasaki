import type { SystemCursorKind } from './types'
import { use, useEffect } from 'react'
import { SystemCursorContext } from './context'

/**
 * Register the calling component as an active source of a system cursor state
 * while `active` is true. The source is released on cleanup, when `active`
 * becomes false, or when the component unmounts.
 *
 * Use for framework-level loading seams (window launch, iframe load) and for
 * apps that perform their own async content loading.
 */
export function useSystemBusy(active: boolean, kind: SystemCursorKind): void {
  const ctx = use(SystemCursorContext)
  if (!ctx) {
    throw new Error('useSystemBusy must be used within a <SystemCursorProvider>')
  }
  const { register } = ctx

  useEffect(() => {
    if (!active)
      return
    return register(kind)
  }, [active, kind, register])
}
