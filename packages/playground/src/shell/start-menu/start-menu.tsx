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
        <div className="bg-[silver] min-h-25 w-43.5 shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_grey,inset_2px_2px_#fff] flex flex-row items-stretch p-0.5">
          {/* Stripe */}
          <div className="bg-linear-to-b from-[navy] to-[#1084d0] w-5.25 min-h-fit flex flex-col justify-end pb-4">
            <span className="text-white -rotate-90 origin-center whitespace-nowrap text-xs">
              murasaki-react98
            </span>
          </div>
          {/* Menu Items */}
          <div className="flex-1 flex flex-col-reverse items-stretch">
            <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
              <span className="flex-1">Programs</span>
            </div>
            <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
              <span className="flex-1">Documents</span>
            </div>
            <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
              <span className="flex-1">Settings</span>
            </div>
            <div className="border-b border-white border-t border-t-gray-500 m-0.5" />
            <div className="flex flex-row items-center p-[4px_6px] m-[1px_0] cursor-pointer hover:bg-[navy] hover:text-white">
              <span className="flex-1">Shut Down...</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
