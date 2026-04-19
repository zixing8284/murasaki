import type { DesktopLayoutContextValue } from './context'
import { use } from 'react'
import { DesktopLayoutContext } from './context'

export function useDesktopLayout(): DesktopLayoutContextValue {
  const ctx = use(DesktopLayoutContext)
  if (!ctx) {
    throw new Error('useDesktopLayout must be used within a <DesktopLayoutProvider>')
  }
  return ctx
}
