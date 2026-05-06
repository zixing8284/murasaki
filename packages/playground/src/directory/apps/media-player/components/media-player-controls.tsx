import type { JSX } from 'react'
import type { UseMediaPlayerResult } from '../use-media-player'
import { Divider, Slider, Tooltip } from '@murasaki/react98'
import {
  EjectIcon,
  FastForwardIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PlaylistIcon,
  PreviousIcon,
  RepeatAllIcon,
  RepeatOneIcon,
  RewindIcon,
  ShuffleIcon,
  StopIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMutedIcon,
} from '../media-player-icons'
import { AudioVisualizer } from './audio-visualizer'
import { SeekBar } from './seek-bar'
import { TransportButton } from './transport-button'

type MediaPlayerControlsPlayer = Pick<UseMediaPlayerResult, | 'currentTrack'
  | 'duration'
  | 'formattedCurrentTime'
  | 'getMediaElement'
  | 'hasVideo'
  | 'isPlaying'
  | 'muted'
  | 'next'
  | 'openFilePicker'
  | 'previous'
  | 'progress'
  | 'repeat'
  | 'seekByPercentage'
  | 'setRepeat'
  | 'setVolume'
  | 'shuffle'
  | 'stop'
  | 'toggleMute'
  | 'togglePlay'
  | 'toggleShuffle'
  | 'volume'>

interface MediaPlayerControlsProps {
  player: MediaPlayerControlsPlayer
  isMediaFullscreen: boolean
  showPlaylist: boolean
  onSeekBackward: () => void
  onSeekForward: () => void
  onTogglePlaylist: () => void
}

function ToolbarSeparator(): JSX.Element {
  return <div className="w-0 self-stretch mx-1.5 border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
}

export function MediaPlayerControls({
  player,
  isMediaFullscreen,
  showPlaylist,
  onSeekBackward,
  onSeekForward,
  onTogglePlaylist,
}: MediaPlayerControlsProps): JSX.Element {
  const surfaceClassName = isMediaFullscreen ? 'bg-(--button-face)' : ''
  const hasCurrentTrack = player.currentTrack !== null

  return (
    <>
      <div className={`flex items-start ${surfaceClassName}`}>
        <SeekBar
          progress={player.progress}
          duration={player.duration}
          onSeek={player.seekByPercentage}
        />
      </div>

      <Divider />

      <div className={`flex items-center gap-0 px-1 py-1 ${surfaceClassName}`}>
        <Tooltip text={player.isPlaying ? 'Pause' : 'Play'} side="top">
          <TransportButton onClick={player.togglePlay} disabled={!hasCurrentTrack} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
            {player.isPlaying ? <PauseIcon /> : <PlayIcon />}
          </TransportButton>
        </Tooltip>

        <Tooltip text="Stop" side="top">
          <TransportButton onClick={player.stop} disabled={!hasCurrentTrack} aria-label="Stop">
            <StopIcon />
          </TransportButton>
        </Tooltip>

        <Tooltip text="Open File" side="top">
          <TransportButton onClick={player.openFilePicker} aria-label="Open File">
            <EjectIcon />
          </TransportButton>
        </Tooltip>

        <div className="w-2" />

        <Tooltip text="Previous" side="top">
          <TransportButton onClick={player.previous} disabled={!hasCurrentTrack} aria-label="Previous">
            <PreviousIcon />
          </TransportButton>
        </Tooltip>

        <Tooltip text="Rewind" side="top">
          <TransportButton onClick={onSeekBackward} disabled={!hasCurrentTrack} aria-label="Rewind">
            <RewindIcon />
          </TransportButton>
        </Tooltip>

        <Tooltip text="Fast Forward" side="top">
          <TransportButton onClick={onSeekForward} disabled={!hasCurrentTrack} aria-label="Fast Forward">
            <FastForwardIcon />
          </TransportButton>
        </Tooltip>

        <Tooltip text="Next" side="top">
          <TransportButton onClick={player.next} disabled={!hasCurrentTrack} aria-label="Next">
            <NextIcon />
          </TransportButton>
        </Tooltip>

        <div className="w-2" />

        <Tooltip text="Shuffle" side="top">
          <TransportButton onClick={player.toggleShuffle} active={player.shuffle} aria-label="Shuffle">
            <ShuffleIcon />
          </TransportButton>
        </Tooltip>

        <Tooltip text="Repeat All" side="top">
          <TransportButton onClick={() => player.setRepeat(player.repeat === 'all' ? 'off' : 'all')} active={player.repeat === 'all'} aria-label="Repeat All">
            <RepeatAllIcon />
          </TransportButton>
        </Tooltip>

        <Tooltip text="Repeat One" side="top">
          <TransportButton onClick={() => player.setRepeat(player.repeat === 'one' ? 'off' : 'one')} active={player.repeat === 'one'} aria-label="Repeat One">
            <RepeatOneIcon />
          </TransportButton>
        </Tooltip>

        <ToolbarSeparator />

        <div className="flex items-center gap-2 px-1">
          <Tooltip text={player.muted ? 'Unmute' : 'Mute'} side="top">
            <TransportButton onClick={player.toggleMute} aria-label={player.muted ? 'Unmute' : 'Mute'}>
              {player.muted ? <VolumeMutedIcon /> : player.volume > 50 ? <VolumeHighIcon /> : <VolumeLowIcon />}
            </TransportButton>
          </Tooltip>

          <Slider
            className="w-20"
            disabled={player.muted}
            min={0}
            max={100}
            boxIndicator
            value={player.muted ? 0 : player.volume}
            onChange={event => player.setVolume(Number(event.target.value))}
            aria-label="Volume"
          />
        </div>

        <ToolbarSeparator />

        <div className="w-25 shadow-(--shadow-sunken) bg-(--button-face) overflow-hidden shrink-0 box-content p-px self-stretch">
          <AudioVisualizer
            getMediaElement={player.getMediaElement}
            isPlaying={player.isPlaying}
            isAudio={!player.hasVideo}
          />
        </div>

        <ToolbarSeparator />

        <div className="flex-1 flex items-center shadow-(--shadow-border-field) bg-(--window) px-1 tabular-nums whitespace-nowrap self-stretch">
          {player.formattedCurrentTime}
        </div>

        <ToolbarSeparator />

        <Tooltip text={showPlaylist ? 'Hide Playlist' : 'Show Playlist'} side="top">
          <TransportButton onClick={onTogglePlaylist} active={showPlaylist} aria-label={showPlaylist ? 'Hide Playlist' : 'Show Playlist'}>
            <PlaylistIcon />
          </TransportButton>
        </Tooltip>
      </div>
    </>
  )
}
