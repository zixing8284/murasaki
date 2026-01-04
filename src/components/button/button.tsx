import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'

import React from 'react'

const buttonVariants = cva([
  'pt-0',
  'pb-0',
  'pl-3',
  'pr-3',
  'text-btn-text',
  'bg-btn-face',
  'shadow-raised',
  'focus:outline-dotted',
  'focus:outline-1',
  'focus:outline-btn-text',
  'focus:-outline-offset-4',
  'disabled:text-btn-shadow',
  'disabled:[text-shadow:1px_1px_0_var(--color-btn-hilight)]',
  'box-border',
  'border-none',
  'min-w-18.75',
  'active:not-disabled:shadow-sunken',
  'min-h-5.75',
])

export function Button({
  children,
  className,
  ...props
}: React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants>): React.ReactElement {
  return (
    <button className={cn(buttonVariants({ className }))} {...props}>
      {children}
    </button>
  )
}
