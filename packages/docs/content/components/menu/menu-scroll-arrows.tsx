'use client'

import { Menu, MenuItem, MenuSeparator } from '@murasaki/react98'
import { Fragment } from 'react'

const ITEMS = [
  'New',
  'Open',
  'Save',
  'Save As...',
  'Close',
  'Print',
  'Print Preview',
  'Page Setup',
  'Properties',
  'Send To',
  'Recent Files',
  'Workspace',
  'Import',
  'Export',
  'Convert',
  'Compress',
  'Share',
  'Backup',
  'Restore',
  'Exit',
]

export function MenuScrollArrowsDemo(): React.ReactElement {
  return (
    <Menu className="w-52" maxHeight={140}>
      {ITEMS.map((label, index) => (
        <Fragment key={label}>
          <MenuItem reserveIconSpace>{label}</MenuItem>
          {index === 4 && <MenuSeparator />}
        </Fragment>
      ))}
    </Menu>
  )
}
