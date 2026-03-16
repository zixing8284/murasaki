import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'

import * as React from 'react'
import { useOptionButtonGroupContext } from './option-context'

const labelVariants = cva([
  'inline-flex',
  'items-center',
  'cursor-pointer',
  'select-none',
  'gap-2',
  'leading-[13px]',
  'relative',
  'ml-(--radio-total-width)',
  // label::before — radio border circle
  'before:content-[\'\']',
  'before:absolute',
  'before:top-0',
  'before:left-(--radio-left)',
  'before:inline-block',
  'before:w-(--option-size)',
  'before:h-(--option-size)',
  'before:mr-(--label-spacing)',
  'before:rounded-full',
  'before:bg-(--button-hilight)',
  'before:shadow-border-field',
  // label::after — radio dot placeholder (background set by input state)
  'after:content-[\'\']',
  'after:block',
  'after:w-(--radio-dot-width)',
  'after:h-(--radio-dot-width)',
  'after:absolute',
  'after:top-(--radio-dot-top)',
  'after:left-(--radio-dot-left)',
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
  // input:active + label::before { background: url(radio-border-disabled.svg); }
  'active:[&+label::before]:bgi-icon-radio-border-disabled',
  // input:checked + label::after { mask: radio-dot.svg, color: button-text }
  'checked:[&+label::after]:bgi-icon-radio-dot',
  // input[disabled] + label::before { disabled radio border }
  'disabled:[&+label::before]:bgi-icon-radio-border-disabled',
  // input[disabled]:checked + label::after { gray out radio dot }
  'disabled:checked:[&+label::after]:bgi-icon-radio-dot',
  'disabled:checked:[&+label::after]:!bg-(--gray-text)',
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
        id={inputId}
        name={name}
        onChange={handleChange}
        type="radio"
        value={value}
        {...props}
      />
      <OptionButtonLabel className={labelClassName} htmlFor={inputId}>
        {children}
      </OptionButtonLabel>
    </>
  )
}

function OptionButtonLabel({
  children,
  className,
  ...props
}: React.ComponentProps<'label'>
  & VariantProps<typeof labelVariants>): React.ReactElement {
  return (
    <label className={cn(labelVariants({ className }))} {...props}>
      {children}
    </label>
  )
}
