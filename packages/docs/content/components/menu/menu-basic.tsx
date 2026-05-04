'use client'

import { Menu, MenuItem, MenuSeparator } from 'murasaki-react98'

export function MenuBasicDemo(): React.ReactElement {
  return (
    <Menu className="w-52">
      <MenuItem icon={<span aria-hidden="true">*</span>}>New Window</MenuItem>
      <MenuItem reserveIconSpace>Open</MenuItem>
      <MenuItem reserveIconSpace selected>Save</MenuItem>
      <MenuSeparator />
      <MenuItem reserveIconSpace disabled>Delete</MenuItem>
      <MenuItem reserveIconSpace>Properties</MenuItem>
    </Menu>
  )
}
