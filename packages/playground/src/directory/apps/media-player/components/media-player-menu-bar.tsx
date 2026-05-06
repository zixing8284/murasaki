import type { JSX } from 'react'
import { WindowMenuBar, WindowMenuBarItem } from '@murasaki/react98'
import { InactiveClickGuard } from '../../../../shell/window/inactive-click-guard'

const MEDIA_PLAYER_MENUS = ['File', 'Edit', 'Device', 'Scale', 'Help'] as const

interface MediaPlayerMenuBarProps {
  windowId: string
  onOpenFile: () => void
}

export function MediaPlayerMenuBar({ windowId, onOpenFile }: MediaPlayerMenuBarProps): JSX.Element {
  return (
    <InactiveClickGuard windowId={windowId}>
      <WindowMenuBar>
        {MEDIA_PLAYER_MENUS.map((menu) => {
          const isFileMenu = menu === 'File'

          return (
            <WindowMenuBarItem
              key={menu}
              onClick={isFileMenu ? onOpenFile : undefined}
              disabled={!isFileMenu}
            >
              <span className="underline">{menu[0]}</span>
              {menu.slice(1)}
            </WindowMenuBarItem>
          )
        })}
      </WindowMenuBar>
    </InactiveClickGuard>
  )
}
