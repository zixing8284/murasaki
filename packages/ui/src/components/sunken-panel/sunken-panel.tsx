import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { ScrollArea } from '../scroll-area/scroll-area'

const sunkenPanelVariants = cva(
  [
    'relative',
    'before:content-[\'\']',
    'before:absolute',
    'before:inset-0',
    'before:shadow-(--shadow-border-field)',
    'before:pointer-events-none',
    'before:z-[1]',
    'bg-(--button-face)',
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

export interface SunkenPanelProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof sunkenPanelVariants> {}

export function SunkenPanel({
  children,
  className,
  disabled,
  ...props
}: SunkenPanelProps): React.ReactElement {
  return (
    <div
      className={cn(sunkenPanelVariants({ disabled, className }))}
      aria-disabled={disabled || undefined}
      {...props}
    >
      <ScrollArea className="size-full">
        {children}
      </ScrollArea>
    </div>
  )
}
