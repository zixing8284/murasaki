import type { ReactNode } from 'react'

interface DesktopIconProps {
  id: string
  icon: ReactNode
  label: string
  selected: boolean
  onSelect: (id: string) => void
  onOpen: () => void
}

export function DesktopIcon({ id, icon, label, selected, onSelect, onOpen }: DesktopIconProps): React.ReactElement {
  return (
    <div
      className="flex flex-col items-center gap-0.5 w-16 cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
    >
      <div className={selected ? 'brightness-50 sepia hue-rotate-180 saturate-200' : ''}>{icon}</div>

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
