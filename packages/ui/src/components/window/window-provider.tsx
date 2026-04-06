import type { WindowContextValue, WindowMeta, WindowState } from './window-context'

import { useState } from 'react'
import { WindowContext } from './window-context'

export interface WindowProviderProps {
  children: React.ReactNode
  /** Whether window appears active (focused). Default: true */
  active?: boolean
  /** Whether window is minimized (hidden via CSS, DOM preserved). Default: false */
  minimized?: boolean
  /** Initial maximized state. Default: false */
  defaultMaximized?: boolean
  /** Positioning mode. Default: 'fixed' */
  positioning?: 'absolute' | 'fixed'
  /** Whether the window can be maximized. Default: true */
  maximizable?: boolean
}

export function WindowProvider({
  children,
  active = true,
  minimized = false,
  defaultMaximized = false,
  positioning = 'fixed',
  maximizable = true,
}: WindowProviderProps): React.ReactElement {
  const [maximized, setMaximized] = useState(defaultMaximized)

  const state: WindowState = {
    active,
    maximized,
    minimized,
  }

  const actions = {
    setMaximized,
    toggleMaximized: () => setMaximized(prev => !prev),
  }

  const meta: WindowMeta = {
    positioning,
    maximizable,
  }

  const value: WindowContextValue = { state, actions, meta }

  return (
    <WindowContext value={value}>
      {children}
    </WindowContext>
  )
}
