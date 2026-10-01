import type { ReactElement } from 'react'
import {
  MenuItem,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from '@murasaki-io/react98'
import { useProcessActions } from '../../../../contexts/process/hooks'
import { InactiveClickGuard } from '../../../../shell/window/inactive-click-guard'

interface EntertainmentMenuBarProps {
  windowId: string
}

export function EntertainmentMenuBar({ windowId }: EntertainmentMenuBarProps): ReactElement {
  const { close } = useProcessActions()

  return (
    <InactiveClickGuard windowId={windowId}>
      <WindowMenuBar>
        <WindowMenuBarMenu value="game">
          <WindowMenuBarTrigger>Game</WindowMenuBarTrigger>
          <WindowMenuBarContent>
            <MenuItem onClick={() => close(windowId)}>Exit</MenuItem>
          </WindowMenuBarContent>
        </WindowMenuBarMenu>
        <WindowMenuBarItem disabled>Help</WindowMenuBarItem>
      </WindowMenuBar>
    </InactiveClickGuard>
  )
}
