import type { LayerContextValue } from '../../primitives/layer-root/layer-context'
import * as React from 'react'
import { useState } from 'react'
import { cnPure } from '../../lib/utils'
import { LayerContext } from '../../primitives/layer-root/layer-context'

export interface LayerProviderProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * Optional portal target. When omitted, the provider renders a local layer
   * root after its children and uses that element as the target. Passing
   * `null` lets callers wire a ref-backed target that may not be mounted yet.
   */
  container?: HTMLElement | null
  children: React.ReactNode
}

export function LayerProvider({
  children,
  className,
  container,
  ref,
  ...props
}: LayerProviderProps): React.ReactElement {
  const [localTarget, setLocalTarget] = useState<HTMLDivElement | null>(null)
  const target = container ?? localTarget

  const setLayerRootRef = (node: HTMLDivElement | null): void => {
    setLocalTarget(node)
    if (typeof ref === 'function') {
      ref(node)
    }
    else if (ref) {
      ref.current = node
    }
  }

  const value: LayerContextValue = { target }

  return (
    <LayerContext value={value}>
      {children}
      {container === undefined && (
        <div
          ref={setLayerRootRef}
          data-react98-layer-root=""
          className={cnPure(className)}
          {...props}
        />
      )}
    </LayerContext>
  )
}
