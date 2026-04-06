import { Menu, MenuItem, MenuSeparator } from 'murasaki-react98'

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
        <div className="min-h-25 w-43.5 flex flex-row items-stretch">
          {/* Stripe */}
          <div className="bg-linear-to-b from-(--active-title) to-(--gradient-active-title) w-5.25 min-h-fit flex flex-col justify-end pb-4 shadow-(--shadow-raised)">
            <span className="text-(--title-text) -rotate-90 origin-center whitespace-nowrap text-xs">
              murasaki-react98
            </span>
          </div>
          {/* Menu Items */}
          <Menu className="flex-1 flex-col-reverse">
            <MenuItem icon={<img src="/img/startmenu/Programs.png" alt="" className="w-4 h-4 pixelated" draggable={false} />}>
              Programs
            </MenuItem>
            <MenuItem icon={<img src="/img/startmenu/Documents.png" alt="" className="w-4 h-4 pixelated" draggable={false} />}>
              Documents
            </MenuItem>
            <MenuItem icon={<img src="/img/startmenu/Settings.png" alt="" className="w-4 h-4 pixelated" draggable={false} />}>
              Settings
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={<img src="/img/startmenu/ShutDown.png" alt="" className="w-4 h-4 pixelated" draggable={false} />}>
              Shut Down...
            </MenuItem>
          </Menu>
        </div>
      </div>
    </>
  )
}
