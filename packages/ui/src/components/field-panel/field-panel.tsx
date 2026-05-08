import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../../lib/utils'
import { ScrollArea } from '../scroll-area/scroll-area'

const fieldPanelVariants = cva(
  [
    'relative',
    'before:content-[\'\']',
    'before:absolute',
    'before:inset-0',
    'before:shadow-(--shadow-border-field)',
    'before:pointer-events-none',
    'before:z-[1]',
    'p-0.5',
    'overflow-hidden',
  ],
  {
    defaultVariants: {
      variant: 'field',
    },
    variants: {
      disabled: {
        true: [],
        false: [],
      },
      variant: {
        field: ['bg-(--window)', 'text-(--window-text)'],
        sunken: ['bg-(--button-face)'],
      },
    },
    compoundVariants: [
      {
        disabled: true,
        className: ['bg-(--button-face)', 'text-(--gray-text)'],
      },
    ],
  },
)

export interface FieldPanelProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof fieldPanelVariants> {}

export function FieldPanel({
  children,
  className,
  disabled,
  variant,
  ...props
}: FieldPanelProps): React.ReactElement {
  return (
    <div
      className={cn(fieldPanelVariants({ disabled, variant, className }))}
      aria-disabled={disabled || undefined}
      {...props}
    >
      <ScrollArea className="size-full">
        {children}
      </ScrollArea>
    </div>
  )
}
