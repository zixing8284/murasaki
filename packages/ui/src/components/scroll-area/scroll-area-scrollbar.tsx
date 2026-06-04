import * as React from 'react'

import { cnPure } from '../../lib/utils'

import { TRACK_BG_COLOR, TRACK_BG_IMAGE, TRACK_BG_SIZE } from './scroll-area-constants'
import { useScrollAreaContext } from './scroll-area-context'
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from './scroll-area-icons'
import { ScrollAreaThumb } from './scroll-area-thumb'

export interface ScrollAreaScrollbarProps extends React.ComponentProps<'div'> {
  orientation: 'vertical' | 'horizontal'
}

interface TrackProps {
  ref?: React.Ref<HTMLDivElement>
  axis: 'v' | 'h'
  children: React.ReactNode
  scrollPage: (axis: 'v' | 'h', direction: -1 | 1) => void
  // Vertical-specific
  btnHeight?: number
  thumbTop?: number
  // Horizontal-specific
  barSize?: number
  thumbLeft?: number
}

function Track({
  ref,
  axis,
  children,
  scrollPage,
  btnHeight,
  thumbTop,
  barSize,
  thumbLeft,
}: TrackProps): React.ReactElement {
  const isVertical = axis === 'v'

  const onMouseDown = (e: React.MouseEvent): void => {
    // Don't page-scroll if the click was on the thumb itself
    const target = e.target as HTMLElement
    if (target.closest('[data-murasaki-thumb]'))
      return

    if (isVertical) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const clickPos = e.clientY - rect.top
      scrollPage('v', clickPos < (thumbTop ?? 0) ? -1 : 1)
    }
    else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const clickPos = e.clientX - rect.left
      scrollPage('h', clickPos < (thumbLeft ?? 0) ? -1 : 1)
    }
  }

  const positionStyle: React.CSSProperties = isVertical
    ? { top: btnHeight, bottom: btnHeight, left: 0, right: 0 }
    : { left: barSize, right: barSize, top: 0, bottom: 0 }

  return (
    <div
      ref={ref}
      data-murasaki-track={axis}
      className="absolute cursor-default"
      style={{
        backgroundImage: TRACK_BG_IMAGE,
        backgroundSize: TRACK_BG_SIZE,
        backgroundColor: TRACK_BG_COLOR,
        ...positionStyle,
      }}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  )
}

/**
 * A single scrollbar (vertical or horizontal) with arrow buttons, track, and thumb.
 * Only renders when content overflows in the corresponding direction.
 */
export function ScrollAreaScrollbar({
  orientation,
  className,
  style,
  ...props
}: ScrollAreaScrollbarProps): React.ReactElement | null {
  const ctx = useScrollAreaContext()
  const { metrics, vTrackRef, hTrackRef, scrollStep, scrollPage, startRepeat, BAR_SIZE, BTN_HEIGHT } = ctx
  const isVertical = orientation === 'vertical'

  const visible = isVertical ? metrics.hasVertical : metrics.hasHorizontal
  if (!visible)
    return null

  return isVertical
    ? (
        <VerticalBar
          barSize={BAR_SIZE}
          btnHeight={BTN_HEIGHT}
          className={className}
          hasHorizontal={metrics.hasHorizontal}
          scrollPage={scrollPage}
          scrollStep={scrollStep}
          startRepeat={startRepeat}
          style={style}
          trackRef={vTrackRef}
          {...props}
        />
      )
    : (
        <HorizontalBar
          barSize={BAR_SIZE}
          btnHeight={BTN_HEIGHT}
          className={className}
          hasVertical={metrics.hasVertical}
          scrollPage={scrollPage}
          scrollStep={scrollStep}
          startRepeat={startRepeat}
          style={style}
          trackRef={hTrackRef}
          {...props}
        />
      )
}

// ─── Vertical scrollbar ──────────────────────────────────────────────────────

interface VerticalBarProps extends React.ComponentProps<'div'> {
  barSize: number
  btnHeight: number
  hasHorizontal: boolean
  trackRef: React.RefObject<HTMLDivElement | null>
  scrollStep: (axis: 'v' | 'h', direction: -1 | 1) => void
  scrollPage: (axis: 'v' | 'h', direction: -1 | 1) => void
  startRepeat: (action: () => void) => () => void
}

function VerticalBar({
  barSize,
  btnHeight,
  hasHorizontal,
  trackRef,
  scrollStep,
  scrollPage,
  startRepeat,
  className,
  style,
  ...props
}: VerticalBarProps): React.ReactElement {
  const { metrics } = useScrollAreaContext()
  const height = hasHorizontal
    ? `calc(100% - ${btnHeight}px)`
    : '100%'

  return (
    <div
      data-murasaki-vbar=""
      className={cnPure('absolute top-0 right-0 [z-index:var(--react98-layer-scrollbar-z-index)] box-border will-change-transform', className)}
      style={{ width: barSize, height, ...style }}
      {...props}
    >
      <ArrowButton
        action={() => { scrollStep('v', -1) }}
        direction="up"
        startRepeat={startRepeat}
      />
      <Track
        ref={trackRef}
        axis="v"
        btnHeight={btnHeight}
        scrollPage={scrollPage}
        thumbTop={metrics.vThumbTop}
      >
        <ScrollAreaThumb orientation="vertical" />
      </Track>
      <ArrowButton
        action={() => { scrollStep('v', 1) }}
        className="absolute bottom-0 left-0"
        direction="down"
        startRepeat={startRepeat}
      />
    </div>
  )
}
// ─── Horizontal scrollbar ────────────────────────────────────────────────────

interface HorizontalBarProps extends React.ComponentProps<'div'> {
  barSize: number
  btnHeight: number
  hasVertical: boolean
  trackRef: React.RefObject<HTMLDivElement | null>
  scrollStep: (axis: 'v' | 'h', direction: -1 | 1) => void
  scrollPage: (axis: 'v' | 'h', direction: -1 | 1) => void
  startRepeat: (action: () => void) => () => void
}

function HorizontalBar({
  barSize,
  btnHeight,
  hasVertical,
  trackRef,
  scrollStep,
  scrollPage,
  startRepeat,
  className,
  style,
  ...props
}: HorizontalBarProps): React.ReactElement {
  const { metrics } = useScrollAreaContext()
  const width = hasVertical
    ? `calc(100% - ${barSize}px)`
    : '100%'

  return (
    <div
      data-murasaki-hbar=""
      className={cnPure('absolute bottom-0 left-0 [z-index:var(--react98-layer-scrollbar-z-index)] box-border will-change-transform', className)}
      style={{ height: btnHeight, width, ...style }}
      {...props}
    >
      <ArrowButton
        action={() => { scrollStep('h', -1) }}
        className="absolute left-0 top-0"
        direction="left"
        startRepeat={startRepeat}
      />
      <Track
        ref={trackRef}
        axis="h"
        barSize={barSize}
        scrollPage={scrollPage}
        thumbLeft={metrics.hThumbLeft}
      >
        <ScrollAreaThumb orientation="horizontal" />
      </Track>
      <ArrowButton
        action={() => { scrollStep('h', 1) }}
        className="absolute right-0 top-0"
        direction="right"
        startRepeat={startRepeat}
      />
    </div>
  )
}

// ─── Arrow button ────────────────────────────────────────────────────────────

const ICON_MAP = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  left: ArrowLeftIcon,
  right: ArrowRightIcon,
} as const

interface ArrowButtonProps {
  direction: 'up' | 'down' | 'left' | 'right'
  action: () => void
  startRepeat: (action: () => void) => () => void
  className?: string
}

function ArrowButton({ direction, action, startRepeat, className }: ArrowButtonProps): React.ReactElement {
  const [pressed, setPressed] = React.useState(false)
  const cleanupRef = React.useRef<(() => void) | null>(null)
  const Icon = ICON_MAP[direction]

  const onMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    setPressed(true)
    cleanupRef.current = startRepeat(action)

    const onUp = (): void => {
      setPressed(false)
      cleanupRef.current?.()
      cleanupRef.current = null
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mouseup', onUp)
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  return (
    <div
      data-murasaki-btn={direction}
      className={cnPure(
        'relative cursor-default box-border shrink-0 overflow-hidden',
        className,
      )}
      style={{ width: 16, height: 17 }}
      onMouseDown={onMouseDown}
    >
      <Icon className="block pointer-events-none" pressed={pressed} />
    </div>
  )
}
