import { useState } from 'react'
import { useClickAway } from '../../hooks/use-click-away'
import { DesktopIcon } from './desktop-icon'

const DESKTOP_ICONS = [
  { appId: 'notepad', label: 'Notepad', icon: '/img/desktop/Notepad.png' },
]

interface DesktopProps {
  onOpen: (appId: string) => void
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
      {DESKTOP_ICONS.map(iconConfig => (
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
