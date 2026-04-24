import type { ReactElement, ReactNode, PointerEvent as ReactPointerEvent } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from 'murasaki-react98'
import { useEffect, useRef, useState } from 'react'
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
  iconEl: HTMLDivElement
  col: number
  row: number
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
  const cleanupRef = useRef<(() => void) | null>(null)
  const suppressClickRef = useRef(false)

  // Abort any in-flight drag when the icon unmounts (e.g. removed mid-drag).
  // Listeners live on `window`, so without this they would leak.
  useEffect(() => () => cleanupRef.current?.(), [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0)
      return
    event.stopPropagation()
    onSelect(id)

    // Defensive reset: clear any stale state from a previous drag that was
    // never completed (e.g. pointerup swallowed by an overlay or iframe).
    cleanupRef.current?.()

    const iconEl = event.currentTarget
    const drag: DragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
      iconEl,
      col,
      row,
    }
    dragRef.current = drag

    const onPointerMove = (e: PointerEvent): void => {
      if (e.pointerId !== drag.pointerId)
        return
      const dx = e.clientX - drag.startClientX
      const dy = e.clientY - drag.startClientY

      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD)
          return
        drag.moved = true
      }

      setDragOffset({ dx, dy })
    }

    function cleanup(): void {
      if (cleanupRef.current !== cleanup)
        return
      cleanupRef.current = null
      dragRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('blur', onAbort)
      document.removeEventListener('visibilitychange', onVisibility)
      setDragOffset(null)
    }

    function commitDrop(clientX: number, clientY: number): void {
      if (!drag.moved)
        return
      suppressClickRef.current = true

      const previousPointerEvents = drag.iconEl.style.pointerEvents
      drag.iconEl.style.pointerEvents = 'none'
      const hitTarget = drag.iconEl.ownerDocument.elementFromPoint(clientX, clientY)
      drag.iconEl.style.pointerEvents = previousPointerEvents

      const grid = gridRef.current
      if (!grid || !hitTarget || !grid.contains(hitTarget))
        return

      const target = calcGridDropTarget(
        grid,
        { col: drag.col, row: drag.row },
        clientX - drag.startClientX,
        clientY - drag.startClientY,
      )
      if (
        target
        && (target.col !== drag.col || target.row !== drag.row)
        && !isCellOccupied(target.col, target.row, id)
      ) {
        setPosition(id, target)
      }
    }

    function onPointerUp(e: PointerEvent): void {
      if (e.pointerId !== drag.pointerId)
        return
      commitDrop(e.clientX, e.clientY)
      cleanup()
    }

    function onPointerCancel(e: PointerEvent): void {
      if (e.pointerId !== drag.pointerId)
        return
      cleanup()
    }

    function onAbort(): void {
      cleanup()
    }

    function onVisibility(): void {
      if (document.visibilityState === 'hidden')
        cleanup()
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('blur', onAbort)
    document.addEventListener('visibilitychange', onVisibility)

    cleanupRef.current = cleanup
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
