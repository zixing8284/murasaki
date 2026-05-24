import type { ChangeEvent, CSSProperties, ReactElement, ReactNode, PointerEvent as ReactPointerEvent, Ref } from 'react'
import type { GridLayout, GridPosition } from '../../contexts/desktop-layout'
import type { AppId } from '../../contexts/process'
import type { DesktopDragPreview } from './use-desktop-icon-drag'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from '@murasaki/react98'
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useDesktopFiles } from '../../contexts/desktop-files'
import { CELL_HEIGHT, CELL_WIDTH, COLUMN_GAP, DESKTOP_PADDING, ROW_GAP, useDesktopLayout } from '../../contexts/desktop-layout'
import { APP_ID, appDirectory, useProcessActions } from '../../contexts/process'
import { assetPath } from '../../lib/asset-path'
import { DESKTOP_MEDIA_ICON as DESKTOP_MEDIA_ICON_PATH } from '../../lib/playground-assets'
import { AppIcon } from '../app-icon'
import { DesktopIcon } from './desktop-icon'

export interface DesktopHandle {
  clearSelection: () => void
}

const DESKTOP_MEDIA_ICON = assetPath(DESKTOP_MEDIA_ICON_PATH)
const SELECTION_THRESHOLD = 2

interface IconEntry {
  id: string
  label: string
  icon: ReactNode
  onOpen: () => void
}

interface SelectionRect {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface SelectionDragState {
  pointerId: number
  startX: number
  startY: number
  additive: boolean
  baseSelectedIds: string[]
  moved: boolean
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, ${CELL_WIDTH}px)`,
  gridTemplateRows: `repeat(auto-fill, ${CELL_HEIGHT}px)`,
  gridAutoFlow: 'column',
  alignContent: 'start',
  justifyContent: 'start',
  columnGap: COLUMN_GAP,
  rowGap: ROW_GAP,
  padding: DESKTOP_PADDING,
}

const selectionBoxStyle: CSSProperties = {
  backgroundImage: [
    'linear-gradient(90deg, #ffffff 1px, transparent 1px)',
    'linear-gradient(90deg, #ffffff 1px, transparent 1px)',
    'linear-gradient(0deg, #ffffff 1px, transparent 1px)',
    'linear-gradient(0deg, #ffffff 1px, transparent 1px)',
  ].join(', '),
  backgroundPosition: '0 0, 0 calc(100% - 1px), 0 0, calc(100% - 1px) 0',
  backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
  backgroundSize: '2px 1px, 2px 1px, 1px 2px, 1px 2px',
}

function getSelectionBox(rect: SelectionRect): { left: number, top: number, width: number, height: number } {
  return {
    left: Math.min(rect.startX, rect.currentX),
    top: Math.min(rect.startY, rect.currentY),
    width: Math.abs(rect.currentX - rect.startX),
    height: Math.abs(rect.currentY - rect.startY),
  }
}

function mergeSelectedIds(baseIds: readonly string[], selectedIds: readonly string[]): string[] {
  return Array.from(new Set([...baseIds, ...selectedIds]))
}

export function Desktop({ ref }: { ref?: Ref<DesktopHandle> }): ReactElement {
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>([])
  const [dragPreview, setDragPreview] = useState<DesktopDragPreview | null>(null)
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  const [gridRows, setGridRows] = useState(10)
  const [refreshing, setRefreshing] = useState(false)
  const { open } = useProcessActions()
  const { items, requestOpenInMediaPlayer, importFiles, refresh } = useDesktopFiles()
  const { positions, gridRef } = useDesktopLayout()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const selectionCleanupRef = useRef<(() => void) | null>(null)

  useImperativeHandle(ref, () => ({
    clearSelection(): void {
      selectionCleanupRef.current?.()
      setSelectedIconIds([])
      setDragPreview(null)
    },
  }))

  const setGridEl = useCallback((el: HTMLDivElement | null) => {
    if (!el)
      return
    desktopRef.current = el
    gridRef.current = el

    const computeRows = (): void => {
      const availableHeight = el.clientHeight - DESKTOP_PADDING * 2
      setGridRows(Math.max(1, Math.floor((availableHeight + ROW_GAP) / (CELL_HEIGHT + ROW_GAP))))
    }
    computeRows()
    const observer = new ResizeObserver(computeRows)
    observer.observe(el)

    return () => {
      observer.disconnect()
      gridRef.current = null
    }
  }, [gridRef])

  const iconEntries = useMemo<IconEntry[]>(() => {
    const apps: IconEntry[] = Object.entries(appDirectory)
      .filter(([, entry]) => entry.showOnDesktop)
      .map(([appId, entry]) => ({
        id: `app:${appId}`,
        label: entry.name,
        icon: <AppIcon appId={appId} size="lg" />,
        onOpen: () => open(appId as AppId),
      }))

    const files: IconEntry[] = items.map(item => ({
      id: item.id,
      label: item.name,
      icon: <img src={DESKTOP_MEDIA_ICON} alt="" className="w-8 h-8 pixelated shrink-0" draggable={false} />,
      onOpen: () => {
        requestOpenInMediaPlayer(item.id)
        open(APP_ID.MEDIA_PLAYER)
      },
    }))

    return [...apps, ...files]
  }, [items, open, requestOpenInMediaPlayer])

  // Only explicitly-placed (dragged) icons get grid positions; default icons
  // are CSS auto-placed via grid-auto-flow so they wrap responsively.
  // Out-of-bounds stored positions fall back to CSS auto-placement so they
  // never stack on top of each other (clamping would put two icons on one cell).
  const renderedPositions = useMemo<GridLayout>(() => {
    const next: GridLayout = {}
    iconEntries.forEach((entry) => {
      const stored = positions[entry.id]
      if (!stored)
        return
      if (gridRows > 0 && stored.row > gridRows)
        return
      next[entry.id] = stored
    })
    return next
  }, [iconEntries, positions, gridRows])

  const isRenderedCellOccupied = useCallback(
    (col: number, row: number, excludeIds?: string | readonly string[]): boolean => {
      const excluded = new Set(typeof excludeIds === 'string' ? [excludeIds] : excludeIds ?? [])
      return Object.entries(renderedPositions).some(
        ([id, pos]: [string, GridPosition]) => !excluded.has(id) && pos.col === col && pos.row === row,
      )
    },
    [renderedPositions],
  )

  const selectedIconIdSet = useMemo(() => new Set(selectedIconIds), [selectedIconIds])
  const dragPreviewIdSet = useMemo(() => new Set(dragPreview?.ids ?? []), [dragPreview])

  const getDesktopPoint = useCallback((clientX: number, clientY: number) => {
    const desktop = desktopRef.current
    if (!desktop)
      return null

    const rect = desktop.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    }
  }, [])

  const getIconIdsInSelection = useCallback((rect: SelectionRect): string[] => {
    const desktop = desktopRef.current
    if (!desktop)
      return []

    const desktopBounds = desktop.getBoundingClientRect()
    const box = getSelectionBox(rect)
    const selectedIds: string[] = []

    desktop.querySelectorAll<HTMLElement>('[data-file-id]').forEach((iconEl) => {
      const id = iconEl.dataset.fileId
      if (!id)
        return

      const iconBounds = iconEl.getBoundingClientRect()
      const iconRect = {
        left: iconBounds.left - desktopBounds.left,
        top: iconBounds.top - desktopBounds.top,
        right: iconBounds.right - desktopBounds.left,
        bottom: iconBounds.bottom - desktopBounds.top,
      }

      if (
        box.left < iconRect.right
        && box.left + box.width > iconRect.left
        && box.top < iconRect.bottom
        && box.top + box.height > iconRect.top
      ) {
        selectedIds.push(id)
      }
    })

    return selectedIds
  }, [])

  useEffect(() => () => selectionCleanupRef.current?.(), [])

  const handleIconSelect = useCallback(
    (id: string, additive: boolean, preserveSelectedGroup: boolean): void => {
      setSelectedIconIds((currentIds) => {
        if (additive) {
          if (currentIds.includes(id))
            return currentIds.filter(selectedId => selectedId !== id)
          return [...currentIds, id]
        }

        if (preserveSelectedGroup && currentIds.includes(id))
          return currentIds

        return [id]
      })
    },
    [],
  )

  const handleBackgroundPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 || event.target !== event.currentTarget)
      return

    event.preventDefault()
    selectionCleanupRef.current?.()

    const start = getDesktopPoint(event.clientX, event.clientY)
    if (!start)
      return

    const drag: SelectionDragState = {
      pointerId: event.pointerId,
      startX: start.x,
      startY: start.y,
      additive: event.ctrlKey || event.metaKey,
      baseSelectedIds: event.ctrlKey || event.metaKey ? selectedIconIds : [],
      moved: false,
    }
    setDragPreview(null)
    if (!drag.additive)
      setSelectedIconIds([])
    setSelectionRect({ startX: start.x, startY: start.y, currentX: start.x, currentY: start.y })

    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== drag.pointerId)
        return

      const current = getDesktopPoint(moveEvent.clientX, moveEvent.clientY)
      if (!current)
        return

      const nextRect = {
        startX: drag.startX,
        startY: drag.startY,
        currentX: current.x,
        currentY: current.y,
      }

      if (!drag.moved) {
        if (
          Math.abs(current.x - drag.startX) < SELECTION_THRESHOLD
          && Math.abs(current.y - drag.startY) < SELECTION_THRESHOLD
        ) {
          return
        }
        drag.moved = true
      }

      setSelectionRect(nextRect)
      const idsInSelection = getIconIdsInSelection(nextRect)
      setSelectedIconIds(
        drag.additive
          ? mergeSelectedIds(drag.baseSelectedIds, idsInSelection)
          : idsInSelection,
      )
    }

    function cleanup(): void {
      if (selectionCleanupRef.current !== cleanup)
        return
      selectionCleanupRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('blur', onAbort)
      document.removeEventListener('visibilitychange', onVisibility)
      setSelectionRect(null)
    }

    function onPointerUp(upEvent: PointerEvent): void {
      if (upEvent.pointerId !== drag.pointerId)
        return
      cleanup()
    }

    function onPointerCancel(cancelEvent: PointerEvent): void {
      if (cancelEvent.pointerId !== drag.pointerId)
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
    selectionCleanupRef.current = cleanup
  }

  const handleImportClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files
    if (files && files.length > 0) {
      void importFiles(Array.from(files))
    }
    event.target.value = ''
  }

  const handleRefresh = async (): Promise<void> => {
    selectionCleanupRef.current?.()
    setSelectedIconIds([])
    setDragPreview(null)
    setRefreshing(true)
    try {
      await refresh()
    }
    finally {
      setRefreshing(false)
    }
  }

  const selectionBox = selectionRect ? getSelectionBox(selectionRect) : null

  return (
    <ContextMenu container={desktopRef.current}>
      <ContextMenuTrigger onlyDirectTarget>
        <div
          ref={setGridEl}
          data-area="desktop"
          className="absolute inset-0"
          style={gridStyle}
          onPointerDown={handleBackgroundPointerDown}
        >
          {!refreshing && iconEntries.map((entry) => {
            const pos = renderedPositions[entry.id]
            return (
              <DesktopIcon
                key={entry.id}
                id={entry.id}
                icon={entry.icon}
                label={entry.label}
                col={pos?.col}
                row={pos?.row}
                selected={selectedIconIdSet.has(entry.id)}
                selectedIds={selectedIconIds}
                positions={renderedPositions}
                dragOffset={dragPreviewIdSet.has(entry.id) ? dragPreview?.offset ?? null : null}
                onSelect={handleIconSelect}
                onDragPreviewChange={setDragPreview}
                onOpen={entry.onOpen}
                isCellOccupied={isRenderedCellOccupied}
                menuContainer={desktopRef.current}
              />
            )
          })}
          {selectionBox && (selectionBox.width > SELECTION_THRESHOLD || selectionBox.height > SELECTION_THRESHOLD) && (
            <div
              className="absolute pointer-events-none z-20"
              style={{
                ...selectionBoxStyle,
                left: selectionBox.left,
                top: selectionBox.top,
                width: selectionBox.width,
                height: selectionBox.height,
              }}
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <Menu>
          <MenuItem reserveIconSpace onClick={handleRefresh}>Refresh</MenuItem>
          <MenuSeparator />
          <MenuItem reserveIconSpace onClick={handleImportClick}>Import files...</MenuItem>
        </Menu>
      </ContextMenuContent>
    </ContextMenu>
  )
}
