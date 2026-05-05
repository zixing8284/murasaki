import { useEffect } from 'react'
import { isTextEntryTarget } from '../media-player-utils'

interface UseMediaPlayerKeyboardShortcutsOptions {
  enabled: boolean
  onTogglePlay: () => void
  onSeekBackward: () => void
  onSeekForward: () => void
}

export function useMediaPlayerKeyboardShortcuts({
  enabled,
  onTogglePlay,
  onSeekBackward,
  onSeekForward,
}: UseMediaPlayerKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled)
      return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.defaultPrevented
        || event.isComposing
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || isTextEntryTarget(event.target)
      ) {
        return
      }

      if (event.key === ' ' || event.code === 'Space') {
        if (event.repeat)
          return

        event.preventDefault()
        onTogglePlay()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onSeekBackward()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onSeekForward()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, onSeekBackward, onSeekForward, onTogglePlay])
}
