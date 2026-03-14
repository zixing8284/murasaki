import type { ThemeId } from 'murasaki-react98'

function PreviewTitleButton(): React.ReactElement {
  return <div className="w-[14px] h-[14px] shadow-raised bg-btn-face" />
}

export function ThemePreview({ themeId }: { themeId: ThemeId }): React.ReactElement {
  return (
    <div
      className="relative h-[220px] overflow-hidden border border-btn-dk-shadow bg-desktop"
      data-theme={themeId === 'windows-98' ? undefined : themeId}
    >
      {/* Desktop icon */}
      <div className="absolute top-3 left-3 flex flex-col items-center gap-0.5">
        <img
          src="/img/desktop/RecyclingBin.png"
          alt="Trash"
          className="w-8 h-8 pixelated"
        />
        <span className="text-[10px] text-center text-desktop-text">
          Trash
        </span>
      </div>

      {/* Inactive window */}
      <div className="absolute top-[35px] left-[70px] w-[260px] shadow-raised bg-btn-face">
        <div className="h-[18px] flex items-center px-1 text-[10px] font-bold bg-linear-to-r from-title-inactive to-title-inactive-gradient text-title-inactive-text">
          <span>Inactive Window</span>
          <div className="ml-auto flex gap-px">
            <PreviewTitleButton />
            <PreviewTitleButton />
            <PreviewTitleButton />
          </div>
        </div>
      </div>

      {/* Active window */}
      <div className="absolute top-[60px] left-[110px] w-[260px] shadow-raised bg-btn-face">
        {/* Active title bar */}
        <div className="h-[18px] flex items-center px-1 text-[10px] font-bold bg-linear-to-r from-title-active to-title-active-gradient text-title-active-text">
          <span className="font-bold">Active Window</span>
          <div className="ml-auto flex gap-px">
            <PreviewTitleButton />
            <PreviewTitleButton />
            <PreviewTitleButton />
          </div>
        </div>

        {/* Menu bar */}
        <div className="h-[16px] flex items-center gap-2 px-1 text-[10px] bg-menu-bg text-menu-text">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>

        {/* Content area with scrollbar */}
        <div className="p-0.5">
          <div className="h-[72px] flex border border-btn-shadow">
            <div className="flex-1 p-1 text-[10px] bg-window-bg text-window-text">
              Window Text
            </div>
            {/* Vertical scrollbar */}
            <div className="w-[14px] flex flex-col bg-scrollbar">
              <div className="h-[14px] shadow-raised bg-btn-face" />
              <div className="flex-1" />
              <div className="h-[14px] shadow-raised bg-btn-face" />
            </div>
          </div>
          {/* Horizontal scrollbar */}
          <div className="h-[14px] flex mt-px bg-scrollbar">
            <div className="w-[14px] shadow-raised bg-btn-face" />
            <div className="flex-1" />
            <div className="w-[14px] shadow-raised bg-btn-face" />
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-[24px] flex items-center px-0.5 shadow-raised bg-btn-face">
        <div className="h-[18px] px-1 flex items-center text-[10px] shadow-raised bg-btn-face text-btn-text">
          <span>Start</span>
        </div>
        <div className="flex-1" />
        <div className="h-[18px] px-2 flex items-center text-[10px] text-btn-text">
          12:56
        </div>
      </div>
    </div>
  )
}
