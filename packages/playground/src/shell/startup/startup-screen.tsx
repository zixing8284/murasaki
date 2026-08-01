import type { StartupPreloadState } from './use-startup-preload'
import { ProgressIndicator } from '@murasaki-io/react98'
import { assetPath } from '../../lib/asset-path'
import { STARTUP_ARTWORK_DATA_URL } from './startup-artwork-data'

/**
 * Hidden elements that force the browser to fetch system cursor files eagerly.
 * Browsers only load `.cur` resources when a CSS rule referencing them is
 * applied to a rendered element — defining the URL in a stylesheet alone is
 * not enough.  This block is removed once the desktop takes over.
 */
const CURSOR_PRELOADS = [
  { path: '/cursor/working.cur', fallback: 'progress' },
  { path: '/cursor/busy.cur', fallback: 'wait' },
  { path: '/cursor/normal.cur', fallback: 'default' },
  { path: '/cursor/link.cur', fallback: 'pointer' },
  { path: '/cursor/help.cur', fallback: 'help' },
  { path: '/cursor/text.cur', fallback: 'text' },
  { path: '/cursor/not-allowed.cur', fallback: 'not-allowed' },
  { path: '/cursor/ew-resize.cur', fallback: 'ew-resize' },
  { path: '/cursor/nwse-resize.cur', fallback: 'nwse-resize' },
] as const

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
    <div className="flex size-full cursor-wait items-center justify-center bg-(--background) px-4 py-6 text-(--button-text)">
      {/* Force browser to fetch .cur files while the splash is visible. */}
      {CURSOR_PRELOADS.map(c => (
        <span
          key={c.path}
          aria-hidden
          className="pointer-events-none fixed size-px opacity-0"
          style={{ cursor: `url("${assetPath(c.path)}"), ${c.fallback}` }}
        />
      ))}
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
              <div className="font-bold">Starting up…</div>
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
            <span className="shrink-0">Please wait…</span>
          </div>
        </div>
      </div>
    </div>
  )
}
