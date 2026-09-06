import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '../../lib/utils'

const labelVariants = cva(
  [
    'text-(--button-text)',
    'select-none',
  ],
  {
    variants: {
      disabled: {
        true: ['text-(--gray-text)', 'cursor-default'],
        false: [],
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

export interface LabelProps
  extends React.ComponentProps<'label'>,
  VariantProps<typeof labelVariants> {}

/**
 * A themed `<label>` primitive.
 *
 * Renders a plain label element wired for the Windows 98 theme (pixel font
 * color, no text selection) with a `disabled` visual state. Compose it next to
 * any control and wire the two together with `htmlFor` / `id`.
 */
export function Label({
  className,
  disabled,
  ...props
}: LabelProps): React.ReactElement {
  return (
    <label
      data-disabled={disabled || undefined}
      className={cn(labelVariants({ disabled }), className)}
      {...props}
    />
  )
}
