import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'
import * as React from 'react'

const fieldPanelVariants = cva(
  [
    'shadow-border-field',
    'bg-(--window)',
    'text-(--window-text)',
    'p-0.5',
  ],
  {
    variants: {
      disabled: {
        true: [
          'bg-(--button-face)',
          'text-(--button-shadow)',
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
      {children}
    </div>
  )
}
