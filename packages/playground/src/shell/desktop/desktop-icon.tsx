import type { AppId } from '../../contexts/process'
import { AppIcon } from '../app-icon'

interface DesktopIconProps {
  appId: AppId
  label: string
  selected: boolean
  onSelect: (appId: string) => void
  onOpen: (appId: AppId) => void
}

export function DesktopIcon({ appId, label, selected, onSelect, onOpen }: DesktopIconProps): React.ReactElement {
  return (
    <div
      className="flex flex-col items-center gap-0.5 w-16 cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation()
        onSelect(appId)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onOpen(appId)
      }}
    >
      <AppIcon
        appId={appId}
        size="lg"
        className={selected ? 'brightness-50 sepia hue-rotate-180 saturate-200' : ''}
      />

      <span
        className={
          selected
            ? 'text-[11px] text-center leading-tight px-0.5 bg-(--hilight) text-(--hilight-text) outline-dotted outline-1 outline-(--hilight-text)'
            : 'text-[11px] text-center leading-tight px-0.5 text-(--desktop-text)'
        }
      >
        {label}
      </span>
    </div>
  )
}
