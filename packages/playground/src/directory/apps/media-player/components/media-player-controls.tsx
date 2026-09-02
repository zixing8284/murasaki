import type { ReactElement, ReactNode } from 'react'
import type { UseMediaPlayerResult } from '../use-media-player'
import {
  Divider,
  MenuItem,
  MenuSeparator,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from '@murasaki-io/react98'
import { useCallback, useRef, useState } from 'react'
import { useScreenBoundary } from '../../../../contexts/screen-boundary'
import {
  AspectRatioIcon,
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
  forceAspectRatio: boolean
  onSeekBackward: () => void
  onSeekForward: () => void
  onTogglePlaylist: () => void
  onToggleAspectRatio: () => void
}

const COMPACT_CONTROLS_WIDTH = 560

// Thin wrapper over the compound Tooltip for the many identical transport hints.
function ControlTooltip({ label, children }: { label: string, children: ReactNode }): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function MediaPlayerControls({
  player,
  isMediaFullscreen,
  showPlaylist,
  forceAspectRatio,
  onSeekBackward,
  onSeekForward,
  onTogglePlaylist,
  onToggleAspectRatio,
}: MediaPlayerControlsProps): ReactElement {
  const surfaceClassName = isMediaFullscreen ? 'bg-(--button-face)' : ''
  const hasCurrentTrack = player.currentTrack !== null
  const controlsRef = useRef<HTMLDivElement>(null)
  const screenBoundary = useScreenBoundary()
  const [compactMode, setCompactMode] = useState(false)

  const setControlsRef = useCallback((el: HTMLDivElement | null): (() => void) | void => {
    controlsRef.current = el
    if (!el)
      return
    const updateCompactMode = (): void => {
      setCompactMode(el.clientWidth < COMPACT_CONTROLS_WIDTH)
    }
    updateCompactMode()
    const observer = new ResizeObserver(updateCompactMode)
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [])

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

      <div ref={setControlsRef} className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 px-1 py-1 ${surfaceClassName}`}>
        <div className="flex shrink-0 items-center gap-0">
          <ControlTooltip label={player.isPlaying ? 'Pause' : 'Play'}>
            <TransportButton onClick={player.togglePlay} disabled={!hasCurrentTrack} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
              {player.isPlaying ? <PauseIcon /> : <PlayIcon />}
            </TransportButton>
          </ControlTooltip>

          <ControlTooltip label="Stop">
            <TransportButton onClick={player.stop} disabled={!hasCurrentTrack} aria-label="Stop">
              <StopIcon />
            </TransportButton>
          </ControlTooltip>

          <ControlTooltip label="Open File">
            <TransportButton onClick={player.openFilePicker} aria-label="Open File">
              <EjectIcon />
            </TransportButton>
          </ControlTooltip>

          <div className="w-2" />

          <ControlTooltip label="Previous">
            <TransportButton onClick={player.previous} disabled={!hasCurrentTrack} aria-label="Previous">
              <PreviousIcon />
            </TransportButton>
          </ControlTooltip>

          <ControlTooltip label="Rewind">
            <TransportButton onClick={onSeekBackward} disabled={!hasCurrentTrack} aria-label="Rewind">
              <RewindIcon />
            </TransportButton>
          </ControlTooltip>

          <ControlTooltip label="Fast Forward">
            <TransportButton onClick={onSeekForward} disabled={!hasCurrentTrack} aria-label="Fast Forward">
              <FastForwardIcon />
            </TransportButton>
          </ControlTooltip>

          <ControlTooltip label="Next">
            <TransportButton onClick={player.next} disabled={!hasCurrentTrack} aria-label="Next">
              <NextIcon />
            </TransportButton>
          </ControlTooltip>
        </div>

        {!compactMode && (
          <div className="flex shrink-0 items-center gap-0">
            <ControlTooltip label="Shuffle">
              <TransportButton onClick={player.toggleShuffle} active={player.shuffle} aria-label="Shuffle">
                <ShuffleIcon />
              </TransportButton>
            </ControlTooltip>

            <ControlTooltip label="Repeat All">
              <TransportButton onClick={() => player.setRepeat(player.repeat === 'all' ? 'off' : 'all')} active={player.repeat === 'all'} aria-label="Repeat All">
                <RepeatAllIcon />
              </TransportButton>
            </ControlTooltip>

            <ControlTooltip label="Repeat One">
              <TransportButton onClick={() => player.setRepeat(player.repeat === 'one' ? 'off' : 'one')} active={player.repeat === 'one'} aria-label="Repeat One">
                <RepeatOneIcon />
              </TransportButton>
            </ControlTooltip>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2 px-1">
          <ControlTooltip label={player.muted ? 'Unmute' : 'Mute'}>
            <TransportButton onClick={player.toggleMute} aria-label={player.muted ? 'Unmute' : 'Mute'}>
              {player.muted ? <VolumeMutedIcon /> : player.volume > 50 ? <VolumeHighIcon /> : <VolumeLowIcon />}
            </TransportButton>
          </ControlTooltip>

          <Slider
            className="w-20"
            disabled={player.muted}
            min={0}
            max={100}
            boxIndicator
            value={player.muted ? 0 : player.volume}
            onValueChange={player.setVolume}
            aria-label="Volume"
          />
        </div>

        {!compactMode && (
          <div className="h-6 w-25 shrink-0 self-center overflow-hidden bg-(--button-face) p-px shadow-(--shadow-sunken)">
            <AudioVisualizer
              getMediaElement={player.getMediaElement}
              isPlaying={player.isPlaying}
              isAudio={!player.hasVideo}
            />
          </div>
        )}

        <div className="flex min-w-24 grow items-center self-stretch whitespace-nowrap bg-(--window) px-1 tabular-nums shadow-(--shadow-border-field)">
          {player.formattedCurrentTime}
        </div>

        {compactMode
          ? (
              <WindowMenuBar className="ml-auto h-auto! bg-transparent! p-0!">
                <WindowMenuBarMenu>
                  <ControlTooltip label="More">
                    <WindowMenuBarTrigger
                      className="min-w-6 h-5.5! px-0.5! py-0! bg-(--button-face)! text-(--button-text)! shadow-(--shadow-raised) hover:bg-(--button-face)! hover:text-(--button-text)! focus-visible:bg-(--button-face)! focus-visible:text-(--button-text)! data-[state=open]:shadow-(--shadow-sunken) data-[state=open]:bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC')]!"
                      aria-label="More controls"
                    >
                      <span className="pointer-events-none text-[11px] leading-none">···</span>
                    </WindowMenuBarTrigger>
                  </ControlTooltip>
                  <WindowMenuBarContent sideOffset={4} boundaryRef={screenBoundary ?? undefined}>
                    <MenuItem disabled={isMediaFullscreen} onClick={onTogglePlaylist}>
                      {showPlaylist ? 'Hide Playlist' : 'Show Playlist'}
                    </MenuItem>
                    <MenuItem onClick={onToggleAspectRatio}>
                      {forceAspectRatio ? 'Original Aspect Ratio' : 'Force 16:9'}
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem onClick={player.toggleShuffle}>{player.shuffle ? 'Disable Shuffle' : 'Enable Shuffle'}</MenuItem>
                    <MenuItem onClick={() => player.setRepeat(player.repeat === 'all' ? 'off' : 'all')}>{player.repeat === 'all' ? 'Disable Repeat All' : 'Enable Repeat All'}</MenuItem>
                    <MenuItem onClick={() => player.setRepeat(player.repeat === 'one' ? 'off' : 'one')}>{player.repeat === 'one' ? 'Disable Repeat One' : 'Enable Repeat One'}</MenuItem>
                  </WindowMenuBarContent>
                </WindowMenuBarMenu>
              </WindowMenuBar>
            )
          : (
              <div className="ml-auto flex shrink-0 items-center gap-0">
                <ControlTooltip label="Playlist">
                  <TransportButton onClick={onTogglePlaylist} active={showPlaylist && !isMediaFullscreen} disabled={isMediaFullscreen} aria-label="Playlist">
                    <PlaylistIcon />
                  </TransportButton>
                </ControlTooltip>

                <ControlTooltip label={forceAspectRatio ? 'Original Aspect Ratio' : 'Force 16:9'}>
                  <TransportButton onClick={onToggleAspectRatio} active={forceAspectRatio} aria-label={forceAspectRatio ? 'Original Aspect Ratio' : 'Force 16:9'}>
                    <AspectRatioIcon />
                  </TransportButton>
                </ControlTooltip>
              </div>
            )}
      </div>
    </>
  )
}
