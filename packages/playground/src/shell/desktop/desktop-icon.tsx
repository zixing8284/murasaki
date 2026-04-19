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
import { ICON_HEIGHT, ICON_WIDTH, useDesktopLayout } from '../../contexts/desktop-layout'

const DRAG_THRESHOLD = 3

interface DesktopIconProps {
  id: string
  icon: ReactNode
  label: string
  x: number
  y: number
  selected: boolean
  onSelect: (id: string) => void
  onOpen: () => void
  menuContainer?: HTMLElement | null
}

interface DragState {
  pointerId: number
  startClientX: number
  startClientY: number
  origX: number
  origY: number
  moved: boolean
}

export function DesktopIcon({
  id,
  icon,
  label,
  x,
  y,
  selected,
  onSelect,
  onOpen,
  menuContainer = null,
}: DesktopIconProps): React.ReactElement {
  const { snap, setPosition } = useDesktopLayout()
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
      origX: x,
      origY: y,
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

    const parent = event.currentTarget.parentElement
    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY
    let nextX = drag.origX + dx
    let nextY = drag.origY + dy

    const snapped = snap({ x: nextX, y: nextY })
    nextX = snapped.x
    nextY = snapped.y

    if (parent) {
      const maxX = Math.max(0, parent.clientWidth - ICON_WIDTH)
      const maxY = Math.max(0, parent.clientHeight - ICON_HEIGHT)
      nextX = Math.max(0, Math.min(nextX, maxX))
      nextY = Math.max(0, Math.min(nextY, maxY))
    }
    else {
      nextX = Math.max(0, nextX)
      nextY = Math.max(0, nextY)
    }

    setDragOffset(null)
    setPosition(id, { x: nextX, y: nextY })
  }

  const renderedX = x + (dragOffset?.dx ?? 0)
  const renderedY = y + (dragOffset?.dy ?? 0)
  const dragging = dragOffset !== null

  return (
    <ContextMenu container={menuContainer}>
      <ContextMenuTrigger>
        <div
          className="absolute flex flex-col items-center gap-0.5 w-16 cursor-pointer select-none touch-none"
          style={{ left: renderedX, top: renderedY, zIndex: dragging ? 1 : undefined }}
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
                ? 'text-[11px] text-center leading-tight px-0.5 bg-(--hilight) text-(--hilight-text) outline-dotted outline-1 outline-(--hilight-text)'
                : 'text-[11px] text-center leading-tight px-0.5 text-(--desktop-text)'
            }
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
