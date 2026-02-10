import type { WindowContextValue, WindowMeta, WindowState } from './window-context'

import { useState } from 'react'
import { WindowContext } from './window-context'

export interface WindowProviderProps {
  children: React.ReactNode
  /** Whether window appears active (focused). Default: true */
  active?: boolean
  /** Initial maximized state. Default: false */
  defaultMaximized?: boolean
  /** Positioning mode. Default: 'fixed' */
  positioning?: 'absolute' | 'fixed'
}

export function WindowProvider({
  children,
  active = true,
  defaultMaximized = false,
  positioning = 'fixed',
}: WindowProviderProps): React.ReactElement {
  const [maximized, setMaximized] = useState(defaultMaximized)

  const state: WindowState = {
    active,
    maximized,
  }

  const actions = {
    setMaximized,
    toggleMaximized: () => setMaximized(prev => !prev),
  }

  const meta: WindowMeta = {
    positioning,
  }

  const value: WindowContextValue = { state, actions, meta }

  return (
    <WindowContext value={value}>
      {children}
    </WindowContext>
  )
}
