'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
  useContextMenu,
} from '@murasaki/react98'
import { Fragment } from 'react'

const TARGETS = [
  { id: 'top-left', label: 'Top-left corner', style: { gridColumn: 1, gridRow: 1 } },
  { id: 'top-right', label: 'Top-right corner', style: { gridColumn: 3, gridRow: 1 } },
  { id: 'center', label: 'Center area', style: { gridColumn: 2, gridRow: 2 } },
  { id: 'bottom-left', label: 'Bottom-left corner', style: { gridColumn: 1, gridRow: 3 } },
  { id: 'bottom-right', label: 'Bottom-right corner', style: { gridColumn: 3, gridRow: 3 } },
] as const

const ITEMS = [
  'Open',
  'Explore',
  'Search',
  'Send To',
  'Cut',
  'Copy',
  'Create Shortcut',
  'Delete',
  'Rename',
  'Properties',
  'View',
  'Arrange Icons',
  'Refresh',
  'Paste',
  'Paste Shortcut',
]

function RightClickTarget({
  label,
  style,
}: {
  label: string
  style: React.CSSProperties
}): React.ReactElement {
  return (
    <ContextMenuTrigger>
      <div
        style={{
          ...style,
          alignItems: 'center',
          background: 'var(--button-face)',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-raised)',
          color: 'var(--button-text)',
          display: 'flex',
          fontSize: 12,
          height: '100%',
          justifyContent: 'center',
          minHeight: 72,
          minWidth: 0,
          padding: '0 12px',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {label}
      </div>
    </ContextMenuTrigger>
  )
}

function ContextMenuMaxHeight({
  children,
}: {
  children: (maxHeight: number | undefined) => React.ReactNode
}): React.ReactElement {
  const ctx = useContextMenu()
  return <>{children(ctx.availableHeight ?? undefined)}</>
}

export function ContextMenuEdgeTestDemo(): React.ReactElement {
  return (
    <ContextMenu>
      <div
        style={{
          background: 'var(--window)',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-border-field)',
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
          height: '100%',
          minHeight: 280,
          padding: 12,
          width: '100%',
        }}
      >
        {TARGETS.map(target => (
          <RightClickTarget key={target.id} label={target.label} style={target.style} />
        ))}
        <div
          style={{
            color: 'var(--gray-text)',
            fontSize: 11,
            gridColumn: 2,
            gridRow: 3,
            placeSelf: 'end center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          Right-click any target to see adaptive placement.
        </div>
      </div>
      <ContextMenuContent>
        <ContextMenuMaxHeight>
          {maxHeight => (
            <Menu maxHeight={maxHeight} style={{ width: 192 }}>
              {ITEMS.map((item, index) => (
                <Fragment key={item}>
                  <MenuItem reserveIconSpace>{item}</MenuItem>
                  {(index === 3 || index === 8) && <MenuSeparator />}
                </Fragment>
              ))}
            </Menu>
          )}
        </ContextMenuMaxHeight>
      </ContextMenuContent>
    </ContextMenu>
  )
}
