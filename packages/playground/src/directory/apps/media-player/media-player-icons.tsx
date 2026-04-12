/**
 * Seek bar thumb — hollow rectangle with Win98 3D bevel borders.
 * 4-layer border frame: 2px outer (hilight TL / dk-shadow BR) +
 * 2px inner (face TL / shadow BR). All four sides are equally 4px thick.
 * Center is transparent. 15×21 pixels.
 */
export function SeekThumbIcon() {
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

export function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="3,1 3,13 12,7" fill="var(--button-text)" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="4" height="12" fill="var(--button-text)" />
      <rect x="8" y="1" width="4" height="12" fill="var(--button-text)" />
    </svg>
  )
}

export function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" fill="var(--button-text)" />
    </svg>
  )
}

export function PreviousIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="2" height="10" fill="var(--button-text)" />
      <polygon points="13,2 13,12 4,7" fill="var(--button-text)" />
    </svg>
  )
}

export function NextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,2 1,12 10,7" fill="var(--button-text)" />
      <rect x="11" y="2" width="2" height="10" fill="var(--button-text)" />
    </svg>
  )
}

export function RewindIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="7,2 7,12 1,7" fill="var(--button-text)" />
      <polygon points="13,2 13,12 7,7" fill="var(--button-text)" />
    </svg>
  )
}

export function FastForwardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="1,2 1,12 7,7" fill="var(--button-text)" />
      <polygon points="7,2 7,12 13,7" fill="var(--button-text)" />
    </svg>
  )
}

export function ShuffleIcon() {
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

export function RepeatAllIcon() {
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

export function RepeatOneIcon() {
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
