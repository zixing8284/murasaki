import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import * as React from 'react'
import { cn } from '../../lib/utils'

import { CheckmarkIcon } from './checkbox-icons'

const labelVariants = cva([
  'inline-flex',
  'items-center',
  'cursor-pointer',
  'select-none',
  'gap-2',
  'leading-3.25',
  'relative',
  'ml-[calc(var(--checkbox-width)+var(--label-spacing))]',
  // label::before — static box
  'before:content-[\'\']',
  'before:absolute',
  'before:left-[calc(-1*(var(--checkbox-width)+var(--label-spacing)))]',
  'before:inline-block',
  'before:w-(--checkbox-width)',
  'before:h-(--checkbox-width)',
  'before:bg-(--window)',
  'before:shadow-(--shadow-border-field)',
  'before:mr-(--label-spacing)',
])

const checkboxVariants = cva([
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
  // input:active + label::before { background: var(--button-face); }
  'active:[&+label::before]:bg-(--button-face)',
  // input:checked + label svg { show checkmark }
  'checked:[&+label_svg]:block',
  // input[disabled] + label::before { background: var(--button-face); }
  'disabled:[&+label::before]:bg-(--button-face)',
  // input[disabled]:checked + label svg { gray out checkmark }
  'disabled:checked:[&+label_svg]:text-(--gray-text)',
])

const checkmarkVariants = cva([
  'absolute',
  'hidden',
  'text-(--button-text)',
  'top-0.75',
  'left-[calc(-1*(var(--checkbox-width)+var(--label-spacing))+3px)]',
])

export interface CheckboxProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'type'>,
  VariantProps<typeof checkboxVariants> {
  /** Callback fired with the next checked state. */
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({
  children,
  className,
  checked,
  defaultChecked,
  disabled,
  id,
  onCheckedChange,
  ...props
}: CheckboxProps): React.ReactElement {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
  const currentChecked = isControlled ? checked : internalChecked

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextChecked = event.target.checked

    if (!isControlled) {
      setInternalChecked(nextChecked)
    }

    onCheckedChange?.(nextChecked)
  }, [isControlled, onCheckedChange])

  return (
    <>
      <input
        checked={currentChecked}
        className={cn(checkboxVariants({ className }))}
        data-checked={currentChecked || undefined}
        data-disabled={disabled || undefined}
        disabled={disabled}
        id={inputId}
        name={inputId}
        onChange={handleChange}
        type="checkbox"
        {...props}
      />
      <CheckboxLabel htmlFor={inputId}>{children}</CheckboxLabel>
    </>
  )
}

export function CheckboxLabel({
  children,
  className,
  ...props
}: React.ComponentProps<'label'>
  & VariantProps<typeof labelVariants>): React.ReactElement {
  return (
    <label className={cn(labelVariants({ className }))} {...props}>
      <CheckmarkIcon className={cn(checkmarkVariants())} />
      {children}
    </label>
  )
}
