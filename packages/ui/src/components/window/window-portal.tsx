import { createPortal } from 'react-dom'

export interface WindowPortalProps {
  children: React.ReactNode
  /**
   * Portal target container.
   * - undefined/null: portal to document.body
   * - HTMLElement: portal to that element
   */
  container?: HTMLElement | null
}

export function WindowPortal({
  children,
  container,
}: WindowPortalProps): React.ReactPortal {
  const target = container ?? document.body
  return createPortal(children, target)
}
