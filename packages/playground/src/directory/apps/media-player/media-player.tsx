import type { ProcessComponentProps } from '../../../contexts/process'
import { useProcessActions } from '../../../contexts/process'
import { Divider, WindowStatusBar, WindowStatusBarField, SunkenPanel, Tooltip } from 'murasaki-react98'
import { RndWindow } from '../../../shell/window/rnd-window'
import { useMediaPlayer } from './use-media-player'
import {
  SeekThumbIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PreviousIcon,
  NextIcon,
  RewindIcon,
  FastForwardIcon,
  ShuffleIcon,
  RepeatAllIcon,
  RepeatOneIcon,
} from './media-player-icons'
import { useEffect, useRef, useCallback, useState } from 'react'

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00'
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
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  const getPercentageFromEvent = useCallback((e: React.PointerEvent | PointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 0
    const x = e.clientX - rect.left
    return Math.max(0, Math.min(100, (x / rect.width) * 100))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (duration <= 0) return
    e.preventDefault()
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setDragProgress(getPercentageFromEvent(e))
  }, [duration, getPercentageFromEvent])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setDragProgress(getPercentageFromEvent(e))
  }, [isDragging, getPercentageFromEvent])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    onSeek(getPercentageFromEvent(e))
  }, [isDragging, getPercentageFromEvent, onSeek])

  const displayProgress = isDragging ? dragProgress : progress

  return (
    <div className="px-2.5 pt-2.5 flex-1">
      {/* Track container */}
      <div
        ref={trackRef}
        className="relative h-[13px] bg-(--window) shadow-(--shadow-border-field) cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Seek handle */}
        <div
          className="absolute top-[-4px] pointer-events-none"
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
                  i === 0 ? undefined
                  : i === 10 ? { transform: 'translateX(-100%)' }
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
} & React.ComponentProps<'button'>) {
  return (
    <button
      className={`min-w-[24px] h-[22px] flex items-center justify-center bg-(--button-face) shadow-(--shadow-raised) active:not-disabled:shadow-(--shadow-sunken) active:not-disabled:[&>*]:translate-x-px active:not-disabled:[&>*]:translate-y-px disabled:opacity-40 border-none box-border px-0.5${
        active
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
  const { title } = useProcessActions()

  // Update window title based on current track
  const currentTitle = player.currentTrack
    ? `${player.currentTrack.title} - ${player.isPlaying ? 'Playing' : 'Paused'}`
    : 'Media Player'

  useEffect(() => {
    title(windowId, currentTitle)
  }, [windowId, currentTitle, title])

  return (
    <RndWindow windowId={windowId} className="top-[15%] left-[25%]">

      <div className="flex flex-col h-full">

        {/* Menu bar */}
        <div className="flex gap-0">
          {['File', 'Edit', 'Device', 'Scale', 'Help'].map(menu => (
            <button
              key={menu}
              className="bg-transparent border-none px-1.5 py-0.5 text-(--button-text) disabled:text-(--gray-text)"
              disabled
            >
              <span className="underline">{menu[0]}</span>{menu.slice(1)}
            </button>
          ))}
        </div>

        {/* Seek bar area */}
        <div className="flex items-start">
          <SeekBar
            progress={player.progress}
            duration={player.duration}
            onSeek={player.seekByPercentage}
          />
        </div>

        <Divider />

        {/* Transport controls toolbar */}
        <div className="flex items-center gap-0 px-1 py-1">
          {/* Play/Pause */}
          <Tooltip text={player.isPlaying ? 'Pause' : 'Play'} side="top">
            <TransportButton onClick={player.togglePlay} disabled={!player.currentTrack} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
              {player.isPlaying ? (
                <PauseIcon />
              ) : (
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

          {/* Time display - sunken field */}
          <div className="flex-1 shadow-(--shadow-border-field) bg-(--window) px-1 py-px">
            {player.formattedCurrentTime}
          </div>
        </div>

        {/* Playlist - fills remaining space */}
        <SunkenPanel className="flex-1 min-h-0 mb-1 bg-(--window)">
          {player.playlist.map((track) => {
            const isActive = player.currentTrack?.id === track.id
            return (
              <div
                key={track.id}
                className={`px-1 py-0.5 cursor-pointer select-none truncate ${
                  isActive
                    ? 'bg-(--hilight) text-(--hilight-text)'
                    : 'hover:bg-(--hilight) hover:text-(--hilight-text)'
                }`}
                onDoubleClick={() => player.playTrack(track)}
              >
                {track.title}
                {track.artist ? ` - ${track.artist}` : ''}
              </div>
            )
          })}
        </SunkenPanel>

        {/* Status bar - using UI library components */}
        <WindowStatusBar>
          <WindowStatusBarField className="truncate">
            {player.currentTrack ? player.currentTrack.title : 'Ready'}
          </WindowStatusBarField>
          <WindowStatusBarField grow={false} className="w-20">
            {player.formattedCurrentTime} / {player.formattedDuration}
          </WindowStatusBarField>
        </WindowStatusBar>
      </div>
    </RndWindow>
  )
}
