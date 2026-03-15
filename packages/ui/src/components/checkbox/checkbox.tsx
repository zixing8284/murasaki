import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'
import * as React from 'react'

const labelVariants = cva([
  'inline-flex',
  'items-center',
  'cursor-pointer',
  'select-none',
  'gap-2',
  'leading-[13px]',
  'relative',
  'ml-(--checkbox-total-width)',
  // label::before — static box
  'before:content-[\'\']',
  'before:absolute',
  'before:left-(--checkbox-left)',
  'before:inline-block',
  'before:w-(--checkbox-width)',
  'before:h-(--checkbox-width)',
  'before:bg-(--button-face)',
  'before:shadow-border-field',
  'before:mr-(--label-spacing)',
  // label::after — checkmark placeholder (background set by input state)
  'after:content-[\'\']',
  'after:block',
  'after:w-(--checkmark-width)',
  'after:h-(--checkmark-width)',
  'after:absolute',
  'after:top-(--checkmark-top)',
  'after:left-[calc(var(--checkbox-left)+var(--checkmark-left))]',
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
  // input:checked + label::after { background: url(checkmark.svg); }
  'checked:[&+label::after]:bgi-icon-checkmark',
  // input[disabled] + label::before { background: var(--button-face); }
  'disabled:[&+label::before]:bg-(--button-face)',
  // input[disabled]:checked + label::after { background: url(checkmark-disabled.svg); }
  'disabled:checked:[&+label::after]:bgi-icon-checkmark-disabled',
])

interface CheckboxProps
  extends Omit<React.ComponentProps<'input'>, 'type'>,
  VariantProps<typeof checkboxVariants> {}

export function Checkbox({
  children,
  className,
  id,
  ...props
}: CheckboxProps): React.ReactElement {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  return (
    <>
      <input
        className={cn(checkboxVariants({ className }))}
        id={inputId}
        name={inputId}
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
      {children}
    </label>
  )
}
