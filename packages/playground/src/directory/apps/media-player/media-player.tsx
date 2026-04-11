import type { ProcessComponentProps } from '../../../contexts/process'
import { useProcessActions } from '../../../contexts/process'
import { Divider, WindowStatusBar, WindowStatusBarField, SunkenPanel, Tooltip } from 'murasaki-react98'
import { RndWindow } from '../../../shell/window/rnd-window'
import { useMediaPlayer } from './use-media-player'
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

  // Cycle repeat mode to reach a target, using functional setState chaining
  const cycleRepeatTo = useCallback((target: 'off' | 'one' | 'all') => {
    const modes = ['off', 'one', 'all'] as const
    // If already at target, toggle off; otherwise cycle to target
    const dest = player.repeat === target ? 'off' : target
    const fromIdx = modes.indexOf(player.repeat)
    const toIdx = modes.indexOf(dest)
    const count = (toIdx - fromIdx + 3) % 3
    for (let i = 0; i < count; i++) player.cycleRepeat()
  }, [player.repeat, player.cycleRepeat])

  return (
    <RndWindow windowId={windowId} className="w-[360px] h-[340px] top-[15%] left-[25%]">

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
            <TransportButton onClick={() => cycleRepeatTo('all')} active={player.repeat === 'all'} aria-label="Repeat All">
              <RepeatAllIcon />
            </TransportButton>
          </Tooltip>
          {/* Repeat One */}
          <Tooltip text="Repeat One" side="top">
            <TransportButton onClick={() => cycleRepeatTo('one')} active={player.repeat === 'one'} aria-label="Repeat One">
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

/**
 * Seek bar thumb — hollow rectangle with Win98 3D bevel borders.
 * 4-layer border frame: 2px outer (hilight TL / dk-shadow BR) +
 * 2px inner (face TL / shadow BR). All four sides are equally 4px thick.
 * Center is transparent. 15×21 pixels.
 */
function SeekThumbIcon() {
  return (
    <svg width={15} height={21} viewBox="0 0 15 21" fill="none">
      {/* Outer Hilight — top + left (2px) */}
      <rect x="0" y="0" width="13" height="2" fill="var(--button-hilight)" />
      <rect x="0" y="0" width="2" height="21" fill="var(--button-hilight)" />
      {/* Outer DkShadow — right + bottom (2px) */}
      <rect x="13" y="0" width="2" height="21" fill="var(--button-dk-shadow)" />
      <rect x="2" y="19" width="13" height="2" fill="var(--button-dk-shadow)" />
      {/* Inner Face — top + left (2px) */}
      <rect x="2" y="2" width="9" height="2" fill="var(--button-face)" />
      <rect x="2" y="2" width="2" height="17" fill="var(--button-face)" />
      {/* Inner Shadow — right + bottom (2px) */}
      <rect x="11" y="2" width="2" height="17" fill="var(--button-shadow)" />
      <rect x="2" y="17" width="9" height="2" fill="var(--button-shadow)" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="3,1 3,13 12,7" fill="var(--button-text)" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="4" height="12" fill="var(--button-text)" />
      <rect x="8" y="1" width="4" height="12" fill="var(--button-text)" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" fill="var(--button-text)" />
    </svg>
  )
}

function PreviousIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="2" height="10" fill="var(--button-text)" />
      <polygon points="13,2 13,12 4,7" fill="var(--button-text)" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,2 1,12 10,7" fill="var(--button-text)" />
      <rect x="11" y="2" width="2" height="10" fill="var(--button-text)" />
    </svg>
  )
}

function RewindIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="7,2 7,12 1,7" fill="var(--button-text)" />
      <polygon points="13,2 13,12 7,7" fill="var(--button-text)" />
    </svg>
  )
}

function FastForwardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,2 1,12 7,7" fill="var(--button-text)" />
      <polygon points="7,2 7,12 13,7" fill="var(--button-text)" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1,4 L5,4 L9,10 L13,10 M1,10 L5,10 L9,4 L13,4"
        stroke="var(--button-text)"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon points="11,2 13,4 11,6" fill="var(--button-text)" />
      <polygon points="11,8 13,10 11,12" fill="var(--button-text)" />
    </svg>
  )
}

function RepeatAllIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2,5 L2,9 C2,10.5 3,11 4,11 L10,11 M12,9 L12,5 C12,3.5 11,3 10,3 L4,3"
        stroke="var(--button-text)"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon points="10,9 12,11 10,13" fill="var(--button-text)" />
      <polygon points="4,1 2,3 4,5" fill="var(--button-text)" />
    </svg>
  )
}

function RepeatOneIcon() {
  return (
    <span className="inline-flex items-center gap-px">
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
        <path
          d="M1,5 L1,9 C1,10.5 2,11 3,11 L7,11 M9,9 L9,5 C9,3.5 8,3 7,3 L3,3"
          stroke="var(--button-text)"
          strokeWidth="1.5"
          fill="none"
        />
        <polygon points="7,9 9,11 7,13" fill="var(--button-text)" />
        <polygon points="3,1 1,3 3,5" fill="var(--button-text)" />
      </svg>
      <span className="font-semibold leading-none text-(--button-text)">1</span>
    </span>
  )
}
