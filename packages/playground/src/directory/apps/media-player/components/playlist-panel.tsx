import type { JSX, RefObject } from 'react'
import type { Track } from '../use-media-player'
import { SunkenPanel } from '@murasaki/react98'
import { formatTime } from '../format-time'
import { NowPlayingIndicator } from './now-playing-indicator'

interface PlaylistPanelProps {
  visible: boolean
  playlist: Track[]
  currentTrackId: string | undefined
  isPlaying: boolean
  loading: boolean
  activeItemRef: RefObject<HTMLDivElement | null>
  onPlayTrack: (track: Track) => void
}

export function PlaylistPanel({
  visible,
  playlist,
  currentTrackId,
  isPlaying,
  loading,
  activeItemRef,
  onPlayTrack,
}: PlaylistPanelProps): JSX.Element {
  return (
    <div className={`grid transition-[grid-template-rows] duration-100 ease-in-out ${visible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="min-h-0 overflow-hidden">
        <SunkenPanel className="h-40 overflow-y-auto bg-(--window)">
          {playlist.map((track) => {
            const isActive = currentTrackId === track.id
            const isNowPlaying = isActive && isPlaying
            const isLoading = isActive && loading

            return (
              <div
                key={track.id}
                ref={isActive ? activeItemRef : undefined}
                className={`flex items-center pl-1 pr-1 py-0.5 cursor-pointer select-none ${isActive
                  ? 'bg-(--hilight) text-(--hilight-text)'
                  : 'hover:bg-(--hilight) hover:text-(--hilight-text)'
                }`}
                onDoubleClick={() => onPlayTrack(track)}
              >
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {isNowPlaying || isLoading ? <NowPlayingIndicator loading={isLoading} /> : null}
                </span>
                <span className="min-w-0 truncate pl-0.5">
                  {track.title}
                  {track.artist ? ` - ${track.artist}` : ''}
                </span>
                {isLoading
                  ? (
                      <span className="ml-auto pl-2 shrink-0 animate-pulse opacity-60">
                        loading...
                      </span>
                    )
                  : track.duration != null && track.duration > 0
                    ? (
                        <span className="ml-auto pl-2 shrink-0 tabular-nums">
                          {formatTime(track.duration)}
                        </span>
                      )
                    : null}
              </div>
            )
          })}
        </SunkenPanel>
      </div>
    </div>
  )
}
