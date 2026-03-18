import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { CheckmarkIcon } from './checkbox-icons'

const labelVariants = cva([
  'inline-flex',
  'items-center',
  'cursor-pointer',
  'select-none',
  'gap-2',
  'leading-[13px]',
  'relative',
  'ml-[calc(var(--checkbox-width)+var(--label-spacing))]',
  // label::before — static box
  'before:content-[\'\']',
  'before:absolute',
  'before:left-[calc(-1*(var(--checkbox-width)+var(--label-spacing)))]',
  'before:inline-block',
  'before:w-(--checkbox-width)',
  'before:h-(--checkbox-width)',
  'before:bg-(--button-hilight)',
  'before:shadow-border-field',
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
  'top-[3px]',
  'left-[calc(-1*(var(--checkbox-width)+var(--label-spacing))+3px)]',
])

interface CheckboxProps
  extends Omit<React.ComponentProps<'input'>, 'type'>,
  VariantProps<typeof checkboxVariants> { }

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
      <CheckmarkIcon className={cn(checkmarkVariants())} />
      {children}
    </label>
  )
}
