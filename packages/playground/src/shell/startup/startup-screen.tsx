import type { StartupPreloadState } from './use-startup-preload'

interface StartupScreenProps {
  preload: StartupPreloadState
  waitingForDesktopFiles: boolean
}

function fileLabel(path: string | null): string {
  if (!path)
    return 'Loading system resources...'
  return path.slice(path.lastIndexOf('/') + 1) || path
}

/**
 * Windows 98-style "Starting up..." panel shown while the playground
 * warms its critical icon/image cache before mounting the desktop.
 */
export function StartupScreen({ preload, waitingForDesktopFiles }: StartupScreenProps): React.ReactElement {
  const percent = preload.total > 0
    ? Math.min(100, Math.round((preload.loaded / preload.total) * 100))
    : 0
  const status = waitingForDesktopFiles
    ? 'Preparing desktop files...'
    : fileLabel(preload.currentAsset)

  return (
    <div className="flex h-full w-full items-center justify-center bg-(--background) text-(--desktop-text)">
      <div className="w-[min(22rem,calc(100%-2rem))] bg-(--button-face) p-3 shadow-(--shadow-raised)">
        <div className="mb-2 flex items-center gap-2">
          <div className="grid size-8 shrink-0 place-items-center bg-(--window) shadow-(--shadow-sunken)">
            <span className="font-bold text-(--active-title)">98</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-(--button-text)">Starting up...</div>
            <div className="truncate text-(--gray-text)" aria-live="polite">{status}</div>
          </div>
        </div>
        <div
          className="h-4 bg-(--window) p-px shadow-(--shadow-sunken)"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className="h-full bg-(--hilight) transition-[width] duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-(--button-text)">
          <span>
            {preload.loaded}
            /
            {preload.total}
          </span>
          <span>
            {percent}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
