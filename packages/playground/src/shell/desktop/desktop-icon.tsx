import type { ReactElement, ReactNode, PointerEvent as ReactPointerEvent } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from 'murasaki-react98'
import { useRef, useState } from 'react'
import { calcGridDropTarget, useDesktopLayout } from '../../contexts/desktop-layout'

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
}: DesktopIconProps): ReactElement {
  const { setPosition, isCellOccupied, gridRef } = useDesktopLayout()
  const [dragOffset, setDragOffset] = useState<{ dx: number, dy: number } | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0)
      return
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
    if (!drag || drag.pointerId !== event.pointerId)
      return

    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY

    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD)
        return
      drag.moved = true
    }

    setDragOffset({ dx, dy })
  }

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId)
      return
    dragRef.current = null
    const dragEl = event.currentTarget

    try {
      dragEl.releasePointerCapture(event.pointerId)
    }
    catch {
      // Already released.
    }

    if (!drag.moved) {
      setDragOffset(null)
      return
    }

    suppressClickRef.current = true

    const previousPointerEvents = dragEl.style.pointerEvents
    dragEl.style.pointerEvents = 'none'
    const hitTarget = dragEl.ownerDocument.elementFromPoint(event.clientX, event.clientY)
    dragEl.style.pointerEvents = previousPointerEvents

    if (!gridRef.current || !hitTarget || !gridRef.current.contains(hitTarget)) {
      setDragOffset(null)
      return
    }

    const target = calcGridDropTarget(
      gridRef.current,
      { col, row },
      event.clientX - drag.startClientX,
      event.clientY - drag.startClientY,
    )
    if (
      target
      && (target.col !== col || target.row !== row)
      && !isCellOccupied(target.col, target.row, id)
    ) {
      setPosition(id, target)
    }

    setDragOffset(null)
  }

  const dragging = dragOffset !== null
  const zIndex = selected ? 1 : undefined
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
          className="relative cursor-pointer select-none touch-none"
          style={{
            gridColumnStart: col,
            gridRowStart: row,
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
