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
    'bg-(--window)',
    'text-(--window-text)',
    'p-0.5',
    'overflow-hidden',
  ],
  {
    variants: {
      disabled: {
        true: [
          'bg-(--button-face)',
          'text-(--gray-text)',
        ],
      },
    },
  },
)

export interface FieldPanelProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof fieldPanelVariants> {}

export function FieldPanel({
  children,
  className,
  disabled,
  ...props
}: FieldPanelProps): React.ReactElement {
  return (
    <div
      className={cn(fieldPanelVariants({ disabled, className }))}
      aria-disabled={disabled || undefined}
      {...props}
    >
      <ScrollArea className="size-full">
        {children}
      </ScrollArea>
    </div>
  )
}
