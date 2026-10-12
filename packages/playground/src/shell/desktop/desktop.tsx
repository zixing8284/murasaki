import type { ChangeEvent, CSSProperties, ReactElement, Ref } from 'react'
import type { GridLayout, GridPosition } from '../../contexts/desktop-layout/storage'
import type { DesktopDragPreview } from './use-desktop-icon-drag'
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@murasaki-io/react98'
import { useCallback, useImperativeHandle, useRef, useState } from 'react'
import { useDesktopFiles } from '../../contexts/desktop-files/hooks'
import { CELL_HEIGHT, CELL_WIDTH, COLUMN_GAP, DESKTOP_PADDING, ROW_GAP } from '../../contexts/desktop-layout/context'
import { resolveDesktopLayout } from '../../contexts/desktop-layout/grid-math'
import { useDesktopLayout } from '../../contexts/desktop-layout/hooks'
import { APP_ID } from '../../contexts/process/directory'
import { useProcessActions } from '../../contexts/process/hooks'
import { DesktopContextMenuContent } from './desktop-context-menu'
import { DesktopIcon } from './desktop-icon'
import { useDesktopGridRows } from './use-desktop-grid-rows'
import { useDesktopIconEntries } from './use-desktop-icon-entries'
import { getSelectionBox, SELECTION_THRESHOLD, useDesktopSelection } from './use-desktop-selection'

export interface DesktopHandle {
  clearSelection: () => void
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

export function Desktop({ ref }: { ref?: Ref<DesktopHandle> }): ReactElement {
  const [dragPreview, setDragPreview] = useState<DesktopDragPreview | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { open } = useProcessActions()
  const { importFiles, refresh } = useDesktopFiles()
  const { positions, gridRef } = useDesktopLayout()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { desktopRef, desktopEl, gridRows, setGridEl } = useDesktopGridRows(gridRef)

  const clearDragPreview = useCallback(() => setDragPreview(null), [])
  const { selectedIconIds, setSelectedIconIds, selectionRect, handleIconSelect } = useDesktopSelection({
    desktopRef,
    desktopEl,
    clearDragPreview,
  })

  useImperativeHandle(ref, () => ({
    clearSelection(): void {
      setSelectedIconIds([])
      setDragPreview(null)
    },
  }))

  const iconEntries = useDesktopIconEntries()

  // Every icon is assigned a concrete, collision-free grid cell up front:
  // dragged icons keep their stored position, the rest are auto-placed
  // column-first. Because positions are fully known in JS, occupancy checks are
  // exact and dragging one icon never reflows the others — a vacated cell simply
  // stays empty, matching the classic Windows desktop.
  const resolvedLayout: GridLayout = resolveDesktopLayout(
    iconEntries.map(entry => entry.id),
    positions,
    gridRows,
  )

  const isCellOccupied = (
    col: number,
    row: number,
    excludeIds?: string | readonly string[],
  ): boolean => {
    const excluded = new Set(typeof excludeIds === 'string' ? [excludeIds] : excludeIds ?? [])
    return Object.entries(resolvedLayout).some(
      ([id, pos]: [string, GridPosition]) => !excluded.has(id) && pos.col === col && pos.row === row,
    )
  }

  const selectedIconIdSet = new Set(selectedIconIds)
  const dragPreviewIdSet = new Set(dragPreview?.ids ?? [])

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
    setSelectedIconIds([])
    setDragPreview(null)
    setRefreshing(true)
    try {
      await refresh()
    }
    catch {
      // refresh error is non-critical
    }
    setRefreshing(false)
  }

  const selectionBox = selectionRect ? getSelectionBox(selectionRect) : null

  return (
    <ContextMenu container={desktopEl}>
      <ContextMenuTrigger onlyDirectTarget>
        <div
          ref={setGridEl}
          data-area="desktop"
          className="absolute inset-0"
          style={gridStyle}
        >
          {!refreshing && iconEntries.map((entry) => {
            const pos = resolvedLayout[entry.id]
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
                positions={resolvedLayout}
                dragOffset={dragPreviewIdSet.has(entry.id) ? dragPreview?.offset ?? null : null}
                onSelect={handleIconSelect}
                onDragPreviewChange={setDragPreview}
                onOpen={entry.onOpen}
                onPreload={entry.onPreload}
                isCellOccupied={isCellOccupied}
                menuContainer={desktopEl}
              />
            )
          })}
          {selectionBox && (selectionBox.width > SELECTION_THRESHOLD || selectionBox.height > SELECTION_THRESHOLD) && (
            <div
              // No positive z-index: the marquee stays on the desktop layer,
              // below the windows (which use positive stack-order z-indexes).
              className="absolute pointer-events-none"
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
            aria-hidden="true"
            onChange={handleFileInputChange}
          />
        </div>
      </ContextMenuTrigger>
      <DesktopContextMenuContent
        onNewTextDocument={() => open(APP_ID.NOTEPAD)}
        onRefresh={handleRefresh}
        onImport={handleImportClick}
        onProperties={() => open(APP_ID.DISPLAY_PROPERTIES)}
      />
    </ContextMenu>
  )
}
