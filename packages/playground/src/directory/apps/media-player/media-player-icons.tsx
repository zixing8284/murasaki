import type { JSX } from 'react'

/**
 * Seek bar thumb — hollow rectangle with Win98 3D bevel borders.
 * 4-layer border frame: 2px outer (hilight TL / dk-shadow BR) +
 * 2px inner (face TL / shadow BR). All four sides are equally 4px thick.
 * Center is transparent. 15×21 pixels.
 */
export function SeekThumbIcon(): JSX.Element {
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

export function PlayIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="3,1 3,13 12,7" fill="var(--button-text)" />
    </svg>
  )
}

export function PauseIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="4" height="12" fill="var(--button-text)" />
      <rect x="8" y="1" width="4" height="12" fill="var(--button-text)" />
    </svg>
  )
}

export function StopIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" fill="var(--button-text)" />
    </svg>
  )
}

export function PreviousIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="2" height="10" fill="var(--button-text)" />
      <polygon points="13,2 13,12 4,7" fill="var(--button-text)" />
    </svg>
  )
}

export function NextIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,2 1,12 10,7" fill="var(--button-text)" />
      <rect x="11" y="2" width="2" height="10" fill="var(--button-text)" />
    </svg>
  )
}

export function RewindIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="7,2 7,12 1,7" fill="var(--button-text)" />
      <polygon points="13,2 13,12 7,7" fill="var(--button-text)" />
    </svg>
  )
}

export function FastForwardIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,2 1,12 7,7" fill="var(--button-text)" />
      <polygon points="7,2 7,12 13,7" fill="var(--button-text)" />
    </svg>
  )
}

export function ShuffleIcon(): JSX.Element {
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

export function RepeatAllIcon(): JSX.Element {
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

export function RepeatOneIcon(): JSX.Element {
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

export function EjectIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="7,1 1,8 13,8" fill="var(--button-text)" />
      <rect x="1" y="10" width="12" height="3" fill="var(--button-text)" />
    </svg>
  )
}

/** Speaker cone with two sound waves */
export function VolumeHighIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Speaker body */}
      <polygon points="1,5 1,9 3,9 6,12 6,2 3,5" fill="var(--button-text)" />
      {/* Small wave */}
      <path d="M8,5 C9,6 9,8 8,9" stroke="var(--button-text)" strokeWidth="1.2" fill="none" />
      {/* Large wave */}
      <path d="M10,3 C12,5 12,9 10,11" stroke="var(--button-text)" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

/** Speaker cone with one small sound wave */
export function VolumeLowIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,5 1,9 3,9 6,12 6,2 3,5" fill="var(--button-text)" />
      <path d="M8,5 C9,6 9,8 8,9" stroke="var(--button-text)" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

/** Speaker cone with X (muted) */
export function VolumeMutedIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,5 1,9 3,9 6,12 6,2 3,5" fill="var(--button-text)" />
      <line x1="8" y1="4" x2="13" y2="10" stroke="var(--button-text)" strokeWidth="1.5" />
      <line x1="13" y1="4" x2="8" y2="10" stroke="var(--button-text)" strokeWidth="1.5" />
    </svg>
  )
}

export function PlaylistIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="9" height="1.5" fill="var(--button-text)" />
      <rect x="1" y="5" width="9" height="1.5" fill="var(--button-text)" />
      <rect x="1" y="8" width="6" height="1.5" fill="var(--button-text)" />
      <rect x="1" y="11" width="6" height="1.5" fill="var(--button-text)" />
      <polygon points="9,8.5 9,12.5 13,10.5" fill="var(--button-text)" />
    </svg>
  )
}
