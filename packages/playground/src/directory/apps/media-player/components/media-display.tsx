import type { ReactElement } from 'react'
import { assetPath } from '../../../../lib/asset-path'
import { MEDIA_PLAYER_EMPTY_BACKGROUND } from '../../../../lib/playground-assets'

const EMPTY_STATE_ICON_SRC = assetPath(MEDIA_PLAYER_EMPTY_BACKGROUND)
const EMPTY_CAPTIONS_TRACK_SRC = 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A'

interface MediaDisplayProps {
  hasVideo: boolean
  forceAspectRatio: boolean
  mediaRefCallback: (element: HTMLVideoElement | null) => void
  onTogglePlay: () => void
  onToggleFullscreen: () => void
}

export function MediaDisplay({
  hasVideo,
  forceAspectRatio,
  mediaRefCallback,
  onTogglePlay,
  onToggleFullscreen,
}: MediaDisplayProps): ReactElement {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Play or pause"
      className="relative flex-1 min-h-20 bg-black shadow-(--shadow-sunken) flex items-center justify-center min-w-0 overflow-hidden"
      onClick={onTogglePlay}
      onDoubleClick={onToggleFullscreen}
      onKeyDown={(e) => {
        // Space is toggled play/pause by the window-level shortcut hook so it
        // works regardless of where focus sits inside the window; handle only
        // Enter here to activate the focused video button without swallowing
        // Space (which would suppress the global play/pause shortcut).
        if (e.key === 'Enter') {
          e.preventDefault()
          onTogglePlay()
        }
      }}
    >
      <video
        ref={mediaRefCallback}
        aria-label="Media player video"
        className={`max-w-full max-h-full p-1 object-contain${forceAspectRatio ? ' aspect-video' : ''}${hasVideo ? '' : ' hidden'}`}
        crossOrigin="anonymous"
        playsInline
      >
        <track
          default
          kind="captions"
          label="Empty captions"
          src={EMPTY_CAPTIONS_TRACK_SRC}
          srcLang="en"
        />
      </video>
      {hasVideo
        ? null
        : (
            <img
              src={EMPTY_STATE_ICON_SRC}
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none pixelated w-40 max-w-[72%] h-auto"
            />
          )}
    </div>
  )
}
