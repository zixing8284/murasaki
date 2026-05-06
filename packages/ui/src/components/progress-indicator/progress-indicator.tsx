import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

const containerVariants = cva(
  [
    'relative',
    'h-8',
    'p-1',
    'box-border',
    'appearance-none',
    'rounded-none',
    'border-none',
  ],
  {
    variants: {
      shadow: {
        true: 'shadow-(--shadow-sunken-inner)',
        false: '',
      },
    },
    defaultVariants: {
      shadow: true,
    },
  },
)

// Tile width in pixels (w-4 = 16px, includes border due to box-sizing: border-box)
const TILE_WIDTH = 16

// Debounce helper for resize handling
function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

interface ProgressIndicatorProps
  extends Omit<React.ComponentProps<'div'>, 'children'>,
  VariantProps<typeof containerVariants> {
  /** Progress value from 0 to 100 */
  value: number
  /** Visual style: 'default' for smooth bar, 'tile' for segmented blocks */
  variant?: 'default' | 'tile'
  /** Whether to hide the percentage text (only applies to default variant) */
  hideValue?: boolean
}

export function ProgressIndicator({
  value,
  variant = 'default',
  hideValue = false,
  shadow = true,
  className,
  ...props
}: ProgressIndicatorProps): React.ReactElement {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value))

  // For tile variant: track container ref and tile count
  const tilesWrapperRef = useRef<HTMLDivElement>(null)
  const [tileCount, setTileCount] = useState(0)

  useLayoutEffect(() => {
    if (variant !== 'tile') {
      return
    }

    const calculateAndSetTiles = (): void => {
      if (!tilesWrapperRef.current)
        return
      const containerWidth
        = tilesWrapperRef.current.getBoundingClientRect().width
      const progressWidth = (clampedValue / 100) * containerWidth
      const newTileCount = Math.ceil(progressWidth / TILE_WIDTH)
      setTileCount(newTileCount)
    }

    // Use requestAnimationFrame to batch layout reads
    window.requestAnimationFrame(calculateAndSetTiles)

    // Use ResizeObserver for better performance than window resize event
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        calculateAndSetTiles()
      }, 100),
    )

    if (tilesWrapperRef.current) {
      resizeObserver.observe(tilesWrapperRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [clampedValue, variant])

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(containerVariants({ shadow, className }))}
      data-value={clampedValue}
      data-variant={variant}
      {...props}
    >
      {/* Progress bar fill */}
      <div className="h-full w-full overflow-hidden">
        {variant === 'tile'
          ? (
              <div ref={tilesWrapperRef} className="flex h-full w-full">
                {Array.from({ length: tileCount }).map((_, index) => (
                  <span
                    key={`tile-${String(tileCount)}-${String(index)}`}
                    className="border-(--button-face) bg-(--hilight) inline-block h-full w-4
                  shrink-0 border-x will-change-auto"
                  />
                ))}
              </div>
            )
          : (
              <>
                {/* Bottom layer: light background with dark text */}
                <div
                  className="bg-(--window) text-(--window-text) relative flex h-full w-full
                items-center justify-center"
                >
                  {!hideValue && (
                    <span className="text-xs">
                      {Math.round(clampedValue)}
                      %
                    </span>
                  )}
                </div>
                {/* Top layer: progress bar with inverted text, clipped by progress value */}
                <div
                  className="bg-(--hilight) text-(--hilight-text) absolute inset-1 flex
                items-center justify-center will-change-[clip-path]"
                  style={{
                    clipPath: `polygon(0 0, ${String(clampedValue)}% 0, ${String(clampedValue)}% 100%, 0 100%)`,
                    transition: 'clip-path 0.4s linear',
                  }}
                >
                  {!hideValue && (
                    <span className="text-xs">
                      {Math.round(clampedValue)}
                      %
                    </span>
                  )}
                </div>
              </>
            )}
      </div>
    </div>
  )
}
