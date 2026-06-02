import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useProcess } from '../../contexts/process/hooks'

interface InactiveClickGuardProps {
  windowId: string
  children: ReactNode
  className?: string
}

/**
 * Guards an interaction surface (such as a menu bar) so that when the host
 * window is inactive at the start of a click gesture, the first click only
 * activates the window via the normal frame activation path and does not
 * trigger any button / menu item inside the guarded subtree.
 *
 * Why this lives in the playground shell: window active/inactive state is an
 * application concern owned by the process context, not a generic UI library
 * concern. Keeping this policy here lets `packages/ui` primitives stay purely
 * presentational.
 *
 * How it works:
 * - `pointerdown` is left alone so it still bubbles to `WindowFrame` and
 *   triggers `activate(windowId)` as usual.
 * - We snapshot "was the window inactive when this gesture started?" into a
 *   ref during the capture-phase pointerdown, before React has a chance to
 *   flush the activation state update.
 * - If that snapshot says the window was inactive, we intercept the following
 *   `mousedown` and `click` in the capture phase so menu items inside the
 *   guarded subtree do not see them.
 *
 * Scope is intentionally menu-only. Applying this widely would surprise users
 * by swallowing legitimate control interactions.
 */
export function InactiveClickGuard({
  windowId,
  children,
  className,
}: InactiveClickGuardProps): React.ReactElement {
  const win = useProcess(windowId)
  const isActive = win?.isActive ?? true
  const suppressRef = useRef(false)

  return (
    <div
      className={className}
      onPointerDownCapture={() => {
        suppressRef.current = !isActive
      }}
      onMouseDownCapture={(e) => {
        if (suppressRef.current) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      onClickCapture={(e) => {
        if (suppressRef.current) {
          e.preventDefault()
          e.stopPropagation()
          suppressRef.current = false
        }
      }}
    >
      {children}
    </div>
  )
}
