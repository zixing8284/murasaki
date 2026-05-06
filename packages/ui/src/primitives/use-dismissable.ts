import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

const dismissableLayerStack: symbol[] = []

function addLayer(layerId: symbol): () => void {
  dismissableLayerStack.push(layerId)
  return () => {
    const index = dismissableLayerStack.indexOf(layerId)
    if (index !== -1)
      dismissableLayerStack.splice(index, 1)
  }
}

function isTopLayer(layerId: symbol): boolean {
  return dismissableLayerStack.at(-1) === layerId
}

export interface UseDismissableOptions {
  /** When `false`, no listeners are attached. */
  enabled: boolean
  /** Called when the layer should close. Always read via the latest ref internally. */
  onDismiss: () => void
  /** Close on the Escape key. Defaults to `true`. */
  escapeKey?: boolean
  /** Close on pointerdown outside `layerRefs`. Defaults to `false`. */
  outsidePointer?: boolean
  /**
   * Elements considered "inside" the layer. Outside-pointer dismissal ignores
   * pointer events whose target is contained by any of these elements.
   */
  layerRefs?: ReadonlyArray<RefObject<Element | null>>
}

/**
 * Shared dismissal behavior for transient layers (tooltip, popover, menu).
 *
 * Scope is intentionally minimal:
 * - Escape key on `window` (capture phase) — only the top-most layer closes.
 * - Optional pointerdown outside any provided layer refs, also top-most only.
 *
 * Focus/scroll-lock are out of scope and belong to `useFocusScope`.
 */
export function useDismissable({
  enabled,
  onDismiss,
  escapeKey = true,
  outsidePointer = false,
  layerRefs,
}: UseDismissableOptions): void {
  const layerIdRef = useRef<symbol>(Symbol('dismissable-layer'))

  // Latest-callback ref so subscribers don't tear down on every parent render.
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!enabled)
      return
    if (!escapeKey && !outsidePointer)
      return

    const layerId = layerIdRef.current
    const removeLayer = addLayer(layerId)

    function handleKeyDown(event: KeyboardEvent): void {
      if (!escapeKey)
        return
      if (!isTopLayer(layerId))
        return
      if (event.key !== 'Escape')
        return
      onDismissRef.current()
    }

    function handlePointerDown(event: PointerEvent): void {
      if (!outsidePointer)
        return
      if (!isTopLayer(layerId))
        return
      const target = event.target as Node | null
      if (!target)
        return
      const refs = layerRefs ?? []
      for (const ref of refs) {
        const node = ref.current
        if (node && node.contains(target))
          return
      }
      onDismissRef.current()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    if (outsidePointer)
      window.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      removeLayer()
      window.removeEventListener('keydown', handleKeyDown, true)
      if (outsidePointer)
        window.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [enabled, escapeKey, outsidePointer, layerRefs])
}
