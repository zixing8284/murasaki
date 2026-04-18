import { useState } from 'react'
import { useDesktopFiles } from '../../contexts/desktop-files'
import { APP_ID, appDirectory, useProcessActions } from '../../contexts/process'
import { useClickAway } from '../../hooks/use-click-away'
import { AppIcon } from '../app-icon'
import { DesktopIcon } from './desktop-icon'

const appDesktopIcons = Object.entries(appDirectory)
  .filter(([, entry]) => entry.showOnDesktop)
  .map(([appId, entry]) => ({
    id: `app:${appId}`,
    label: entry.name,
    appId: appId as keyof typeof appDirectory,
  }))

const DESKTOP_MEDIA_ICON = '/img/desktop/MyDocuments.png'

export function Desktop(): React.ReactElement {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const { open } = useProcessActions()
  const { items, requestOpenInMediaPlayer } = useDesktopFiles()
  const iconContainerRef = useClickAway<HTMLDivElement>(() => {
    setSelectedIconId(null)
  })

  return (
    <div
      ref={iconContainerRef}
      data-area="desktop"
      className="absolute top-2 left-2 flex flex-col gap-4"
    >
      {appDesktopIcons.map(iconConfig => (
        <DesktopIcon
          key={iconConfig.id}
          id={iconConfig.id}
          icon={<AppIcon appId={iconConfig.appId} size="lg" />}
          label={iconConfig.label}
          selected={selectedIconId === iconConfig.id}
          onSelect={setSelectedIconId}
          onOpen={() => open(iconConfig.appId)}
        />
      ))}

      {items.map(item => (
        <DesktopIcon
          key={item.id}
          id={item.id}
          icon={<img src={DESKTOP_MEDIA_ICON} alt="" className="w-8 h-8 pixelated shrink-0" draggable={false} />}
          label={item.name}
          selected={selectedIconId === item.id}
          onSelect={setSelectedIconId}
          onOpen={() => {
            requestOpenInMediaPlayer(item.id)
            open(APP_ID.MEDIA_PLAYER)
          }}
        />
      ))}
    </div>
  )
}
