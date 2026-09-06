'use client'

import { Menu, MenuItem, MenuSeparator } from '@murasaki-io/react98'

export function MenuBasicDemo(): React.ReactElement {
  return (
    <Menu className="w-52">
      <MenuItem>
        <span aria-hidden="true" className="flex size-4 items-center justify-center">*</span>
        New Window
      </MenuItem>
      <MenuItem reserveIconSpace>Open</MenuItem>
      <MenuItem reserveIconSpace selected>Save</MenuItem>
      <MenuSeparator />
      <MenuItem reserveIconSpace disabled>Delete</MenuItem>
      <MenuItem reserveIconSpace>Properties</MenuItem>
    </Menu>
  )
}
