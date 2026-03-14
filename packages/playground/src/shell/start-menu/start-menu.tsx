interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps): React.ReactElement {
  return (
    <>
      {/* Overlay to close menu on outside click */}
      <div
        className="absolute inset-0 z-246"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div className="absolute bottom-7.5 left-0 z-247">
        <div className="bg-menu-bg min-h-25 w-43.5 shadow-raised flex flex-row items-stretch p-0.5">
          {/* Stripe */}
          <div className="bg-linear-to-b from-title-active to-title-active-gradient w-5.25 min-h-fit flex flex-col justify-end pb-4">
            <span className="text-title-active-text -rotate-90 origin-center whitespace-nowrap text-xs">
              murasaki-react98
            </span>
          </div>
          {/* Menu Items */}
          <div className="flex-1 flex flex-col-reverse items-stretch">
            <div className="flex flex-row items-center gap-2 p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-selection hover:text-selection-text">
              <img src="/img/startmenu/Programs.png" alt="" className="w-4 h-4 pixelated shrink-0" draggable={false} />
              <span className="flex-1">Programs</span>
            </div>
            <div className="flex flex-row items-center gap-2 p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-selection hover:text-selection-text">
              <img src="/img/startmenu/Documents.png" alt="" className="w-4 h-4 pixelated shrink-0" draggable={false} />
              <span className="flex-1">Documents</span>
            </div>
            <div className="flex flex-row items-center gap-2 p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-selection hover:text-selection-text">
              <img src="/img/startmenu/Settings.png" alt="" className="w-4 h-4 pixelated shrink-0" draggable={false} />
              <span className="flex-1">Settings</span>
            </div>
            <div className="border-b border-btn-hilight border-t border-t-btn-shadow m-0.5" />
            <div className="flex flex-row items-center gap-2 p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-selection hover:text-selection-text">
              <img src="/img/startmenu/ShutDown.png" alt="" className="w-4 h-4 pixelated shrink-0" draggable={false} />
              <span className="flex-1">Shut Down...</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
