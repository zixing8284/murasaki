import type { ProcessComponentProps } from '../../../contexts/process'
import { Divider, Slider, SunkenPanel, Tooltip, WindowMenuBar, WindowMenuBarItem, WindowStatusBar, WindowStatusBarField } from 'murasaki-react98'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDesktopFiles } from '../../../contexts/desktop-files'
import { useProcessActions } from '../../../contexts/process'
import { useFullscreen } from '../../../hooks/use-fullscreen'
import { InactiveClickGuard } from '../../../shell/window/inactive-click-guard'
import { AudioVisualizer } from './audio-visualizer'
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
  SeekThumbIcon,
  ShuffleIcon,
  StopIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMutedIcon,
} from './media-player-icons'
import { useMediaPlayer } from './use-media-player'

const EMPTY_STATE_ICON_SRC = '/img/media-player/mediaplayer-bg.png'
const EMPTY_CAPTIONS_TRACK_SRC = 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A'

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds))
    return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Seek bar with Win95-style handle
function SeekBar({
  progress,
  duration,
  onSeek,
}: {
  progress: number
  duration: number
  onSeek: (percentage: number) => void
}): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  const getPercentageFromEvent = useCallback((e: React.PointerEvent | PointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect)
      return 0
    const x = e.clientX - rect.left
    return Math.max(0, Math.min(100, (x / rect.width) * 100))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (duration <= 0)
      return
    e.preventDefault()
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setDragProgress(getPercentageFromEvent(e))
  }, [duration, getPercentageFromEvent])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging)
      return
    setDragProgress(getPercentageFromEvent(e))
  }, [isDragging, getPercentageFromEvent])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging)
      return
    setIsDragging(false)
    onSeek(getPercentageFromEvent(e))
  }, [isDragging, getPercentageFromEvent, onSeek])

  const displayProgress = isDragging ? dragProgress : progress

  return (
    <div className="px-2.5 pt-2.5 flex-1">
      {/* Track container */}
      <div
        ref={trackRef}
        className="relative h-3.25 bg-(--window) shadow-(--shadow-border-field) cursor-pointer before:content-[''] before:absolute before:-left-[7.5px] before:-right-[7.5px] before:top-0 before:bottom-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Seek handle */}
        <div
          className="absolute -top-1 pointer-events-none"
          style={{
            left: `calc(${displayProgress}% - 7.5px)`,
          }}
        >
          <SeekThumbIcon />
        </div>
      </div>
      {/* Tick ruler */}
      <div className="relative h-5 flex items-start">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-start"
            style={{ left: `${i * 10}%` }}
          >
            <div className="w-px h-1.5 bg-(--button-text)" />
            {i % 5 === 0 && duration > 0 && (
              <span
                className="text-[9px] text-(--button-text) mt-px select-none whitespace-nowrap"
                style={
                  i === 0
                    ? undefined
                    : i === 10
                      ? { transform: 'translateX(-100%)' }
                      : { transform: 'translateX(-50%)' }
                }
              >
                {formatTime((i / 10) * duration)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Transport button
function TransportButton({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  active?: boolean
} & React.ComponentProps<'button'>): React.JSX.Element {
  return (
    <button
      className={`min-w-6 h-5.5 flex items-center justify-center bg-(--button-face) shadow-(--shadow-raised) active:not-disabled:shadow-(--shadow-sunken) active:not-disabled:*:translate-x-px active:not-disabled:*:translate-y-px disabled:opacity-40 border-none box-border px-0.5${active
        ? ' shadow-(--shadow-sunken) bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC")]'
        : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  )
}

export function MediaPlayer({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const player = useMediaPlayer()
  const { loadLocalFile } = player
  const { title } = useProcessActions()
  const { launchRequest, clearLaunchRequest, getFile } = useDesktopFiles()
  const [showPlaylist, setShowPlaylist] = useState(true)
  const activeItemRef = useRef<HTMLDivElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  const { isFullscreen: isMediaFullscreen, toggle: toggleMediaFullscreen } = useFullscreen(fullscreenContainerRef)
  const shouldShowPlaylist = showPlaylist && !isMediaFullscreen

  // Guard the video area from accidental fullscreen toggles caused by
  // layout shifts (e.g. the Playlist button click followed by a click on
  // the now-expanded video region can satisfy the browser's dblclick
  // heuristics). We require two clicks to actually land on the video
  // element before acting on dblclick.
  const videoClickCountRef = useRef(0)
  const videoClickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetVideoClickCount = useCallback(() => {
    videoClickCountRef.current = 0
    if (videoClickResetTimerRef.current !== null) {
      clearTimeout(videoClickResetTimerRef.current)
      videoClickResetTimerRef.current = null
    }
  }, [])

  const handleVideoClick = useCallback(() => {
    videoClickCountRef.current += 1
    if (videoClickResetTimerRef.current !== null) {
      clearTimeout(videoClickResetTimerRef.current)
    }
    videoClickResetTimerRef.current = setTimeout(() => {
      videoClickCountRef.current = 0
      videoClickResetTimerRef.current = null
    }, 500)
  }, [])

  const handleVideoDoubleClick = useCallback(() => {
    const count = videoClickCountRef.current
    resetVideoClickCount()
    if (count < 2)
      return
    void toggleMediaFullscreen()
  }, [resetVideoClickCount, toggleMediaFullscreen])

  useEffect(() => {
    return () => {
      if (videoClickResetTimerRef.current !== null) {
        clearTimeout(videoClickResetTimerRef.current)
      }
    }
  }, [])

  // Update window title based on current track
  const currentTitle = player.currentTrack
    ? `${player.currentTrack.title} - ${player.isPlaying ? 'Playing' : 'Paused'}`
    : 'Media Player'

  useEffect(() => {
    title(windowId, currentTitle)
  }, [windowId, currentTitle, title])

  // Scroll playlist to the active track once when it changes
  const currentTrackId = player.currentTrack?.id
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentTrackId])

  useEffect(() => {
    if (!launchRequest) {
      return
    }

    let active = true

    const loadRequestedFile = async (): Promise<void> => {
      const file = await getFile(launchRequest.fileId)
      if (!active) {
        return
      }

      if (file) {
        loadLocalFile(file, { replacePlaylist: true })
      }
      clearLaunchRequest()
    }

    void loadRequestedFile()

    return () => {
      active = false
    }
  }, [launchRequest, clearLaunchRequest, getFile, loadLocalFile])

  return (
    <div className="flex h-full flex-col">

      {/* Hidden file input for local media loading */}
      <input
        ref={player.fileInputRef}
        type="file"
        accept={player.acceptedMediaTypes}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file)
            player.addLocalFile(file)
          e.target.value = ''
        }}
      />

      {/* Menu bar */}
      <InactiveClickGuard windowId={windowId}>
        <WindowMenuBar>
          {['File', 'Edit', 'Device', 'Scale', 'Help'].map((menu) => {
            // Wire File → Open File as a first observable action; others remain placeholders.
            const isFile = menu === 'File'
            return (
              <WindowMenuBarItem
                key={menu}
                onClick={isFile ? player.openFilePicker : undefined}
                disabled={!isFile}
              >
                <span className="underline">{menu[0]}</span>
                {menu.slice(1)}
              </WindowMenuBarItem>
            )
          })}
        </WindowMenuBar>
      </InactiveClickGuard>

      <div
        ref={fullscreenContainerRef}
        className={`flex flex-1 min-h-0 flex-col ${isMediaFullscreen ? 'bg-black text-(--button-text)' : 'bg-(--button-face)'}`}
        data-fullscreen={isMediaFullscreen || undefined}
      >
        {/* Video display area — fills remaining space, min 80px. Double-click toggles fullscreen for the video + transport region. */}
        <div
          className="relative flex-1 min-h-20 bg-black shadow-(--shadow-sunken) flex items-center justify-center min-w-0 overflow-hidden"
          onClick={handleVideoClick}
          onDoubleClick={handleVideoDoubleClick}
        >
          <video
            ref={player.mediaRefCallback}
            className={`max-w-full max-h-full p-1 object-contain aspect-video${player.hasVideo ? '' : ' hidden'}`}
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
          {!player.hasVideo
            ? (
                <img
                  src={EMPTY_STATE_ICON_SRC}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none select-none pixelated w-40 max-w-[72%] h-auto"
                />
              )
            : null}
        </div>

        {/* Seek bar area */}
        <div className={`flex items-start ${isMediaFullscreen ? 'bg-(--button-face)' : ''}`}>
          <SeekBar
            progress={player.progress}
            duration={player.duration}
            onSeek={player.seekByPercentage}
          />
        </div>

        <Divider />

        {/* Transport controls toolbar */}
        <div className={`flex items-center gap-0 px-1 py-1 ${isMediaFullscreen ? 'bg-(--button-face)' : ''}`}>
          {/* Play/Pause */}
          <Tooltip text={player.isPlaying ? 'Pause' : 'Play'} side="top">
            <TransportButton onClick={player.togglePlay} disabled={!player.currentTrack} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
              {player.isPlaying
                ? (
                    <PauseIcon />
                  )
                : (
                    <PlayIcon />
                  )}
            </TransportButton>
          </Tooltip>
          {/* Stop */}
          <Tooltip text="Stop" side="top">
            <TransportButton onClick={player.stop} disabled={!player.currentTrack} aria-label="Stop">
              <StopIcon />
            </TransportButton>
          </Tooltip>
          {/* Eject / Load file */}
          <Tooltip text="Open File" side="top">
            <TransportButton onClick={player.openFilePicker} aria-label="Open File">
              <EjectIcon />
            </TransportButton>
          </Tooltip>

          <div className="w-2" />

          {/* Previous */}
          <Tooltip text="Previous" side="top">
            <TransportButton onClick={player.previous} disabled={!player.currentTrack} aria-label="Previous">
              <PreviousIcon />
            </TransportButton>
          </Tooltip>
          {/* Rewind - seek backward */}
          <Tooltip text="Rewind" side="top">
            <TransportButton onClick={() => player.seek(Math.max(0, player.currentTime - 5))} disabled={!player.currentTrack} aria-label="Rewind">
              <RewindIcon />
            </TransportButton>
          </Tooltip>
          {/* Fast Forward - seek forward */}
          <Tooltip text="Fast Forward" side="top">
            <TransportButton onClick={() => player.seek(Math.min(player.duration, player.currentTime + 5))} disabled={!player.currentTrack} aria-label="Fast Forward">
              <FastForwardIcon />
            </TransportButton>
          </Tooltip>
          {/* Next */}
          <Tooltip text="Next" side="top">
            <TransportButton onClick={player.next} disabled={!player.currentTrack} aria-label="Next">
              <NextIcon />
            </TransportButton>
          </Tooltip>

          <div className="w-2" />

          {/* Shuffle */}
          <Tooltip text="Shuffle" side="top">
            <TransportButton onClick={player.toggleShuffle} active={player.shuffle} aria-label="Shuffle">
              <ShuffleIcon />
            </TransportButton>
          </Tooltip>
          {/* Repeat All */}
          <Tooltip text="Repeat All" side="top">
            <TransportButton onClick={() => player.setRepeat(player.repeat === 'all' ? 'off' : 'all')} active={player.repeat === 'all'} aria-label="Repeat All">
              <RepeatAllIcon />
            </TransportButton>
          </Tooltip>
          {/* Repeat One */}
          <Tooltip text="Repeat One" side="top">
            <TransportButton onClick={() => player.setRepeat(player.repeat === 'one' ? 'off' : 'one')} active={player.repeat === 'one'} aria-label="Repeat One">
              <RepeatOneIcon />
            </TransportButton>
          </Tooltip>

          {/* Vertical divider */}
          <div className="w-0 self-stretch mx-1.5 border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />

          {/* Volume mute toggle */}
          <div className="flex items-center gap-2 px-1">

            <Tooltip text={player.muted ? 'Unmute' : 'Mute'} side="top">
              <TransportButton onClick={player.toggleMute} aria-label={player.muted ? 'Unmute' : 'Mute'}>
                {player.muted ? <VolumeMutedIcon /> : player.volume > 50 ? <VolumeHighIcon /> : <VolumeLowIcon />}
              </TransportButton>
            </Tooltip>

            {/* Volume slider */}
            <Slider
              className="w-20"
              disabled={player.muted}
              min={0}
              max={100}
              boxIndicator
              value={player.muted ? 0 : player.volume}
              onChange={e => player.setVolume(Number(e.target.value))}
              aria-label="Volume"
            />

          </div>

          {/* Vertical divider */}
          <div className="w-0 self-stretch mx-1.5 border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />

          {/* Audio visualizer - compact waveform display */}
          <div className="w-25 shadow-(--shadow-sunken) bg-(--button-face) overflow-hidden shrink-0 box-content p-px self-stretch">
            <AudioVisualizer
              getMediaElement={player.getMediaElement}
              isPlaying={player.isPlaying}
              isAudio={!player.hasVideo}
            />
          </div>

          {/* Vertical divider */}
          <div className="w-0 self-stretch mx-1.5 border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />

          {/* Time display - sunken field */}
          <div className="flex-1 flex items-center shadow-(--shadow-border-field) bg-(--window) px-1 tabular-nums whitespace-nowrap self-stretch">
            {player.formattedCurrentTime}
          </div>

          {/* Vertical divider */}
          <div className="w-0 self-stretch mx-1.5 border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />

          {/* Playlist toggle */}
          <Tooltip text={showPlaylist ? 'Hide Playlist' : 'Show Playlist'} side="top">
            <TransportButton onClick={() => setShowPlaylist(prev => !prev)} active={showPlaylist} aria-label={showPlaylist ? 'Hide Playlist' : 'Show Playlist'}>
              <PlaylistIcon />
            </TransportButton>
          </Tooltip>
        </div>
      </div>

      {/* Playlist - animated expand/collapse via grid-template-rows transition */}
      <div className={`grid transition-[grid-template-rows] duration-100 ease-in-out ${shouldShowPlaylist ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="min-h-0 overflow-hidden">
          <SunkenPanel className="h-40 overflow-y-auto bg-(--window)">
            {player.playlist.map((track) => {
              const isActive = player.currentTrack?.id === track.id
              return (
                <div
                  key={track.id}
                  ref={isActive ? activeItemRef : undefined}
                  className={`flex items-center pl-1 pr-1 py-0.5 cursor-pointer select-none ${isActive
                    ? 'bg-(--hilight) text-(--hilight-text)'
                    : 'hover:bg-(--hilight) hover:text-(--hilight-text)'
                  }`}
                  onDoubleClick={() => player.playTrack(track)}
                >
                  <span className="truncate pl-0.5">
                    {track.title}
                    {track.artist ? ` - ${track.artist}` : ''}
                  </span>
                  {track.duration !== null && track.duration !== undefined && track.duration > 0 && (
                    <span className="ml-auto pl-2 shrink-0 tabular-nums">
                      {formatTime(track.duration)}
                    </span>
                  )}
                </div>
              )
            })}
          </SunkenPanel>
        </div>
      </div>

      {/* Status bar - using UI library components. Hidden while the media region is fullscreen. */}
      {!isMediaFullscreen && (
        <WindowStatusBar>
          <WindowStatusBarField className="truncate">
            {player.currentTrack ? player.currentTrack.title : 'Ready'}
          </WindowStatusBarField>
          <WindowStatusBarField grow={false} className="w-20">
            {player.formattedCurrentTime}
            {' '}
            /
            {player.formattedDuration}
          </WindowStatusBarField>
        </WindowStatusBar>
      )}
    </div>
  )
}
