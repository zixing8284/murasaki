import type { ReactElement } from 'react'
import {
  ContextMenuContent,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@murasaki-io/react98'

export interface DesktopContextMenuContentProps {
  onNewTextDocument: () => void
  onRefresh: () => void
  onImport: () => void
  onProperties: () => void
}

/**
 * The desktop background right-click menu. Most entries mirror the classic
 * Windows desktop menu and are disabled placeholders; the enabled ones are
 * wired to the handlers the desktop provides.
 */
export function DesktopContextMenuContent({
  onNewTextDocument,
  onRefresh,
  onImport,
  onProperties,
}: DesktopContextMenuContentProps): ReactElement {
  return (
    <ContextMenuContent>
      <Menu>
        <MenuSub>
          <MenuSubTrigger>New</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem disabled>Folder</MenuItem>
            <MenuItem disabled>Shortcut</MenuItem>
            <MenuSeparator />
            <MenuItem onClick={onNewTextDocument}>Text Document</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>Arrange Icons</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem disabled>by Name</MenuItem>
            <MenuItem disabled>by Type</MenuItem>
            <MenuItem disabled>by Size</MenuItem>
            <MenuItem disabled>by Date</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem disabled>Line Up Icons</MenuItem>
        <MenuItem onClick={onRefresh}>Refresh</MenuItem>
        <MenuSeparator />
        <MenuItem disabled>Paste</MenuItem>
        <MenuItem disabled>Paste Shortcut</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={onImport}>Import Files…</MenuItem>
        <MenuItem onClick={onProperties}>Properties</MenuItem>
      </Menu>
    </ContextMenuContent>
  )
}
