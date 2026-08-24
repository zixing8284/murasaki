import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  [
    'min-h-[23px]',
    'min-w-[75px]',
    'pt-0',
    'pb-0',
    'pl-3',
    'pr-3',
    'text-(--button-text)',
    'bg-(--button-face)',
    'shadow-(--shadow-raised)',
    'text-transparent',
    'text-shadow-[0_0_0_var(--button-text)]',
    'active:not-disabled:shadow-(--shadow-sunken)',
    'active:not-disabled:text-shadow-[1px_1px_0_var(--button-text)]',
    'focus:outline-dotted',
    'focus:outline-1',
    'focus:outline-(--button-text)',
    'focus:-outline-offset-4',
    'disabled:text-(--gray-text)',
    'disabled:[text-shadow:1px_1px_0_var(--button-hilight)]',
    'box-border',
    'border-none',
  ],
  {
    variants: {
      active: {
        true: ['shadow-(--shadow-sunken)', 'bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC")]'],
      },
      primary: {
        true: ['shadow-(--shadow-raised-primary)'],
      },
      iconOnly: {
        true: [
          // Drop the 75px minimum width and the horizontal padding so a plain
          // icon button stays square instead of stretching into a pill.
          'min-w-0',
          'p-0',
          'size-[23px]',
          // The base styles paint label text through a transparent color +
          // text-shadow trick. SVG icons with `fill="currentColor"` inherit the
          // transparent color, so restore the real color and drop the shadow
          // (there is no glyph to emboss).
          'text-(--button-text)',
          'text-shadow-none',
        ],
      },
    },
  },
)

export type ButtonProps = React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants>

export function Button({
  children,
  className,
  active,
  primary,
  iconOnly,
  type = 'button',
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button type={type} className={cn(buttonVariants({ active, primary, iconOnly, className }))} data-active={active || undefined} {...props}>
      {children}
    </button>
  )
}
