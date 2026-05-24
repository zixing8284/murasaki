import type { StartupPreloadState } from './use-startup-preload'
import { ProgressIndicator } from '@murasaki/react98'
import { STARTUP_ARTWORK_DATA_URL } from './startup-artwork-data'

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
  const progressLabel = preload.total > 0
    ? `${preload.loaded} of ${preload.total} files`
    : 'Scanning startup files'
  const status = waitingForDesktopFiles
    ? 'Preparing desktop files...'
    : fileLabel(preload.currentAsset)

  return (
    <div className="flex h-full w-full cursor-wait items-center justify-center bg-(--background) px-4 py-6 text-(--button-text)">
      <div className="w-full max-w-107.5 bg-(--button-face) shadow-(--shadow-raised)">
        <div className="p-1">
          <div className="mb-3 shadow-(--shadow-sunken)">
            <div className="relative">
              <img
                alt=""
                className="block aspect-video w-full object-cover"
                decoding="sync"
                draggable={false}
                src={STARTUP_ARTWORK_DATA_URL}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
              />
            </div>
          </div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="min-w-0 flex-1">
              <div className="font-bold">Starting up...</div>
              <div className="truncate text-(--gray-text) p-0.5" aria-live="polite">{status}</div>
            </div>
            <div className="shrink-0 text-right font-bold">
              {percent}
              %
            </div>
          </div>

          <ProgressIndicator
            aria-label="Startup progress"
            className="h-5"
            hideValue
            value={percent}
            variant="tile"
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-(--button-text) px-1">
            <span className="truncate">{progressLabel}</span>
            <span className="shrink-0">Please wait...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
