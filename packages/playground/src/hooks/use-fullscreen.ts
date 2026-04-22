import { useCallback, useEffect, useState } from 'react'

type FullscreenTarget = React.RefObject<Element | null>

/**
 * Imperative Fullscreen API wrapper.
 *
 * Returns `isFullscreen` (kept in sync with `fullscreenchange`) and
 * `enter` / `exit` / `toggle` commands that operate on the provided ref.
 *
 * Must be invoked from a user gesture; errors from the Fullscreen API
 * are logged to the console.
 */
export function useFullscreen(ref: FullscreenTarget): {
  isFullscreen: boolean
  enter: () => Promise<void>
  exit: () => Promise<void>
  toggle: () => Promise<void>
} {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = (): void => {
      setIsFullscreen(document.fullscreenElement === ref.current)
    }

    document.addEventListener('fullscreenchange', handleChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
    }
  }, [ref])

  const enter = useCallback(async () => {
    const el = ref.current
    if (!el || document.fullscreenElement === el)
      return
    try {
      await el.requestFullscreen()
    }
    catch (error) {
      console.error('Failed to enter fullscreen.', error)
    }
  }, [ref])

  const exit = useCallback(async () => {
    if (document.fullscreenElement !== ref.current)
      return
    try {
      await document.exitFullscreen()
    }
    catch (error) {
      console.error('Failed to exit fullscreen.', error)
    }
  }, [ref])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement === ref.current) {
      await exit()
    }
    else {
      await enter()
    }
  }, [ref, enter, exit])

  return { isFullscreen, enter, exit, toggle }
}
