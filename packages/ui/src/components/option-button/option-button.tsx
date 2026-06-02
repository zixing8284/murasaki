import type { VariantProps } from 'class-variance-authority'
import type { OptionGroupProps } from './option-context'

import { cva } from 'class-variance-authority'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { RadioBorderIcon, RadioDotIcon } from './option-button-icons'
import { OptionButtonGroupContext, useOptionButtonGroupContext } from './option-context'

export type { OptionGroupProps } from './option-context'

const labelVariants = cva([
  'inline-flex',
  'items-center',
  'cursor-pointer',
  'select-none',
  'gap-2',
  'leading-3.25',
  'relative',
  'text-(--button-text)',
  '[--radio-inner-bg:var(--window)]',
  'ml-[calc(var(--option-size)+var(--label-spacing))]',
])

const optionButtonVariants = cva([
  'appearance-none',
  'm-0',
  'bg-transparent',
  'fixed',
  'opacity-0',
  'border-none',
  // input:focus + label { outline: 1px dotted var(--button-text); }
  'focus:[&+label]:outline-dotted',
  'focus:[&+label]:outline-1',
  'focus:[&+label]:outline-(--button-text)',
  // input:active + label { gray inner circle on press }
  'active:[&+label]:[--radio-inner-bg:var(--button-face)]',
  // input:checked + label svg { show dot }
  'checked:[&+label_svg]:block',
  // input[disabled] + label { gray text + default cursor + etched effect + disabled bg }
  'disabled:[&+label]:text-(--gray-text)',
  'disabled:[&+label]:cursor-default',
  'disabled:[&+label]:[text-shadow:1px_1px_0_var(--button-hilight)]',
  'disabled:[&+label]:[--radio-inner-bg:var(--button-face)]',
])

const radioBorderVariants = cva([
  'absolute',
  'top-0',
  'left-[calc(-1*(var(--option-size)+var(--label-spacing)))]',
])

const radioDotVariants = cva([
  'absolute',
  'hidden',
  'text-(--button-text)',
  'top-1',
  'left-[calc(-1*(var(--option-size)+var(--label-spacing))+4px)]',
])

export interface OptionButtonProps
  extends Omit<React.ComponentProps<'input'>, 'name' | 'onChange' | 'type'>,
  VariantProps<typeof optionButtonVariants> {
  /**
   * Additional className for the label element.
   */
  labelClassName?: string
}

export function OptionButton({
  checked,
  children,
  className,
  disabled,
  id,
  labelClassName,
  value,
  ...props
}: OptionButtonProps): React.ReactElement {
  const {
    name,
    onValueChange: onGroupValueChange,
    value: groupValue,
  } = useOptionButtonGroupContext()

  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const isChecked
    = groupValue !== undefined ? groupValue === value : undefined
  const currentChecked = isChecked ?? checked

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.checked && value !== undefined) {
      onGroupValueChange?.(String(value))
    }
  }

  return (
    <>
      <input
        checked={currentChecked}
        className={cn(optionButtonVariants({ className }))}
        data-checked={currentChecked || undefined}
        data-disabled={disabled || undefined}
        disabled={disabled}
        id={inputId}
        name={name}
        type="radio"
        value={value}
        {...props}
        onChange={handleOptionChange}
      />
      <OptionButtonLabel
        checked={currentChecked ?? false}
        className={labelClassName}
        data-checked={currentChecked || undefined}
        data-disabled={disabled || undefined}
        disabled={disabled ?? false}
        htmlFor={inputId}
      >
        {children}
      </OptionButtonLabel>
    </>
  )
}

interface OptionButtonLabelProps
  extends Omit<React.ComponentProps<'label'>, 'disabled'>,
  VariantProps<typeof labelVariants> {
  checked?: boolean
  disabled?: boolean
}

function OptionButtonLabel({
  checked,
  children,
  className,
  disabled,
  ...props
}: OptionButtonLabelProps): React.ReactElement {
  return (
    <label className={cn(labelVariants({ className }))} {...props}>
      <RadioBorderIcon className={cn(radioBorderVariants())} />
      <RadioDotIcon
        className={cn(
          radioDotVariants(),
          checked && 'block',
          checked && disabled && 'text-(--gray-text)',
        )}
      />
      {children}
    </label>
  )
}

// ─── OptionGroup ──────────────────────────────────────────────────────────────

export function OptionGroup(
  props: React.PropsWithChildren<OptionGroupProps>,
): React.ReactElement {
  const { children, defaultValue, name, onValueChange, value } = props
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const currentValue = value ?? internalValue

  const handleValueChange = (nextValue: string): void => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }

    onValueChange?.(nextValue)
  }

  return (
    <OptionButtonGroupContext value={{ name, onValueChange: handleValueChange, value: currentValue }}>
      {children}
    </OptionButtonGroupContext>
  )
}
OptionGroup.Option = OptionButton
