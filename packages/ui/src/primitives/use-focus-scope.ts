import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

export interface UseFocusScopeOptions {
  /** When `false`, the scope is inactive (no trap, no restore). */
  enabled: boolean
  /** Container that bounds focusable elements. */
  containerRef: RefObject<HTMLElement | null>
  /**
   * Whether to move focus into the container on activation.
   * Defaults to `true`.
   */
  autoFocus?: boolean
  /**
   * Whether to restore focus to the previously focused element on deactivation.
   * Defaults to `true`.
   */
  restoreFocus?: boolean
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
}

/**
 * Focus management primitive for transient layers (popover, menu, dialog).
 *
 * Covers:
 * - Move focus into the container on activation (autoFocus).
 * - Trap Tab / Shift-Tab inside the container.
 * - Restore focus to the previously focused element on deactivation.
 *
 * Out of scope: focus guards for portal escape, sentinel nodes for Shadow DOM,
 * programmatic focus return targets.
 */
export function useFocusScope({
  enabled,
  containerRef,
  autoFocus = true,
  restoreFocus = true,
}: UseFocusScopeOptions): void {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled)
      return
    const container = containerRef.current
    if (!container)
      return

    previouslyFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null

    if (autoFocus) {
      const [first] = getFocusable(container)
      if (first)
        first.focus()
      else
        container.focus()
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Tab')
        return
      const node = containerRef.current
      if (!node)
        return
      const focusable = getFocusable(node)
      if (focusable.length === 0) {
        event.preventDefault()
        node.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last)
        return
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }
      else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (restoreFocus) {
        const previous = previouslyFocusedRef.current
        if (previous && document.contains(previous))
          previous.focus()
      }
    }
  }, [enabled, containerRef, autoFocus, restoreFocus])
}
