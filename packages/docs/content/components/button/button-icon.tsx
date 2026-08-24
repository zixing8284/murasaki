'use client'

import { Button } from '@murasaki-io/react98'

function PlayIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M4 3.5 12.5 8 4 12.5z" />
    </svg>
  )
}

export function ButtonIconDemo(): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Button iconOnly aria-label="Play">
        <PlayIcon />
      </Button>
      <Button iconOnly aria-label="Play (large)" className="size-6">
        <PlayIcon />
      </Button>
    </div>
  )
}
