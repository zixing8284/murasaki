import type { AppId } from '../../contexts/process'

interface DesktopIconProps {
  appId: AppId
  label: string
  icon: string
  selected: boolean
  onSelect: (appId: string) => void
  onOpen: (appId: AppId) => void
}

export function DesktopIcon({ appId, label, icon, selected, onSelect, onOpen }: DesktopIconProps): React.ReactElement {
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
      <img
        src={icon}
        alt={label}
        className={`w-8 h-8 pixelated ${selected ? 'brightness-50 sepia hue-rotate-180 saturate-200' : ''}`}
        draggable={false}
      />

      <span
        className={
          selected
            ? 'text-[11px] text-center leading-tight px-0.5 bg-selection text-selection-text outline-dotted outline-1 outline-selection-text'
            : 'text-[11px] text-center leading-tight px-0.5 text-desktop-text'
        }
      >
        {label}
      </span>
    </div>
  )
}
