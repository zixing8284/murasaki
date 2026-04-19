import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  MenuSeparator,
} from 'murasaki-react98'
import { useMemo, useRef, useState } from 'react'
import { useDesktopFiles } from '../../contexts/desktop-files'
import { useDesktopLayout } from '../../contexts/desktop-layout'
import { appDirectory, APP_ID, type AppId, useProcessActions } from '../../contexts/process'
import { AppIcon } from '../app-icon'
import { DesktopIcon } from './desktop-icon'

const DESKTOP_MEDIA_ICON = '/img/desktop/MyDocuments.png'

const CheckGlyph = (): React.ReactElement => (
  <span aria-hidden="true">✓</span>
)

interface IconEntry {
  id: string
  label: string
  icon: React.ReactNode
  onOpen: () => void
}

export function Desktop(): React.ReactElement {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const { open } = useProcessActions()
  const { items, requestOpenInMediaPlayer, importFiles } = useDesktopFiles()
  const { positions, alignToGrid, setAlignToGrid, getDefaultPosition } = useDesktopLayout()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)

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
    // Classic Windows "Refresh" is a visual no-op here; clearing selection
    // gives immediate feedback without touching persistent state.
    setSelectedIconId(null)
  }

  return (
    <ContextMenu container={desktopRef.current}>
      <ContextMenuTrigger onlyDirectTarget>
        <div
          ref={desktopRef}
          data-area="desktop"
          className="absolute inset-0"
          onPointerDown={handleBackgroundPointerDown}
        >
          {iconEntries.map((entry, index) => {
            const pos = positions[entry.id] ?? getDefaultPosition(index)
            return (
              <DesktopIcon
                key={entry.id}
                id={entry.id}
                icon={entry.icon}
                label={entry.label}
                x={pos.x}
                y={pos.y}
                selected={selectedIconId === entry.id}
                onSelect={setSelectedIconId}
                onOpen={entry.onOpen}
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
          <MenuItem
            icon={alignToGrid ? <CheckGlyph /> : null}
            reserveIconSpace
            onClick={() => setAlignToGrid(!alignToGrid)}
          >
            Align to grid
          </MenuItem>
          <MenuSeparator />
          <MenuItem reserveIconSpace onClick={handleRefresh}>Refresh</MenuItem>
          <MenuSeparator />
          <MenuItem reserveIconSpace onClick={handleImportClick}>Import files...</MenuItem>
        </Menu>
      </ContextMenuContent>
    </ContextMenu>
  )
}
