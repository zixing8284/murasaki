import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { ScrollArea } from '../scroll-area/scroll-area'

const fieldPanelVariants = cva(
  [
    'shadow-border-field',
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
