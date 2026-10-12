import type { ReactNode } from 'react'
import { useDesktopFiles } from '../../contexts/desktop-files/hooks'
import { RECYCLE_BIN_PATH, useFolderChildren } from '../../contexts/file-system'
import { APP_ID, getDesktopApps, preloadApp } from '../../contexts/process/directory'
import { useProcessActions } from '../../contexts/process/hooks'
import { assetPath } from '../../lib/asset-path'
import { ICON } from '../../lib/icons'
import { DESKTOP_MEDIA_ICON as DESKTOP_MEDIA_ICON_PATH } from '../../lib/playground-assets'
import { AppIcon } from '../app-icon'

export interface IconEntry {
  id: string
  label: string
  icon: ReactNode
  onOpen: () => void
  onPreload?: () => void
}

const DESKTOP_MEDIA_ICON = assetPath(DESKTOP_MEDIA_ICON_PATH)

/**
 * Builds the ordered list of desktop icons: registry apps first (in registry
 * order), then the Recycle Bin, then user-imported media files. Each entry
 * carries its label, glyph, open action, and optional preload hint; the desktop
 * assigns their grid cells separately via `resolveDesktopLayout`.
 */
export function useDesktopIconEntries(): IconEntry[] {
  const { open } = useProcessActions()
  const { items, requestOpenInMediaPlayer } = useDesktopFiles()
  const { children: recycleBinChildren } = useFolderChildren(RECYCLE_BIN_PATH)

  const apps: IconEntry[] = getDesktopApps().map(app => ({
    id: `app:${app.appId}`,
    label: app.label,
    icon: <AppIcon appId={app.appId} size="lg" />,
    onOpen: () => open(app.appId),
    onPreload: () => preloadApp(app.appId),
  }))

  const files: IconEntry[] = items.map(item => ({
    id: item.id,
    label: item.name,
    icon: <img src={DESKTOP_MEDIA_ICON} alt="" className="size-8 pixelated shrink-0" draggable={false} />,
    onOpen: () => {
      requestOpenInMediaPlayer(item.id)
      open(APP_ID.MEDIA_PLAYER)
    },
  }))

  const recycleBin: IconEntry = {
    id: 'recycle-bin',
    label: 'Recycle Bin',
    icon: (
      <img
        src={assetPath(recycleBinChildren.length > 0 ? ICON.recycleBinFull.lg : ICON.recycleBin.lg)}
        alt=""
        className="size-8 pixelated shrink-0"
        draggable={false}
      />
    ),
    onOpen: () => open(APP_ID.MY_DOCUMENTS, { launch: { path: RECYCLE_BIN_PATH } }),
  }

  return [...apps, recycleBin, ...files]
}
