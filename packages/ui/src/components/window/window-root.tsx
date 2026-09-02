import type { WindowContextValue, WindowMeta, WindowState } from './window-context'

import { useState } from 'react'
import { WindowContext } from './window-context'

export interface WindowProps {
  /** Compound children: `WindowFrame` and its slots. */
  children: React.ReactNode
  /** Whether the window appears active (focused). Default: true */
  active?: boolean
  /** Whether the window is minimized (invisible via CSS, DOM preserved). Default: false */
  minimized?: boolean
  /** Initial maximized state. Default: false */
  defaultMaximized?: boolean
  /** Positioning mode. Default: 'fixed' */
  positioning?: 'absolute' | 'fixed'
  /** Whether the window can be maximized. Default: true */
  maximizable?: boolean
}

/**
 * The root of the Window compound. Owns window state (active, maximized,
 * minimized) and shares it with the compound parts (`WindowFrame`,
 * `WindowTitleBar`, `WindowContent`, `WindowMenuBar`, ...).
 *
 * `Window` renders no DOM of its own — it is a context provider — so consumers
 * stay in full control of layout, portalling, and drag/resize wiring around the
 * frame. See the Window docs for a complete, draggable example.
 *
 * @example
 * ```tsx
 * <Window positioning="absolute">
 *   <WindowFrame>
 *     <WindowTitleBar>
 *       <WindowTitle>Example.exe</WindowTitle>
 *       <WindowButtons>
 *         <WindowMinimizeButton />
 *         <WindowMaximizeButton />
 *         <WindowCloseButton />
 *       </WindowButtons>
 *     </WindowTitleBar>
 *     <WindowContent>…</WindowContent>
 *   </WindowFrame>
 * </Window>
 * ```
 */
export function Window({
  children,
  active = true,
  minimized = false,
  defaultMaximized = false,
  positioning = 'fixed',
  maximizable = true,
}: WindowProps): React.ReactElement {
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
