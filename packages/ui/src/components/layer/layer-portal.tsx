import type * as React from 'react'
import { createPortal } from 'react-dom'
import { useLayerPortalTarget } from './layer-context'

export interface LayerPortalProps {
  children: React.ReactNode
}

export function LayerPortal({ children }: LayerPortalProps): React.ReactPortal | null {
  const target = useLayerPortalTarget()
  if (!target)
    return null
  return createPortal(children, target)
}
