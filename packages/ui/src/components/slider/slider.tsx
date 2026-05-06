import { cva } from 'class-variance-authority'
import * as React from 'react'

import { useCallback, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

import { RectThumbIcon, TriangleThumbIcon } from './slider-icons'

// Container variants
const containerVariants = cva(['relative', 'flex'], {
  variants: {
    vertical: {
      true: 'flex-col items-center h-37.5',
      false: 'flex-row items-center',
    },
  },
  defaultVariants: {
    vertical: false,
  },
})

// Hidden native input - preserves all native behaviors
const nativeInputVariants = cva(
  ['absolute', 'opacity-0', 'cursor-pointer', 'z-10'],
  {
    variants: {
      vertical: {
        true: [
          'w-full',
          'left-0',
          // Extend hit area beyond track for thumb overhang (half of THUMB_HEIGHT each side)
          'top-[-10.5px]',
          'h-[calc(100%+21px)]',
          // Use writing-mode to make native vertical slider work correctly
          '[writing-mode:vertical-lr]',
        ],
        false: [
          'm-0',
          'h-full',
          // Extend hit area beyond track for thumb overhang (half of THUMB_WIDTH each side)
          'left-[-5.5px]',
          'w-[calc(100%+11px)]',
        ],
      },
    },
    defaultVariants: {
      vertical: false,
    },
  },
)

// Track wrapper for proper positioning with tick offsets
const trackWrapperVariants = cva(['relative'], {
  variants: {
    vertical: {
      true: 'h-full w-2.75',
      false: 'w-full h-5.25',
    },
  },
  defaultVariants: {
    vertical: false,
  },
})

// Track styles (the groove)
const trackVariants = cva(
  [
    'absolute',
    'bg-(--window-text)',
    // Win98 track 3D effect using box-shadow
    'shadow-[1px_0_0_var(--button-hilight),1px_1px_0_var(--button-hilight),0_1px_0_var(--button-hilight),-1px_0_0_var(--button-dk-shadow),-1px_-1px_0_var(--button-dk-shadow),0_-1px_0_var(--button-dk-shadow),-1px_1px_0_var(--button-hilight),1px_-1px_var(--button-dk-shadow)]',
    'border-r',
    'border-b',
    'border-(--button-shadow)',
  ],
  {
    variants: {
      vertical: {
        true: [
          'w-0.5',
          'h-full',
          'left-1/2',
          '-translate-x-1/2',
          'border-t',
          'border-b-0',
          'shadow-[1px_0_0_var(--button-hilight),1px_1px_0_var(--button-hilight),0_1px_0_var(--button-hilight),0_-1px_0_var(--button-dk-shadow),-1px_-1px_0_var(--button-dk-shadow),-1px_0_0_var(--button-dk-shadow),-1px_1px_0_var(--button-dk-shadow),1px_-1px_var(--button-dk-shadow)]',
        ],
        false: ['h-0.5', 'w-full', 'top-1/2', '-translate-y-1/2'],
      },
    },
    defaultVariants: {
      vertical: false,
    },
  },
)

// Thumb dimensions (constant)
const THUMB_WIDTH = 11
const THUMB_HEIGHT = 21

// Thumb styles — positioning and size only (visual rendering via SVG icons)
const thumbVariants = cva(['absolute', 'pointer-events-none', 'w-2.75', 'h-5.25'], {
  variants: {
    vertical: {
      true: 'left-1/2',
      false: 'top-1/2',
    },
  },
  defaultVariants: {
    vertical: false,
  },
})

// Tick container styles - positioned relative to track wrapper
const tickContainerVariants = cva(['absolute', 'pointer-events-none'], {
  variants: {
    vertical: {
      true: 'left-full ml-1 h-full top-0',
      false: 'top-full mt-1 w-full left-0',
    },
  },
  defaultVariants: {
    vertical: false,
  },
})

// Individual tick mark styles
const tickMarkVariants = cva(['bg-(--button-text)', 'shrink-0'], {
  variants: {
    vertical: {
      true: 'w-1.5 h-px',
      false: 'w-px h-1.5',
    },
  },
  defaultVariants: {
    vertical: false,
  },
})

// Tick label styles
const tickLabelVariants = cva(
  ['text-(--button-text)', 'text-[10px]', 'select-none', 'leading-none'],
  {
    variants: {
      vertical: {
        true: 'ml-1',
        false: 'mt-0.5',
      },
    },
    defaultVariants: {
      vertical: false,
    },
  },
)

export interface TickMark {
  /** The value where the tick should appear */
  value: number
  /** Optional label to display */
  label?: string
}

interface SliderProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Use a box indicator instead of the default triangle */
  boxIndicator?: boolean
  /** Render the slider vertically */
  vertical?: boolean
  /** Tick marks with optional labels */
  ticks?: TickMark[]
}

export function Slider({
  className,
  boxIndicator = false,
  vertical = false,
  min = 0,
  max = 100,
  step = 1,
  defaultValue,
  value: controlledValue,
  onChange,
  ticks,
  disabled,
  ...props
}: SliderProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)
  const datalistId = useId()

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<number>(() =>
    defaultValue !== undefined ? Number(defaultValue) : Number(min),
  )

  // Use controlled value if provided, otherwise internal
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? Number(controlledValue) : internalValue

  // Calculate thumb position percentage
  const minNum = Number(min)
  const maxNum = Number(max)
  const percentage = ((currentValue - minNum) / (maxNum - minNum)) * 100

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(e)
    },
    [isControlled, onChange],
  )

  // Calculate thumb position (centered on track)
  const getThumbStyle = (): React.CSSProperties => {
    if (vertical) {
      return {
        bottom: `calc(${String(percentage)}% - ${String(THUMB_HEIGHT / 2)}px)`,
        transform: 'translateX(-50%) rotate(-90deg) scaleX(-1)',
      }
    }
    return {
      left: `calc(${String(percentage)}% - ${String(THUMB_WIDTH / 2)}px)`,
      transform: 'translateY(-50%)',
    }
  }

  // Calculate tick position - aligned with thumb center positions
  const getTickStyle = (tickValue: number): React.CSSProperties => {
    const tickPercentage = ((tickValue - minNum) / (maxNum - minNum)) * 100

    if (vertical) {
      return {
        position: 'absolute',
        bottom: `${String(tickPercentage)}%`,
        transform: 'translateY(50%)',
      }
    }
    return {
      position: 'absolute',
      left: `${String(tickPercentage)}%`,
      transform: 'translateX(-50%)',
    }
  }

  return (
    <div
      className={cn(containerVariants({ vertical }), className)}
      data-disabled={disabled || undefined}
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      data-value={currentValue}
    >
      {/* Track wrapper contains track, thumb, input, and ticks */}
      <div className={cn(trackWrapperVariants({ vertical }))}>
        {/* Hidden native input - handles all interaction */}
        <input
          ref={inputRef}
          type="range"
          className={cn(nativeInputVariants({ vertical }), disabled && 'cursor-default')}
          data-disabled={disabled || undefined}
          data-orientation={vertical ? 'vertical' : 'horizontal'}
          data-value={currentValue}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          list={ticks ? datalistId : undefined}
          // Use dir attribute for RTL instead of CSS direction property (MDN recommendation)
          dir={vertical ? 'rtl' : undefined}
          disabled={disabled}
          {...props}
        />

        {/* Native datalist for accessibility */}
        {ticks && (
          <datalist id={datalistId}>
            {ticks.map(tick => (
              <option key={tick.value} value={tick.value} label={tick.label} />
            ))}
          </datalist>
        )}

        {/* Custom track */}
        <div className={cn(trackVariants({ vertical }))} />

        {/* Custom thumb */}
        {boxIndicator
          ? (
              <RectThumbIcon
                className={cn(thumbVariants({ vertical }), disabled && 'grayscale')}
                style={getThumbStyle()}
              />
            )
          : (
              <TriangleThumbIcon
                className={cn(thumbVariants({ vertical }), disabled && 'grayscale')}
                style={getThumbStyle()}
              />
            )}

        {/* Custom tick marks with labels */}
        {ticks && (
          <div className={cn(tickContainerVariants({ vertical }))}>
            {ticks.map(tick => (
              <div
                key={tick.value}
                className={cn(
                  'flex',
                  vertical ? 'flex-row items-center' : 'flex-col items-center',
                )}
                style={getTickStyle(tick.value)}
              >
                <div className={cn(tickMarkVariants({ vertical }), disabled && 'bg-(--gray-text)')} />
                {tick.label && (
                  <span className={cn(tickLabelVariants({ vertical }), disabled && 'text-(--gray-text) [text-shadow:1px_1px_0_var(--button-hilight)]')}>
                    {tick.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
