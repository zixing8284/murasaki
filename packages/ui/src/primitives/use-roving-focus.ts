import type { RefObject } from 'react'
import { useEffect } from 'react'

export type RovingOrientation = 'horizontal' | 'vertical' | 'both'

export interface UseRovingFocusOptions {
  /** When `false`, no keydown listener is attached. */
  enabled: boolean
  /** Container that owns the focusable items. */
  containerRef: RefObject<HTMLElement | null>
  /**
   * CSS selector for navigable items inside the container, matched in DOM order.
   * Items matching the selector but with `aria-disabled="true"` are skipped.
   */
  itemSelector: string
  /**
   * `'horizontal'` listens to ArrowLeft/ArrowRight,
   * `'vertical'` to ArrowUp/ArrowDown,
   * `'both'` to all four. Defaults to `'horizontal'`.
   */
  orientation?: RovingOrientation
  /** Whether navigation wraps at the ends. Defaults to `true`. */
  loop?: boolean
  /**
   * Optional predicate to filter the candidate item list. Items returning
   * `false` are skipped during navigation (e.g. items inside collapsed
   * tree branches that are present in the DOM but not visible).
   */
  filterItem?: (item: HTMLElement) => boolean
  /**
   * Optional hook called after focus moves. Useful for "activate on focus"
   * patterns (manual activation is the default — consumer dispatches itself).
   */
  onFocus?: (item: HTMLElement) => void
}

const FORWARD_KEYS: Record<RovingOrientation, ReadonlyArray<string>> = {
  horizontal: ['ArrowRight'],
  vertical: ['ArrowDown'],
  both: ['ArrowRight', 'ArrowDown'],
}

const BACKWARD_KEYS: Record<RovingOrientation, ReadonlyArray<string>> = {
  horizontal: ['ArrowLeft'],
  vertical: ['ArrowUp'],
  both: ['ArrowLeft', 'ArrowUp'],
}

/**
 * Container-delegated arrow-key navigation for collection-style components
 * (Tabs, Menu, Toolbar, Tree, ...).
 *
 * - Arrow keys (per `orientation`) move focus to the next / previous enabled item.
 * - Home / End jump to first / last enabled item.
 * - Skips items with `aria-disabled="true"`.
 * - `filterItem` lets callers further hide items (e.g. inside collapsed branches).
 *
 * Out of scope: tabIndex management (consumer keeps control), typeahead
 * (see `useTypeahead`), grid two-axis movement.
 */
export function useRovingFocus({
  enabled,
  containerRef,
  itemSelector,
  orientation = 'horizontal',
  loop = true,
  filterItem,
  onFocus,
}: UseRovingFocusOptions): void {
  useEffect(() => {
    if (!enabled)
      return
    const container = containerRef.current
    if (!container)
      return

    function getItems(node: HTMLElement): HTMLElement[] {
      const all = Array.from(node.querySelectorAll<HTMLElement>(itemSelector))
        .filter(el => el.getAttribute('aria-disabled') !== 'true')
      return filterItem ? all.filter(filterItem) : all
    }

    function handleKeyDown(event: KeyboardEvent): void {
      const node = containerRef.current
      if (!node)
        return
      const items = getItems(node)
      if (items.length === 0)
        return

      const active = document.activeElement as HTMLElement | null
      const currentIndex = active ? items.indexOf(active) : -1

      let nextIndex = -1
      if (FORWARD_KEYS[orientation].includes(event.key)) {
        if (currentIndex === -1) {
          nextIndex = 0
        }
        else {
          const candidate = currentIndex + 1
          nextIndex = candidate < items.length ? candidate : (loop ? 0 : currentIndex)
        }
      }
      else if (BACKWARD_KEYS[orientation].includes(event.key)) {
        if (currentIndex === -1) {
          nextIndex = items.length - 1
        }
        else {
          const candidate = currentIndex - 1
          nextIndex = candidate >= 0 ? candidate : (loop ? items.length - 1 : currentIndex)
        }
      }
      else if (event.key === 'Home') {
        nextIndex = 0
      }
      else if (event.key === 'End') {
        nextIndex = items.length - 1
      }
      else {
        return
      }

      if (nextIndex === -1 || nextIndex === currentIndex)
        return

      const target = items[nextIndex]
      if (!target)
        return
      event.preventDefault()
      target.focus()
      onFocus?.(target)
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, containerRef, itemSelector, orientation, loop, filterItem, onFocus])
}
