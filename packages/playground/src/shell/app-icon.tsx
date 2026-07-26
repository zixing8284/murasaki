import type { AppId } from '../contexts/process/directory'
import appDirectory, { DEFAULT_ICON } from '../contexts/process/directory'
import { assetPath } from '../lib/asset-path'

const sizeClass = {
  sm: 'size-4',
  lg: 'size-8',
} as const

const shortcutOverlay = {
  sm: '/icons/overlay-shortcut-16.png',
  lg: '/icons/overlay-shortcut-32.png',
} as const

interface AppIconProps {
  appId: AppId | (string & {})
  size: 'sm' | 'lg'
  className?: string
}

export function AppIcon({ appId, size, className }: AppIconProps): React.ReactElement {
  const entry = appDirectory[appId as AppId]
  const icon = entry?.icon ?? DEFAULT_ICON
  const src = icon[size]

  return (
    <div className={`relative ${sizeClass[size]} shrink-0${className ? ` ${className}` : ''}`}>
      <img
        src={assetPath(src)}
        alt=""
        className={`${sizeClass[size]} pixelated`}
        draggable={false}
      />
      {entry?.shortcut && (
        <img
          src={assetPath(shortcutOverlay[size])}
          alt=""
          className="absolute bottom-0 left-0 pointer-events-none pixelated"
          draggable={false}
        />
      )}
    </div>
  )
}
