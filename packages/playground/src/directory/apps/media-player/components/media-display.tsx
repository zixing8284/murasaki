import type { JSX } from 'react'
import { EMPTY_CAPTIONS_TRACK_SRC, EMPTY_STATE_ICON_SRC } from '../media-player-constants'

interface MediaDisplayProps {
  hasVideo: boolean
  mediaRefCallback: (element: HTMLVideoElement | null) => void
  onVideoClick: () => void
  onVideoDoubleClick: () => void
}

export function MediaDisplay({
  hasVideo,
  mediaRefCallback,
  onVideoClick,
  onVideoDoubleClick,
}: MediaDisplayProps): JSX.Element {
  return (
    <div
      className="relative flex-1 min-h-20 bg-black shadow-(--shadow-sunken) flex items-center justify-center min-w-0 overflow-hidden"
      onClick={onVideoClick}
      onDoubleClick={onVideoDoubleClick}
    >
      <video
        ref={mediaRefCallback}
        className={`max-w-full max-h-full p-1 object-contain aspect-video${hasVideo ? '' : ' hidden'}`}
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
