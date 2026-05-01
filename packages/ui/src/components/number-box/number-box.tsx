import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '#/lib/utils'

const wrapperVariants = cva(['inline-flex'], {
  defaultVariants: {
    labelPosition: 'left',
  },
  variants: {
    labelPosition: {
      left: ['flex-row', 'items-center', 'gap-(--grouped-element-spacing)'],
      top: ['flex-col', 'gap-1'],
    },
  },
})

const labelVariants = cva([
  'text-(--button-text)',
  'select-none',
  'whitespace-nowrap',
])

const inputWrapperVariants = cva([
  'inline-flex',
  'items-stretch',
  'relative',
])

const inputVariants = cva([
  'appearance-none',
  'rounded-none',
  'bg-(--window)',
  'shadow-(--shadow-border-field)',
  'text-(--window-text)',
  'outline-none',
  'border-none',
  'pl-2',
  'pr-1.5',
  'py-0.75',
  'leading-loose',
  'h-5.25',
  'w-full',
  'min-w-0',
  // Remove default number input spinner
  '[&::-webkit-inner-spin-button]:appearance-none',
  '[&::-webkit-outer-spin-button]:appearance-none',
  // Disabled & readonly states
  'disabled:bg-(--button-face)',
  'read-only:bg-(--button-face)',
  'read-only:text-(--gray-text)',
])

const spinnerContainerVariants = cva([
  'flex',
  'flex-col',
  'w-4',
  'ml-px',
])

const spinnerButtonVariants = cva(
  [
    'flex',
    'items-center',
    'justify-center',
    'bg-(--button-face)',
    'border-none',
    'p-0',
    'relative',
    'flex-1',
    'shadow-(--shadow-raised)',
    'active:not-disabled:shadow-(--shadow-sunken)',
    'disabled:cursor-not-allowed',
  ],
  {
    defaultVariants: {
      direction: 'up',
    },
    variants: {
      direction: {
        down: [],
        up: [],
      },
    },
  },
)

const arrowVariants = cva(
  [
    'w-0',
    'h-0',
    'border-solid',
    'border-transparent',
    'pointer-events-none',
  ],
  {
    defaultVariants: {
      direction: 'up',
      disabled: false,
    },
    variants: {
      direction: {
        down: [
          'border-t-[3px]',
          'border-l-[3px]',
          'border-r-[3px]',
        ],
        up: [
          'border-b-[3px]',
          'border-l-[3px]',
          'border-r-[3px]',
        ],
      },
      disabled: {
        false: [],
        true: [],
      },
    },
    compoundVariants: [
      {
        className: 'border-t-(--button-shadow) drop-shadow-[1px_1px_0_var(--button-hilight)]',
        direction: 'down',
        disabled: true,
      },
      {
        className: 'border-t-(--button-text)',
        direction: 'down',
        disabled: false,
      },
      {
        className: 'border-b-(--button-shadow) drop-shadow-[1px_1px_0_var(--button-hilight)]',
        direction: 'up',
        disabled: true,
      },
      {
        className: 'border-b-(--button-text)',
        direction: 'up',
        disabled: false,
      },
    ],
  },
)

interface NumberBoxProps
  extends Omit<
    React.ComponentProps<'input'>,
      'defaultValue' | 'onChange' | 'type' | 'value'
  >,
  VariantProps<typeof wrapperVariants> {
  /** Label content (alternative to label prop) */
  children?: React.ReactNode
  /** Default numeric value (uncontrolled) */
  defaultValue?: number
  /** Label text (alternative to children) */
  label?: React.ReactNode
  /** Maximum allowed value */
  max?: number
  /** Minimum allowed value */
  min?: number
  /** Callback when value changes, receives numeric value */
  onChange?: (value: number) => void
  /** Step increment/decrement amount */
  step?: number
  /** Current numeric value (controlled) */
  value?: number
  /** Additional class for wrapper */
  wrapperClassName?: string
}

export function NumberBox({
  children,
  className,
  defaultValue,
  disabled,
  id,
  label,
  labelPosition = 'left',
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  onChange,
  readOnly,
  step = 1,
  value: controlledValue,
  wrapperClassName,
  ...props
}: NumberBoxProps): React.ReactElement {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = React.useState<number>(
    defaultValue ?? 0,
  )

  // Determine if controlled
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  // Clamp value to min/max range
  const clampValue = React.useCallback(
    (val: number): number => {
      return Math.max(min, Math.min(max, val))
    },
    [max, min],
  )

  // Update value with validation
  const updateValue = React.useCallback(
    (newValue: number) => {
      const clamped = clampValue(newValue)

      if (!isControlled) {
        setInternalValue(clamped)
      }

      onChange?.(clamped)
    },
    [clampValue, isControlled, onChange],
  )

  // Handle input change
  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value

      // Allow empty string for better UX during typing
      if (inputValue === '' || inputValue === '-') {
        return
      }

      const parsed = Number.parseFloat(inputValue)
      if (!Number.isNaN(parsed)) {
        updateValue(parsed)
      }
    },
    [updateValue],
  )

  // Handle input blur - ensure valid value
  const handleInputBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = event.target.value

      // If empty or invalid, reset to clamped current value or 0
      if (inputValue === '' || inputValue === '-') {
        const fallback = clampValue(0)
        updateValue(fallback)
      }
      else {
        // Ensure the value is within range
        updateValue(currentValue)
      }

      props.onBlur?.(event)
    },
    [clampValue, currentValue, props, updateValue],
  )

  // Handle increment
  const handleIncrement = React.useCallback(() => {
    if (disabled || readOnly)
      return
    updateValue(currentValue + step)
  }, [currentValue, disabled, readOnly, step, updateValue])

  // Handle decrement
  const handleDecrement = React.useCallback(() => {
    if (disabled || readOnly)
      return
    updateValue(currentValue - step)
  }, [currentValue, disabled, readOnly, step, updateValue])

  // Label content: prefer children, fallback to label prop
  const labelContent = children ?? label

  // Check if buttons should be disabled
  const canIncrement = currentValue < max
  const canDecrement = currentValue > min

  const inputElement = (
    <div className={inputWrapperVariants()}>
      <input
        className={cn(inputVariants({ className }))}
        disabled={disabled}
        id={inputId}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        readOnly={readOnly}
        type="number"
        value={currentValue}
        {...props}
      />
      <div className={spinnerContainerVariants()}>
        <button
          aria-label="Increment"
          className={spinnerButtonVariants({ direction: 'up' })}
          disabled={(disabled ?? false) || (readOnly ?? false) || !canIncrement}
          onClick={handleIncrement}
          tabIndex={-1}
          type="button"
        >
          <span
            className={arrowVariants({
              direction: 'up',
              disabled: (disabled ?? false) || (readOnly ?? false),
            })}
          />
        </button>
        <button
          aria-label="Decrement"
          className={spinnerButtonVariants({ direction: 'down' })}
          disabled={(disabled ?? false) || (readOnly ?? false) || !canDecrement}
          onClick={handleDecrement}
          tabIndex={-1}
          type="button"
        >
          <span
            className={arrowVariants({
              direction: 'down',
              disabled: (disabled ?? false) || (readOnly ?? false),
            })}
          />
        </button>
      </div>
    </div>
  )

  // If no label, render input only
  if (!labelContent) {
    return inputElement
  }

  return (
    <div
      className={cn(
        wrapperVariants({ className: wrapperClassName, labelPosition }),
      )}
    >
      <label
        className={cn(
          labelVariants(),
          (disabled ?? readOnly) && 'text-(--gray-text)',
        )}
        htmlFor={inputId}
      >
        {labelContent}
      </label>
      {inputElement}
    </div>
  )
}
