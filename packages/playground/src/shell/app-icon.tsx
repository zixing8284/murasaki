import type { AppId } from '../contexts/process'
import { appDirectory, DEFAULT_ICON } from '../contexts/process'

const sizeClass = {
  sm: 'w-4 h-4',
  lg: 'w-8 h-8',
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
    <img
      src={src}
      alt=""
      className={`${sizeClass[size]} pixelated shrink-0${className ? ` ${className}` : ''}`}
      draggable={false}
    />
  )
}
