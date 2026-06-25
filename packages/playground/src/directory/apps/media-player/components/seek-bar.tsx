import type { ReactElement, PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'
import { formatTime } from '../format-time'
import { SeekThumbIcon } from '../media-player-icons'

const SEEK_TICK_PERCENTAGES = Array.from({ length: 11 }, (_unused, index) => index * 10)

interface SeekBarProps {
  progress: number
  duration: number
  onSeek: (percentage: number) => void
}

export function SeekBar({ progress, duration, onSeek }: SeekBarProps): ReactElement {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  const getPercentageFromEvent = (event: ReactPointerEvent | PointerEvent): number => {
    const rect = trackRef.current?.getBoundingClientRect()

    if (!rect)
      return 0

    const offsetX = event.clientX - rect.left

    return Math.max(0, Math.min(100, (offsetX / rect.width) * 100))
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (duration <= 0)
      return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    setDragProgress(getPercentageFromEvent(event))
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!isDragging)
      return

    setDragProgress(getPercentageFromEvent(event))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!isDragging)
      return

    setIsDragging(false)
    onSeek(getPercentageFromEvent(event))
  }

  const displayProgress = isDragging ? dragProgress : progress

  return (
    <div className="px-2.5 pt-2.5 flex-1">
      <div
        ref={trackRef}
        className="relative h-3.25 bg-(--window) shadow-(--shadow-border-field) cursor-pointer before:content-[''] before:absolute before:-left-[7.5px] before:-right-[7.5px] before:top-0 before:bottom-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute -top-1 pointer-events-none"
          style={{ left: `calc(${displayProgress}% - 7.5px)` }}
        >
          <SeekThumbIcon />
        </div>
      </div>
      <div className="relative h-5 flex items-start">
        {SEEK_TICK_PERCENTAGES.map(percentage => (
          <div
            key={`tick-${percentage}`}
            className="absolute flex flex-col items-start"
            style={{ left: `${percentage}%` }}
          >
            <div className="w-px h-1.5 bg-(--button-text)" />
            {percentage % 50 === 0 && duration > 0
              ? (
                  <span
                    className="text-[9px] text-(--button-text) mt-px select-none whitespace-nowrap"
                    style={
                      percentage === 0
                        ? undefined
                        : percentage === 100
                          ? { transform: 'translateX(-100%)' }
                          : { transform: 'translateX(-50%)' }
                    }
                  >
                    {formatTime((percentage / 100) * duration)}
                  </span>
                )
              : null}
          </div>
        ))}
      </div>
    </div>
  )
}
