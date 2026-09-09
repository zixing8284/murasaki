import type { ReactElement, ReactNode } from 'react'
import type { GridLayout } from '../../contexts/desktop-layout/storage'
import type { DesktopCellOccupancyChecker, DesktopDragPreview } from './use-desktop-icon-drag'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from '@murasaki-io/react98'
import { IconTile } from '../../components/icon-tile'
import { useDesktopLayout } from '../../contexts/desktop-layout/hooks'
import { useDesktopIconDrag } from './use-desktop-icon-drag'

interface DesktopIconProps {
  id: string
  icon: ReactNode
  label: string
  col: number | undefined
  row: number | undefined
  selected: boolean
  selectedIds: readonly string[]
  positions: GridLayout
  dragOffset: { dx: number, dy: number } | null
  onSelect: (id: string, additive: boolean, preserveSelectedGroup: boolean) => void
  onDragPreviewChange: (preview: DesktopDragPreview | null) => void
  onOpen: () => void
  isCellOccupied: DesktopCellOccupancyChecker
  menuContainer?: HTMLElement | null
}

export function DesktopIcon({
  id,
  icon,
  label,
  col,
  row,
  selected,
  selectedIds,
  positions,
  dragOffset,
  onSelect,
  onDragPreviewChange,
  onOpen,
  isCellOccupied,
  menuContainer = null,
}: DesktopIconProps): ReactElement {
  const { setPositions, gridRef } = useDesktopLayout()
  const { suppressClickRef, setIconRef } = useDesktopIconDrag({
    id,
    col,
    row,
    positions,
    selectedIds,
    gridRef,
    setPositions,
    isCellOccupied,
    onSelect,
    onDragPreviewChange,
    onOpen,
  })

  const dragging = dragOffset !== null
  const zIndex = dragging ? 2 : selected ? 1 : undefined

  return (
    <ContextMenu container={menuContainer}>
      <ContextMenuTrigger>
        <div
          ref={setIconRef}
          role="button"
          tabIndex={0}
          className="relative cursor-pointer select-none touch-none pointer-events-none text-(--desktop-text)"
          style={{
            ...(col !== undefined && { gridColumnStart: col }),
            ...(row !== undefined && { gridRowStart: row }),
            zIndex,
          }}
          data-file-id={id}
          onContextMenu={() => {
            // Right-clicking an unselected icon selects it (Windows behavior),
            // so the context menu acts on a visibly-active target.
            if (!selected)
              onSelect(id, false, false)
          }}
          onClick={(event) => {
            event.stopPropagation()
            if (suppressClickRef.current) {
              suppressClickRef.current = false
              event.preventDefault()
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              onOpen()
            }
          }}
        >
          <IconTile icon={icon} label={label} selected={selected} className={dragging ? 'opacity-40' : undefined} />
          {dragging && dragOffset && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate(${dragOffset.dx}px, ${dragOffset.dy}px)`,
                zIndex: 10,
              }}
            >
              <IconTile icon={icon} label={label} selected={selected} />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <Menu>
          <MenuItem onClick={onOpen} className="font-bold">Open</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Cut</MenuItem>
          <MenuItem disabled>Copy</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Create Shortcut</MenuItem>
          <MenuItem disabled>Delete</MenuItem>
          <MenuItem disabled>Rename</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Properties</MenuItem>
        </Menu>
      </ContextMenuContent>
    </ContextMenu>
  )
}
