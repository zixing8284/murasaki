import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'

import * as React from 'react'

const groupBoxVariants = cva([
  // Restore user agent styles reset by Tailwind
  'block',
  'min-w-min',
  // Custom styles
  'm-0',
  'p-[calc(2*1px+var(--element-spacing))]',
  'pt-(--element-spacing)',
  'border-2',
  'bgi-border-image-groupbox',
])

const legendVariants = cva(['bg-(--button-alternate-face)', 'px-1'])

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
