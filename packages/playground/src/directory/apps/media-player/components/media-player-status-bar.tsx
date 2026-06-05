import type { JSX } from 'react'
import { WindowStatusBar, WindowStatusBarField } from '@murasaki-io/react98'

interface MediaPlayerStatusBarProps {
  currentTrackTitle: string | undefined
  errorMessage: string | null
  formattedCurrentTime: string
  formattedDuration: string
}

export function MediaPlayerStatusBar({
  currentTrackTitle,
  errorMessage,
  formattedCurrentTime,
  formattedDuration,
}: MediaPlayerStatusBarProps): JSX.Element {
  return (
    <WindowStatusBar>
      <WindowStatusBarField className="truncate">
        {errorMessage ?? currentTrackTitle ?? 'Ready'}
      </WindowStatusBarField>
      <WindowStatusBarField grow={false} className="w-20">
        {formattedCurrentTime}
        {' '}
        /
        {formattedDuration}
      </WindowStatusBarField>
    </WindowStatusBar>
  )
}
