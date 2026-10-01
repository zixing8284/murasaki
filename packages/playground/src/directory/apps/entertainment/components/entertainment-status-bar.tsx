import type { ReactElement } from 'react'
import { WindowStatusBar, WindowStatusBarField } from '@murasaki-io/react98'

interface EntertainmentStatusBarProps {
  left: string
  right: string
}

export function EntertainmentStatusBar({ left, right }: EntertainmentStatusBarProps): ReactElement {
  return (
    <WindowStatusBar>
      <WindowStatusBarField className="truncate">{left}</WindowStatusBarField>
      <WindowStatusBarField grow={false} className="w-28 truncate">{right}</WindowStatusBarField>
    </WindowStatusBar>
  )
}
