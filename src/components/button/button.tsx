import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import React from 'react'

const buttonVariants = cva(
  [
    'min-h-[23px]',
    'min-w-[75px]',
    'pt-0',
    'pb-0',
    'pl-3',
    'pr-3',
    'text-btn-text',
    'bg-btn-face',
    'shadow-raised',
    'text-transparent',
    'text-shadow-[0_0_0_var(--color-btn-text)]',
    'active:not-disabled:shadow-sunken',
    'active:not-disabled:text-shadow-[1px_1px_0_var(--color-btn-text)]',
    'focus:outline-dotted',
    'focus:outline-1',
    'focus:outline-btn-text',
    'focus:-outline-offset-4',
    'disabled:text-btn-shadow',
    'disabled:[text-shadow:1px_1px_0_var(--color-btn-hilight)]',
    'box-border',
    'border-none',
  ],
  {
    variants: {
      active: {
        true: ['shadow-sunken', 'bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC)]'],
      },
    },
  },
)

export function Button({
  children,
  className,
  active,
  ...props
}: React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants>): React.ReactElement {
  return (
    <button className={cn(buttonVariants({ active, className }))} {...props}>
      {children}
    </button>
  )
}
