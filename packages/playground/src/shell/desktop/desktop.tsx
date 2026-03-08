import type { AppId } from '../../contexts/process'
import { useState } from 'react'
import { processDirectory } from '../../contexts/process'
import { DEFAULT_ICON } from '../../contexts/process/directory'
import { useClickAway } from '../../hooks/use-click-away'
import { DesktopIcon } from './desktop-icon'

const desktopIcons = Object.entries(processDirectory)
  .filter(([, entry]) => entry.showOnDesktop)
  .map(([appId, entry]) => ({
    appId: appId as AppId,
    label: entry.name,
    icon: entry.defaultIcon ?? DEFAULT_ICON,
  }))

interface DesktopProps {
  onOpen: (appId: AppId) => void
}

export function Desktop({ onOpen }: DesktopProps): React.ReactElement {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)
  const iconContainerRef = useClickAway<HTMLDivElement>(() => {
    setSelectedIconId(null)
  })

  return (
    <div
      ref={iconContainerRef}
      className="absolute top-2 left-2 flex flex-col gap-4"
    >
      {desktopIcons.map(iconConfig => (
        <DesktopIcon
          key={iconConfig.appId}
          {...iconConfig}
          selected={selectedIconId === iconConfig.appId}
          onSelect={setSelectedIconId}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
