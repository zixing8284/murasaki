'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
  useContextMenu,
} from '@murasaki-io/react98'
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
        className="flex items-center justify-center box-border min-w-0 w-full h-full min-h-[72px] px-3 text-center text-[12px] bg-(--button-face) text-(--button-text) shadow-(--shadow-raised)"
        style={style}
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
        className="box-border grid gap-3 w-full h-full min-h-[280px] p-3 bg-(--window) shadow-(--shadow-border-field)"
        style={{
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {TARGETS.map(target => (
          <RightClickTarget key={target.id} label={target.label} style={target.style} />
        ))}
        <div
          className="col-start-2 col-end-3 row-start-3 row-end-4 place-self-end-center text-center w-full text-[12px] text-(--gray-text)"
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
