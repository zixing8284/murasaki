import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../lib/utils'

const groupBoxVariants = cva([
  // Restore user agent styles reset by Tailwind
  'block',
  'min-w-min',
  // Custom styles
  'relative',
  'mb-2',
  'mt-0 mr-0 ml-0',
  'border border-(--button-shadow)',
  'bg-(--button-face)',
  'pt-3 pr-2 pb-2 pl-2',
  '[box-shadow:inset_1px_1px_0_var(--button-hilight),1px_1px_0_var(--button-hilight)]',
])

const legendVariants = cva(['bg-(--button-face)', 'px-1'])

export interface GroupBoxProps
  extends React.ComponentProps<'fieldset'>,
  VariantProps<typeof groupBoxVariants> {
  /** Optional label displayed at the top of the group box */
  label?: React.ReactNode
}

export function GroupBox({
  children,
  className,
  label,
  ...props
}: GroupBoxProps): React.ReactElement {
  return (
    <fieldset className={cn(groupBoxVariants({ className }))} {...props}>
      {label && <legend className={cn(legendVariants())}>{label}</legend>}
      {children}
    </fieldset>
  )
}
