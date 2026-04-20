import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from 'murasaki-react98'
import { useRef, useState } from 'react'
import { CELL_HEIGHT, CELL_WIDTH, DESKTOP_PADDING, useDesktopLayout } from '../../contexts/desktop-layout'

const DRAG_THRESHOLD = 3

interface DesktopIconProps {
  id: string
  icon: ReactNode
  label: string
  col: number
  row: number
  selected: boolean
  onSelect: (id: string) => void
  onOpen: () => void
  menuContainer?: HTMLElement | null
}

interface DragState {
  pointerId: number
  startClientX: number
  startClientY: number
  moved: boolean
}

export function DesktopIcon({
  id,
  icon,
  label,
  col,
  row,
  selected,
  onSelect,
  onOpen,
  menuContainer = null,
}: DesktopIconProps): React.ReactElement {
  const { setPosition, isCellOccupied } = useDesktopLayout()
  const [dragOffset, setDragOffset] = useState<{ dx: number, dy: number } | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return
    event.stopPropagation()
    onSelect(id)

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY

    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
      drag.moved = true
    }

    setDragOffset({ dx, dy })
  }

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    catch {
      // Already released.
    }

    if (!drag.moved) {
      setDragOffset(null)
      return
    }

    suppressClickRef.current = true

    // Compute the target grid cell from the pointer position relative to the
    // grid container.
    const container = event.currentTarget.parentElement
    if (container) {
      const rect = container.getBoundingClientRect()
      const relX = event.clientX - rect.left - DESKTOP_PADDING
      const relY = event.clientY - rect.top - DESKTOP_PADDING

      const targetCol = Math.max(1, Math.round(relX / CELL_WIDTH) + 1)
      const targetRow = Math.max(1, Math.round(relY / CELL_HEIGHT) + 1)

      // Clamp to the visible grid area.
      const maxCols = Math.max(1, Math.floor((container.clientWidth - DESKTOP_PADDING) / CELL_WIDTH))
      const maxRows = Math.max(1, Math.floor((container.clientHeight - DESKTOP_PADDING) / CELL_HEIGHT))
      const clampedCol = Math.min(targetCol, maxCols)
      const clampedRow = Math.min(targetRow, maxRows)

      if (!isCellOccupied(clampedCol, clampedRow, id)) {
        setPosition(id, { col: clampedCol, row: clampedRow })
      }
    }

    setDragOffset(null)
  }

  const dragging = dragOffset !== null
  const zIndex = dragging ? 10 : selected ? 1 : undefined

  return (
    <ContextMenu container={menuContainer}>
      <ContextMenuTrigger>
        <div
          className="flex flex-col items-center gap-0.5 cursor-pointer select-none touch-none"
          style={{
            gridColumnStart: col,
            gridRowStart: row,
            transform: dragging ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px)` : undefined,
            zIndex,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
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
        >
          <div className={selected ? 'brightness-50 sepia hue-rotate-180 saturate-200' : ''}>{icon}</div>
          <span
            className={
              selected
                ? 'text-[11px] text-center leading-[1.2] px-0.5 py-0.5 my-px pointer-events-none wrap-anywhere bg-(--hilight) text-(--hilight-text) outline-dotted outline-1 outline-(--hilight-text)'
                : 'text-[11px] text-center leading-[1.2] px-0.5 py-0.5 my-px pointer-events-none wrap-anywhere line-clamp-2 text-(--desktop-text)'
            }
            title={label}
          >
            {label}
          </span>
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
