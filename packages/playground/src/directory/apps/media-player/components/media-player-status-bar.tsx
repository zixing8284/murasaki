import type { JSX } from 'react'
import { WindowStatusBar, WindowStatusBarField } from '@murasaki/react98'

interface MediaPlayerStatusBarProps {
  currentTrackTitle: string | undefined
  formattedCurrentTime: string
  formattedDuration: string
}

export function MediaPlayerStatusBar({
  currentTrackTitle,
  formattedCurrentTime,
  formattedDuration,
}: MediaPlayerStatusBarProps): JSX.Element {
  return (
    <WindowStatusBar>
      <WindowStatusBarField className="truncate">
        {currentTrackTitle ?? 'Ready'}
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
