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
  const { suppressClickRef, handlePointerDown } = useDesktopIconDrag({
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
  })

  const dragging = dragOffset !== null
  const zIndex = dragging ? 2 : selected ? 1 : undefined
  // Two-line label budget at 72px width / 11px font. Selected state shows the
  // full label (multi-line expand). Unselected state truncates the displayed
  // text with an ellipsis character so overflow never relies on CSS hiding.
  const LABEL_MAX_CHARS = 20
  const displayLabel = selected || label.length <= LABEL_MAX_CHARS
    ? label
    : `${label.slice(0, LABEL_MAX_CHARS - 1).trimEnd()}…`
  const content = (
    <>
      <div className={selected ? 'brightness-50 sepia hue-rotate-180 saturate-200' : ''}>{icon}</div>
      <span
        className={
          selected
            ? 'max-w-18 text-[11px] text-center leading-[1.2] px-0.5 py-0.5 my-px pointer-events-none wrap-break-word bg-(--hilight) text-(--hilight-text) outline-dotted outline-1 outline-(--hilight-text)'
            : 'max-w-18 text-[11px] text-center leading-[1.2] px-0.5 py-0.5 my-px pointer-events-none wrap-break-word text-(--desktop-text)'
        }
        style={selected ? undefined : { backgroundColor: 'var(--desktop-icon-label-bg, transparent)' }}
        title={label}
      >
        {displayLabel}
      </span>
    </>
  )

  return (
    <ContextMenu container={menuContainer}>
      <ContextMenuTrigger>
        <div
          role="button"
          tabIndex={0}
          className="relative cursor-pointer select-none touch-none"
          style={{
            ...(col !== undefined && { gridColumnStart: col }),
            ...(row !== undefined && { gridRowStart: row }),
            zIndex,
          }}
          onPointerDown={handlePointerDown}
          data-file-id={id}
          onClick={(event) => {
            event.stopPropagation()
            if (suppressClickRef.current) {
              suppressClickRef.current = false
              event.preventDefault()
            }
          }}
          onDoubleClick={(event) => {
            event.stopPropagation()
            onOpen()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              onOpen()
            }
          }}
        >
          <div
            className={`flex flex-col items-center gap-0.5 ${dragging ? 'opacity-40 pointer-events-none' : ''}`}
          >
            {content}
          </div>
          {dragging && dragOffset && (
            <div
              className="absolute inset-0 flex flex-col items-center gap-0.5 pointer-events-none"
              style={{
                transform: `translate(${dragOffset.dx}px, ${dragOffset.dy}px)`,
                zIndex: 10,
              }}
            >
              {content}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <Menu>
          <MenuItem onClick={onOpen}>Open</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Rename</MenuItem>
          <MenuItem disabled>Delete</MenuItem>
          <MenuSeparator />
          <MenuItem disabled>Properties</MenuItem>
        </Menu>
      </ContextMenuContent>
    </ContextMenu>
  )
}
