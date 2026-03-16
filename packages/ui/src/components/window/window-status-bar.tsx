import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

const statusBarVariants = cva([
  'flex',
  'gap-px',
  'mx-px',
])

const statusBarFieldVariants = cva([
  'shadow-sunken-outer',
  'py-[2px]',
  'px-[3px]',
], {
  variants: {
    grow: {
      true: 'grow',
      false: 'grow-0',
    },
  },
  defaultVariants: {
    grow: true,
  },
})

export interface WindowStatusBarProps extends React.ComponentProps<'div'> {}

export function WindowStatusBar({
  children,
  className,
  ...props
}: WindowStatusBarProps): React.ReactElement {
  return (
    <div className={cn(statusBarVariants(), className)} {...props}>
      {children}
    </div>
  )
}

export interface WindowStatusBarFieldProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof statusBarFieldVariants> {}

export function WindowStatusBarField({
  children,
  className,
  grow,
  ...props
}: WindowStatusBarFieldProps): React.ReactElement {
  return (
    <div className={cn(statusBarFieldVariants({ grow }), className)} {...props}>
      {children}
    </div>
  )
}
