import type { DesktopFilesContextValue } from './context'
import { use } from 'react'
import { DesktopFilesContext } from './context'

export function useDesktopFiles(): DesktopFilesContextValue {
  const context = use(DesktopFilesContext)
  if (!context) {
    throw new Error('useDesktopFiles must be used within a <DesktopFilesProvider>')
  }

  return context
}
