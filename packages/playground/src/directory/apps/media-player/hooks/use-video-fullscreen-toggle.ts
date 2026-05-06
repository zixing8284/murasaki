import { useCallback, useEffect, useRef } from 'react'

interface UseVideoFullscreenToggleResult {
  handleVideoClick: () => void
  handleVideoDoubleClick: () => void
}

export function useVideoFullscreenToggle(toggleFullscreen: () => void | Promise<void>): UseVideoFullscreenToggleResult {
  const videoClickCountRef = useRef(0)
  const videoClickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetVideoClickCount = useCallback(() => {
    videoClickCountRef.current = 0

    if (videoClickResetTimerRef.current !== null) {
      clearTimeout(videoClickResetTimerRef.current)
      videoClickResetTimerRef.current = null
    }
  }, [])

  const handleVideoClick = useCallback(() => {
    videoClickCountRef.current += 1

    if (videoClickResetTimerRef.current !== null) {
      clearTimeout(videoClickResetTimerRef.current)
    }

    videoClickResetTimerRef.current = setTimeout(() => {
      videoClickCountRef.current = 0
      videoClickResetTimerRef.current = null
    }, 500)
  }, [])

  const handleVideoDoubleClick = useCallback(() => {
    const clickCount = videoClickCountRef.current
    resetVideoClickCount()

    if (clickCount < 2)
      return

    void toggleFullscreen()
  }, [resetVideoClickCount, toggleFullscreen])

  useEffect(() => {
    return () => {
      if (videoClickResetTimerRef.current !== null) {
        clearTimeout(videoClickResetTimerRef.current)
      }
    }
  }, [])

  return { handleVideoClick, handleVideoDoubleClick }
}
