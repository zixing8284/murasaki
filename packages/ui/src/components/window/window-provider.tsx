import type { WindowContextValue, WindowMeta, WindowRefs, WindowState } from './window-context'

import { useState } from 'react'
import { useWindowDraggable } from './use-window-draggable'
import { WindowContext, WindowRefsContext } from './window-context'

export interface WindowProviderProps {
  children: React.ReactNode
  /** Whether window appears active (focused). Default: true */
  active?: boolean
  /** Initial maximized state. Default: false */
  defaultMaximized?: boolean
  /** Container element for drag constraints. Default: null (viewport) */
  container?: HTMLElement | null
  /** Positioning mode. Default: 'fixed' */
  positioning?: 'absolute' | 'fixed'
  /** Enable drag behavior via title bar. Default: false */
  draggable?: boolean
}

export function WindowProvider({
  children,
  active = true,
  defaultMaximized = false,
  container = null,
  positioning = 'fixed',
  draggable = false,
}: WindowProviderProps): React.ReactElement {
  const [maximized, setMaximized] = useState(defaultMaximized)

  // Use the draggable hook - it manages its own refs
  const { setTargetRef: setFrameRef, setDragRef: setTitleBarRef } = useWindowDraggable<
    HTMLDivElement,
    HTMLDivElement
  >({
    container,
    draggable: draggable && !maximized,
  })

  const state: WindowState = {
    active,
    maximized,
  }

  const actions = {
    setMaximized,
    toggleMaximized: () => setMaximized(prev => !prev),
  }

  const meta: WindowMeta = {
    container,
    positioning,
    draggable,
  }

  const refs: WindowRefs = {
    setFrameRef,
    setTitleBarRef,
  }

  const value: WindowContextValue = { state, actions, meta }

  return (
    <WindowContext value={value}>
      <WindowRefsContext value={refs}>
        {children}
      </WindowRefsContext>
    </WindowContext>
  )
}
