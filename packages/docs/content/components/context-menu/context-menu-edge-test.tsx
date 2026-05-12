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
  { id: 'top', label: 'Right click (top)', style: { gridColumn: 2, gridRow: 1 } },
  { id: 'right', label: 'Right click (right)', style: { gridColumn: 3, gridRow: 2 } },
  { id: 'bottom', label: 'Right click (bottom)', style: { gridColumn: 2, gridRow: 3 } },
  { id: 'left', label: 'Right click (left)', style: { gridColumn: 1, gridRow: 2 } },
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
          boxShadow: 'var(--shadow-raised)',
          color: 'var(--button-text)',
          display: 'flex',
          fontSize: 12,
          height: 64,
          justifyContent: 'center',
          minWidth: 136,
          padding: '0 12px',
          textAlign: 'center',
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
          alignItems: 'center',
          background: 'var(--window)',
          boxShadow: 'var(--shadow-border-field)',
          display: 'grid',
          gap: 12,
          gridTemplateColumns: '1fr auto 1fr',
          gridTemplateRows: 'auto auto auto',
          maxWidth: 520,
          minHeight: 300,
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
            gridRow: 2,
            textAlign: 'center',
            width: 136,
          }}
        >
          ContextMenuContent
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
