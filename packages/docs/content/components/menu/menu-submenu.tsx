'use client'

import {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@murasaky/react98'

export function MenuSubmenuDemo(): React.ReactElement {
  return (
    <Menu className="w-56">
      <MenuItem reserveIconSpace>New</MenuItem>
      <MenuItem reserveIconSpace>Open</MenuItem>
      <MenuSeparator />
      <MenuSub>
        <MenuSubTrigger reserveIconSpace>Send To</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem reserveIconSpace>Desktop</MenuItem>
          <MenuItem reserveIconSpace>Mail Recipient</MenuItem>
          <MenuItem reserveIconSpace>My Documents</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSub>
        <MenuSubTrigger reserveIconSpace>Recent</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem reserveIconSpace>Readme.txt</MenuItem>
          <MenuItem reserveIconSpace>Notes.txt</MenuItem>
          <MenuItem reserveIconSpace disabled>(Nothing else)</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuItem reserveIconSpace>Exit</MenuItem>
    </Menu>
  )
}
