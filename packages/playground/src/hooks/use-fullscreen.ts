import { useEffect, useState } from 'react'

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
    const handleFullscreenChange = (): void => {
      setIsFullscreen(document.fullscreenElement === ref.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [ref])

  const enter = async (): Promise<void> => {
    const el = ref.current
    if (!el || document.fullscreenElement === el)
      return
    try {
      await el.requestFullscreen()
    }
    catch (error) {
      console.error('Failed to enter fullscreen.', error)
    }
  }

  const exit = async (): Promise<void> => {
    if (document.fullscreenElement !== ref.current)
      return
    try {
      await document.exitFullscreen()
    }
    catch (error) {
      console.error('Failed to exit fullscreen.', error)
    }
  }

  const toggle = async (): Promise<void> => {
    if (document.fullscreenElement === ref.current) {
      await exit()
    }
    else {
      await enter()
    }
  }

  return { isFullscreen, enter, exit, toggle }
}
