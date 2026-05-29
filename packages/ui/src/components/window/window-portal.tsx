import { createPortal } from 'react-dom'
import { useLayerPortalTarget } from '../../primitives'
import { LayerProvider } from '../layer/layer-provider'

export interface WindowPortalProps {
  children: React.ReactNode
  /**
   * Portal target container.
   * - undefined/null: portal to the current react98 layer target, falling back
   *   to document.body when no scoped layer provider is present
   * - HTMLElement: portal to that element
   */
  container?: HTMLElement | null
}

export function WindowPortal({
  children,
  container,
}: WindowPortalProps): React.ReactPortal | null {
  const layerTarget = useLayerPortalTarget()
  const target = container ?? layerTarget
  if (!target)
    return null
  return createPortal(<LayerProvider>{children}</LayerProvider>, target)
}
