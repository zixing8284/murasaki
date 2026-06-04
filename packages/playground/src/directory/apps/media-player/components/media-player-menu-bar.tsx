import type { JSX } from 'react'
import {
  MenuItem,
  MenuSeparator,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from '@murasaky/react98'
import { useProcessActions } from '../../../../contexts/process/hooks'
import { InactiveClickGuard } from '../../../../shell/window/inactive-click-guard'

const MEDIA_PLAYER_MENUS = ['File', 'Edit', 'Device', 'Scale', 'Help'] as const

interface MediaPlayerMenuBarProps {
  windowId: string
  onOpenFile: () => void
}

export function MediaPlayerMenuBar({ windowId, onOpenFile }: MediaPlayerMenuBarProps): JSX.Element {
  const { close } = useProcessActions()

  const otherMenus: readonly string[] = MEDIA_PLAYER_MENUS.filter(menu => menu !== 'File')

  return (
    <InactiveClickGuard windowId={windowId}>
      <WindowMenuBar>
        <WindowMenuBarMenu value="file">
          <WindowMenuBarTrigger>
            <span className="underline">F</span>
            ile
          </WindowMenuBarTrigger>
          <WindowMenuBarContent>
            <MenuItem onClick={onOpenFile}>
              <span className="underline">O</span>
              pen…
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => close(windowId)}>
              E
              <span className="underline">x</span>
              it
            </MenuItem>
          </WindowMenuBarContent>
        </WindowMenuBarMenu>

        {otherMenus.map(menu => (
          <WindowMenuBarItem key={menu} disabled>
            <span className="underline">{menu[0]}</span>
            {menu.slice(1)}
          </WindowMenuBarItem>
        ))}
      </WindowMenuBar>
    </InactiveClickGuard>
  )
}
