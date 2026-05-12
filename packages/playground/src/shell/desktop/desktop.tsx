import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { GridLayout } from '../../contexts/desktop-layout'
import type { AppId } from '../../contexts/process'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from '@murasaki/react98'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useDesktopFiles } from '../../contexts/desktop-files'
import { CELL_HEIGHT, CELL_WIDTH, COLUMN_GAP, DESKTOP_PADDING, ROW_GAP, useDesktopLayout } from '../../contexts/desktop-layout'
import { APP_ID, appDirectory, useProcessActions } from '../../contexts/process'
import { assetPath } from '../../lib/asset-path'
import { AppIcon } from '../app-icon'
import { DesktopIcon } from './desktop-icon'

const DESKTOP_MEDIA_ICON = assetPath('/img/desktop/MyDocuments.png')

interface IconEntry {
  id: string
  label: string
  icon: React.ReactNode
  onOpen: () => void
}

const gridStyle: React.CSSProperties = {
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

export function Desktop(): React.ReactElement {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const { open } = useProcessActions()
  const { items, requestOpenInMediaPlayer, importFiles } = useDesktopFiles()
  const { positions, getDefaultPosition, gridRef } = useDesktopLayout()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)

  const setGridEl = useCallback((el: HTMLDivElement | null) => {
    desktopRef.current = el
    gridRef.current = el
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

  const renderedPositions = useMemo<GridLayout>(() => {
    const next: GridLayout = {}

    iconEntries.forEach((entry, index) => {
      next[entry.id] = positions[entry.id] ?? getDefaultPosition(index)
    })

    return next
  }, [iconEntries, positions, getDefaultPosition])

  const isRenderedCellOccupied = useCallback(
    (col: number, row: number, excludeId?: string): boolean =>
      Object.entries(renderedPositions).some(
        ([id, pos]) => id !== excludeId && pos.col === col && pos.row === row,
      ),
    [renderedPositions],
  )

  const handleBackgroundPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      setSelectedIconId(null)
    }
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

  const handleRefresh = (): void => {
    setSelectedIconId(null)
  }

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
          {iconEntries.map((entry, index) => {
            const pos = renderedPositions[entry.id] ?? getDefaultPosition(index)
            return (
              <DesktopIcon
                key={entry.id}
                id={entry.id}
                icon={entry.icon}
                label={entry.label}
                col={pos.col}
                row={pos.row}
                selected={selectedIconId === entry.id}
                onSelect={setSelectedIconId}
                onOpen={entry.onOpen}
                isCellOccupied={isRenderedCellOccupied}
                menuContainer={desktopRef.current}
              />
            )
          })}
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
