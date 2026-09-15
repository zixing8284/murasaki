import type { ReactElement } from 'react'
import {
  MenuItem,
  MenuSeparator,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from '@murasaki-io/react98'
import { useProcessActions } from '../../../../contexts/process/hooks'
import { InactiveClickGuard } from '../../../../shell/window/inactive-click-guard'

const MEDIA_PLAYER_MENUS = ['File', 'Edit', 'Device', 'Scale', 'Help'] as const

interface MediaPlayerMenuBarProps {
  windowId: string
  onOpenFile: () => void
}

/** Single-span label with one underlined accelerator (no inter-letter gap). */
function Accel({ text, index = 0 }: { text: string, index?: number }): ReactElement {
  return (
    <span>
      {text.slice(0, index)}
      <span className="underline">{text.charAt(index)}</span>
      {text.slice(index + 1)}
    </span>
  )
}

export function MediaPlayerMenuBar({ windowId, onOpenFile }: MediaPlayerMenuBarProps): ReactElement {
  const { close } = useProcessActions()

  const otherMenus: readonly string[] = MEDIA_PLAYER_MENUS.filter(menu => menu !== 'File')

  return (
    <InactiveClickGuard windowId={windowId}>
      <WindowMenuBar>
        <WindowMenuBarMenu value="file">
          <WindowMenuBarTrigger>
            <Accel text="File" />
          </WindowMenuBarTrigger>
          <WindowMenuBarContent>
            <MenuItem onClick={onOpenFile}>
              <Accel text="Open…" />
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => close(windowId)}>
              <Accel text="Exit" index={1} />
            </MenuItem>
          </WindowMenuBarContent>
        </WindowMenuBarMenu>

        {otherMenus.map(menu => (
          <WindowMenuBarItem key={menu} disabled>
            <Accel text={menu} />
          </WindowMenuBarItem>
        ))}
      </WindowMenuBar>
    </InactiveClickGuard>
  )
}
