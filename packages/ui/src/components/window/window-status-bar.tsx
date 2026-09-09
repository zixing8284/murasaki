import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

// Canonical Win98 status bar: fixed to the window's bottom edge, flush to the
// left/right frame so the resize grip lands in the bottom-right corner, with a
// consistent top gap. Consumers should not re-pad the bar per window.
const statusBarVariants = cva([
  'flex',
  'shrink-0',
  'gap-px',
  'pt-1',
])

const statusBarFieldVariants = cva([
  'shadow-(--shadow-status-field)',
  'py-0.5',
  'px-1.5',
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
