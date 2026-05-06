import { useEffect } from 'react'

const TEXT_ENTRY_INPUT_TYPES = new Set([
  'date',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week',
])

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement))
    return false

  if (target.isContentEditable || target.closest('[contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"]'))
    return true

  if (target instanceof HTMLTextAreaElement)
    return true

  if (target instanceof HTMLInputElement)
    return TEXT_ENTRY_INPUT_TYPES.has(target.type)

  return false
}

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
