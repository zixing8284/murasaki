import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

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
 * - Escape key on `window` (capture phase) — closes top-most layer first.
 * - Optional pointerdown outside any provided layer refs.
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

    function handleKeyDown(event: KeyboardEvent): void {
      if (!escapeKey)
        return
      if (event.key !== 'Escape')
        return
      onDismissRef.current()
    }

    function handlePointerDown(event: MouseEvent): void {
      if (!outsidePointer)
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
      window.addEventListener('mousedown', handlePointerDown, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      if (outsidePointer)
        window.removeEventListener('mousedown', handlePointerDown, true)
    }
  }, [enabled, escapeKey, outsidePointer, layerRefs])
}
