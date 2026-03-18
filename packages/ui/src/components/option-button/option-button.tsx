import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'

import * as React from 'react'
import { RadioBorderIcon, RadioDotIcon } from './option-button-icons'
import { useOptionButtonGroupContext } from './option-context'

const labelVariants = cva([
  'inline-flex',
  'items-center',
  'cursor-pointer',
  'select-none',
  'gap-2',
  'leading-[13px]',
  'relative',
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
  // input:checked + label .radio-dot { show dot }
  'checked:[&+label_.radio-dot]:block',
  // input[disabled]:checked + label .radio-dot { gray out dot }
  'disabled:checked:[&+label_.radio-dot]:text-(--gray-text)',
])

const radioBorderVariants = cva([
  'absolute',
  'top-0',
  'left-[calc(-1*(var(--option-size)+var(--label-spacing)))]',
])

const radioDotVariants = cva([
  'radio-dot',
  'absolute',
  'hidden',
  'text-(--button-text)',
  'top-1',
  'left-[calc(-1*(var(--option-size)+var(--label-spacing))+4px)]',
])

interface OptionButtonProps
  extends Omit<React.ComponentProps<'input'>, 'name' | 'type'>,
  VariantProps<typeof optionButtonVariants> {
  /**
   * Additional className for the label element.
   */
  labelClassName?: string
}

export function OptionButton({
  children,
  className,
  disabled,
  id,
  labelClassName,
  onChange,
  value,
  ...props
}: OptionButtonProps): React.ReactElement {
  const {
    name,
    onChange: onGroupChange,
    selectedValue,
  } = useOptionButtonGroupContext()

  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const isChecked
    = selectedValue !== undefined ? selectedValue === value : undefined

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(e)
    if (e.target.checked && value !== undefined) {
      onGroupChange?.(String(value))
    }
  }

  return (
    <>
      <input
        checked={isChecked}
        className={cn(optionButtonVariants({ className }))}
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={handleChange}
        type="radio"
        value={value}
        {...props}
      />
      <OptionButtonLabel className={labelClassName} disabled={disabled} htmlFor={inputId}>
        {children}
      </OptionButtonLabel>
    </>
  )
}

interface OptionButtonLabelProps
  extends React.ComponentProps<'label'>,
  VariantProps<typeof labelVariants> {
  disabled?: boolean | undefined
}

function OptionButtonLabel({
  children,
  className,
  disabled,
  ...props
}: OptionButtonLabelProps): React.ReactElement {
  return (
    <label className={cn(labelVariants({ className }))} {...props}>
      <RadioBorderIcon className={cn(radioBorderVariants())} disabled={disabled} />
      <RadioDotIcon className={cn(radioDotVariants())} />
      {children}
    </label>
  )
}
