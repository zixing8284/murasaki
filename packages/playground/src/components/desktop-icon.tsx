interface DesktopIconProps {
  appId: string
  label: string
  icon: string
  selected: boolean
  onSelect: (appId: string) => void
  onOpen: (appId: string) => void
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
      <div className="relative w-8 h-8">
        <img
          src={icon}
          alt={label}
          className="w-8 h-8 pixelated"
          draggable={false}
        />
        {selected && (
          <div className="absolute inset-0 desktop-icon-dither" />
        )}
      </div>

      <span
        className={
          selected
            ? 'text-[11px] text-center leading-tight px-0.5 bg-[rgb(10,36,106)] text-white outline-dotted outline-1 outline-white'
            : 'text-[11px] text-center leading-tight px-0.5 text-white'
        }
      >
        {label}
      </span>
    </div>
  )
}
