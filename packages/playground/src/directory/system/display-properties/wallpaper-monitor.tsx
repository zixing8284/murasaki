import type { WallpaperMode } from '../../../lib/wallpapers'

interface WallpaperMonitorProps {
  wallpaperSrc: string | null
  wallpaperMode: WallpaperMode
  screenColor: string
}

export function WallpaperMonitor({ wallpaperSrc, wallpaperMode, screenColor }: WallpaperMonitorProps): React.ReactElement {
  return (
    <div className="relative inline-block pb-[26px]">
      <div className="relative">
        <div
          className="relative z-1 box-border h-[155px] w-[195px] overflow-hidden p-3 bg-(--button-face) shadow-[1px_1px_0_1px_var(--button-dk-shadow)]"
          style={{
            borderTop: '4px solid var(--button-hilight)',
            borderLeft: '4px solid var(--button-hilight)',
            borderRight: '4px solid var(--button-shadow)',
            borderBottom: '4px solid var(--button-shadow)',
            outline: '1px dotted var(--button-face)',
            outlineOffset: '-3px',
          }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ outline: '1px dotted var(--button-face)' }} />

          <div className="relative size-full overflow-hidden" style={{ backgroundColor: screenColor }}>
            {wallpaperSrc
              ? wallpaperMode === 'tiled'
                ? (
                    <div
                      className="size-full bg-repeat bg-left-top"
                      style={{ backgroundImage: `url(${wallpaperSrc})` }}
                    />
                  )
                : wallpaperMode === 'centered'
                  ? (
                      <div className="flex size-full items-center justify-center">
                        <img
                          src={wallpaperSrc}
                          alt="Wallpaper preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )
                  : (
                      <img
                        src={wallpaperSrc}
                        alt="Wallpaper preview"
                        className="size-full object-cover"
                      />
                    )
              : null}
          </div>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1 right-3 inline-block h-[4px] w-[10px]"
            style={{
              borderTop: '2px solid #4d9046',
              borderBottom: '2px solid #07ff00',
            }}
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[calc(100%+2px)] h-[10px] w-1/2 -translate-x-1/2 bg-(--button-face)"
          style={{
            borderLeft: '2px solid var(--button-hilight)',
            borderBottom: '2px solid var(--button-dk-shadow)',
            borderRight: '2px solid var(--button-dk-shadow)',
            boxShadow: 'inset 0 0 0 2px var(--button-shadow)',
          }}
        >
          <div
            className="absolute left-1/2 top-[calc(100%+2px)] h-[8px] w-[80%] -translate-x-1/2 bg-(--button-face)"
            style={{
              borderLeft: '2px solid var(--button-hilight)',
              borderRight: '2px solid var(--button-dk-shadow)',
              boxShadow: 'inset 0 0 0 2px var(--button-shadow)',
            }}
          />
          <div
            className="absolute left-1/2 top-[calc(100%+8px)] h-[4px] w-[150%] -translate-x-1/2 bg-(--button-face)"
            style={{
              border: '2px solid var(--button-shadow)',
              borderBottom: 'none',
              boxShadow: 'inset 1px 1px 0 1px var(--button-hilight), 1px 1px 0 1px var(--button-dk-shadow)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
