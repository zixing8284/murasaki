import { useCallback, useEffect, useRef } from 'react'

export interface UseTypeaheadOptions {
  /** When `false`, `onChar` is a no-op. */
  enabled: boolean
  /**
   * Resolves a typed buffer to an item index. Return `-1` for no match.
   * Called once per keypress with the accumulated buffer.
   */
  onMatch: (search: string) => void
  /** Time in ms before the buffer is cleared. Defaults to 500. */
  timeout?: number
}

export interface UseTypeaheadResult {
  /** Feed a character (typically from a `keydown` handler). */
  onChar: (char: string) => void
  /** Reset the buffer immediately. */
  reset: () => void
}

/**
 * Type-to-search buffer for menus, dropdowns, and tree views.
 *
 * The hook only manages buffer accumulation and timeout reset. Resolving the
 * search string to an item is the consumer's responsibility (via `onMatch`)
 * because matching strategy varies (prefix vs. fuzzy, case sensitivity, etc.).
 *
 * @example
 * ```tsx
 * const { onChar } = useTypeahead({
 *   enabled: open,
 *   onMatch: search => focusFirstItemStartingWith(search),
 * })
 * // in a keydown handler:
 * if (event.key.length === 1) onChar(event.key)
 * ```
 */
export function useTypeahead({
  enabled,
  onMatch,
  timeout = 500,
}: UseTypeaheadOptions): UseTypeaheadResult {
  const bufferRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Latest-callback ref so onChar identity stays stable.
  const onMatchRef = useRef(onMatch)
  useEffect(() => {
    onMatchRef.current = onMatch
  }, [onMatch])

  const reset = useCallback(() => {
    bufferRef.current = ''
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onChar = (char: string): void => {
    if (!enabled)
      return
    if (char.length !== 1)
      return
    if (timerRef.current !== null)
      clearTimeout(timerRef.current)
    bufferRef.current += char.toLowerCase()
    onMatchRef.current(bufferRef.current)
    timerRef.current = setTimeout(reset, timeout)
  }

  // Clear timer on unmount or when disabled.
  useEffect(() => {
    if (!enabled)
      reset()
    return reset
  }, [enabled, reset])

  return { onChar, reset }
}
