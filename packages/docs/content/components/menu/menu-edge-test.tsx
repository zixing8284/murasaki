'use client'

import {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@murasaki/react98'
import { Fragment, useRef } from 'react'

const ACCESSORIES = [
  'Notepad',
  'Calculator',
  'Paint',
  'WordPad',
  'Accessibility',
  'Address Book',
  'Backup',
  'CD Player',
  'Character Map',
  'Clipboard Viewer',
  'Command Prompt',
  'Disk Cleanup',
  'HyperTerminal',
  'Magnifier',
  'Media Player',
  'NetMeeting',
  'Phone Dialer',
  'Sound Recorder',
  'System Information',
  'Volume Control',
]

const EDGE_MENUS = [
  { id: 'top-left', label: 'Top left', style: { left: 12, top: 12 } },
  { id: 'top-right', label: 'Top right', style: { right: 12, top: 12 } },
  { id: 'bottom-left', label: 'Bottom left', style: { bottom: 12, left: 12 } },
  { id: 'bottom-right', label: 'Bottom right', style: { bottom: 12, right: 12 } },
] as const

function EdgeMenu({
  boundaryRef,
  label,
}: {
  boundaryRef: React.RefObject<HTMLDivElement | null>
  label: string
}): React.ReactElement {
  return (
    <Menu style={{ width: 152 }}>
      <MenuItem reserveIconSpace disabled>{label}</MenuItem>
      <MenuSeparator />
      <MenuSub hoverOpenDelay={0} hoverCloseDelay={120}>
        <MenuSubTrigger reserveIconSpace>Accessories</MenuSubTrigger>
        <MenuSubContent boundaryRef={boundaryRef} estimatedHeight={560} estimatedWidth={176}>
          {ACCESSORIES.map((item, index) => (
            <Fragment key={item}>
              <MenuItem reserveIconSpace>{item}</MenuItem>
              {index === 3 && <MenuSeparator />}
            </Fragment>
          ))}
        </MenuSubContent>
      </MenuSub>
      <MenuSub hoverOpenDelay={0} hoverCloseDelay={120}>
        <MenuSubTrigger reserveIconSpace>Recent</MenuSubTrigger>
        <MenuSubContent boundaryRef={boundaryRef} estimatedWidth={176}>
          <MenuItem reserveIconSpace>Readme.txt</MenuItem>
          <MenuItem reserveIconSpace>Notes.txt</MenuItem>
          <MenuItem reserveIconSpace>Budget.xls</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuItem reserveIconSpace>Exit</MenuItem>
    </Menu>
  )
}

export function MenuEdgeTestDemo(): React.ReactElement {
  const boundaryRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={boundaryRef}
      style={{
        background: 'var(--window)',
        boxShadow: 'var(--shadow-border-field)',
        maxWidth: 720,
        minHeight: 460,
        overflow: 'hidden',
        padding: 12,
        position: 'relative',
        width: '100%',
      }}
    >
      {EDGE_MENUS.map(menu => (
        <div key={menu.id} style={{ ...menu.style, position: 'absolute' }}>
          <EdgeMenu boundaryRef={boundaryRef} label={menu.label} />
        </div>
      ))}
      <div
        style={{
          color: 'var(--gray-text)',
          fontSize: 11,
          left: '50%',
          position: 'absolute',
          textAlign: 'center',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 176,
        }}
      >
        Hover Accessories
      </div>
    </div>
  )
}
