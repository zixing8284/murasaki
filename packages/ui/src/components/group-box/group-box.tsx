import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../lib/utils'

const groupBoxVariants = cva([
  // Restore user agent styles reset by Tailwind
  'block',
  'min-w-min',
  // Custom styles
  'm-0',
  'p-[calc(2*1px+var(--element-spacing))]',
  'pt-(--element-spacing)',
  '[box-shadow:inset_1px_1px_0_var(--button-shadow),1px_1px_0_var(--button-hilight)]',
])

const legendVariants = cva(['bg-(--button-face)', 'px-1'])

interface GroupBoxProps
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
