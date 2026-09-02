'use client'

import { Menu, MenuCheckboxItem, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuShortcut } from '@murasaki-io/react98'
import { useState } from 'react'

function FileIcon(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 14" width="12" height="14" shapeRendering="crispEdges">
      <path d="M1 0h7v4h4v10H1z" fill="var(--window)" />
      <path d="M8 0l4 4H8z" fill="var(--button-shadow)" />
      <path d="M1 0h7v4h4v10H1z" fill="none" stroke="var(--menu-text)" />
    </svg>
  )
}

export function MenuCheckableDemo(): React.ReactElement {
  const [wrap, setWrap] = useState(true)
  const [statusBar, setStatusBar] = useState(true)
  const [view, setView] = useState('details')

  return (
    <Menu className="w-56">
      <MenuItem icon={<FileIcon />}>
        New
        <MenuShortcut>Ctrl+N</MenuShortcut>
      </MenuItem>
      <MenuItem reserveIconSpace>
        Open…
        <MenuShortcut>Ctrl+O</MenuShortcut>
      </MenuItem>
      <MenuSeparator />
      <MenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>Word Wrap</MenuCheckboxItem>
      <MenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>Status Bar</MenuCheckboxItem>
      <MenuSeparator />
      <MenuLabel>View</MenuLabel>
      <MenuRadioGroup value={view} onValueChange={setView}>
        <MenuRadioItem value="icons">Large Icons</MenuRadioItem>
        <MenuRadioItem value="list">List</MenuRadioItem>
        <MenuRadioItem value="details">Details</MenuRadioItem>
      </MenuRadioGroup>
    </Menu>
  )
}
