import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Detects clicks outside a referenced element and invokes a callback.
 * Useful for closing dropdowns, modals, or deselecting UI elements
 * when the user clicks elsewhere.
 *
 * @param callback - Invoked with the event when a click outside is detected.
 * @returns A ref to attach to the element that defines the "inside" boundary.
 */
export function useClickAway<T extends HTMLElement = HTMLElement>(
  callback: (event: Event) => void,
): React.RefObject<T | null> {
  const ref = useRef<T>(null)
  const callbackRef = useRef(callback)

  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const handler = (event: Event): void => {
      const element = ref.current
      if (element && !element.contains(event.target as Node)) {
        callbackRef.current(event)
      }
    }

    document.addEventListener('pointerdown', handler, true)
    document.addEventListener('touchstart', handler, true)

    return () => {
      document.removeEventListener('pointerdown', handler, true)
      document.removeEventListener('touchstart', handler, true)
    }
  }, [])

  return ref
}
