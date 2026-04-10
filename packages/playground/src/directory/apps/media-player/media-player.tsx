import type { ProcessComponentProps } from '../../../contexts/process'
import { useProcessActions } from '../../../contexts/process'
import { WindowStatusBar, WindowStatusBarField, SunkenPanel } from 'murasaki-react98'
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
          className="absolute top-[-3px] pointer-events-none"
          style={{
            left: `calc(${displayProgress}% - 6px)`,
          }}
        >
          {/* Top rectangle */}
          <div
            className="w-[12px] h-[18px] border-2 border-solid bg-(--button-face) box-border"
            style={{
              borderTopColor: 'var(--button-hilight)',
              borderLeftColor: 'var(--button-hilight)',
              borderRightColor: 'var(--button-shadow)',
              borderBottomWidth: 0,
            }}
          />
          {/* Bottom triangle */}
          <div
            className="w-[8px] h-[8px] border-2 border-solid bg-(--button-face) box-border relative"
            style={{
              borderTopWidth: 0,
              borderLeftColor: 'var(--button-hilight)',
              borderBottomColor: 'var(--button-shadow)',
              borderRightWidth: 0,
              transform: 'rotate(-45deg) translateX(-50%)',
              left: 5,
              top: -6,
            }}
          />
        </div>
      </div>
      {/* Tick ruler */}
      <div className="relative h-[20px] flex items-start">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${i * 10}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-px h-[6px] bg-(--button-text)" />
            {i % 5 === 0 && duration > 0 && (
              <span className="text-[9px] text-(--button-text) mt-px select-none">
                {formatTime((i / 10) * duration)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Transport button with Win95 styling
function TransportButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      className="min-w-[24px] h-[22px] flex items-center justify-center bg-(--button-face) shadow-(--shadow-raised) active:not-disabled:shadow-(--shadow-sunken) active:not-disabled:[&>*]:translate-x-px active:not-disabled:[&>*]:translate-y-px disabled:opacity-40 border-none box-border px-0.5"
      onClick={onClick}
      disabled={disabled}
      title={title}
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
    <RndWindow windowId={windowId} className="w-[360px] h-[340px] top-[15%] left-[25%]">

      <div className="flex flex-col h-full">

        {/* Menu bar */}
        <div className="flex gap-0 px-0.5">
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

        {/* Divider */}
        <div className="h-0 border-b border-(--button-shadow) mx-0.5" />
        <div className="h-0 border-b border-(--button-hilight) mx-0.5" />

        {/* Transport controls toolbar */}
        <div className="flex items-center gap-0 px-1 py-1">
          {/* Play/Pause */}
          <TransportButton onClick={player.togglePlay} title={player.isPlaying ? 'Pause' : 'Play'}>
            {player.isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </TransportButton>
          {/* Stop */}
          <TransportButton onClick={player.stop} title="Stop" disabled={!player.currentTrack}>
            <StopIcon />
          </TransportButton>

          <div className="w-2" />

          {/* Previous */}
          <TransportButton onClick={player.previous} title="Previous" disabled={!player.currentTrack}>
            <PreviousIcon />
          </TransportButton>
          {/* Rewind - seek backward */}
          <TransportButton onClick={() => player.seek(Math.max(0, player.currentTime - 5))} title="Rewind" disabled={!player.currentTrack}>
            <RewindIcon />
          </TransportButton>
          {/* Fast Forward - seek forward */}
          <TransportButton onClick={() => player.seek(Math.min(player.duration, player.currentTime + 5))} title="Fast Forward" disabled={!player.currentTrack}>
            <FastForwardIcon />
          </TransportButton>
          {/* Next */}
          <TransportButton onClick={player.next} title="Next" disabled={!player.currentTrack}>
            <NextIcon />
          </TransportButton>

          <div className="w-2" />

          {/* Shuffle */}
          <TransportButton onClick={player.toggleShuffle} title={`Shuffle: ${player.shuffle ? 'On' : 'Off'}`}>
            <ShuffleIcon active={player.shuffle} />
          </TransportButton>
          {/* Repeat */}
          <TransportButton onClick={player.cycleRepeat} title={`Repeat: ${player.repeat}`}>
            <RepeatIcon mode={player.repeat} />
          </TransportButton>

          {/* Vertical divider */}
          <div className="w-0 self-stretch mx-1.5 border-l-2 border-l-(--button-shadow) border-r-2 border-r-(--button-hilight)" />

          {/* Time display - sunken field */}
          <div className="flex-1 shadow-(--shadow-border-field) bg-(--window) px-1 py-px font-mono text-xs">
            {player.formattedCurrentTime}
          </div>
        </div>

        {/* Playlist - fills remaining space */}
        <SunkenPanel className="flex-1 min-h-0 mx-1 mb-1 bg-(--window)">
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
          <WindowStatusBarField grow={false} className="w-20 text-right">
            {player.formattedCurrentTime} / {player.formattedDuration}
          </WindowStatusBarField>
        </WindowStatusBar>
      </div>
    </RndWindow>
  )
}

// ---- SVG Transport Icons (Win98 style, using theme variables) ----

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

function ShuffleIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1,4 L5,4 L9,10 L13,10 M1,10 L5,10 L9,4 L13,4"
        stroke={active ? 'var(--hilight)' : 'var(--button-text)'}
        strokeWidth="1.5"
        fill="none"
      />
      <polygon points="11,2 13,4 11,6" fill={active ? 'var(--hilight)' : 'var(--button-text)'} />
      <polygon points="11,8 13,10 11,12" fill={active ? 'var(--hilight)' : 'var(--button-text)'} />
    </svg>
  )
}

function RepeatIcon({ mode }: { mode: 'off' | 'one' | 'all' }) {
  const color = mode !== 'off' ? 'var(--hilight)' : 'var(--button-text)'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2,5 L2,9 C2,10.5 3,11 4,11 L10,11 M12,9 L12,5 C12,3.5 11,3 10,3 L4,3"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <polygon points="10,9 12,11 10,13" fill={color} />
      <polygon points="4,1 2,3 4,5" fill={color} />
      {mode === 'one' && (
        <text x="6" y="9" fontSize="7" fill={color} textAnchor="middle" fontWeight="bold">1</text>
      )}
    </svg>
  )
}
