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

export function isTextEntryTarget(target: EventTarget | null): boolean {
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

export function formatTime(seconds: number): string {
  if (Number.isNaN(seconds))
    return '00:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
