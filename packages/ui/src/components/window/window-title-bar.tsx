import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useWindowContext, useWindowRefs } from './window-context'

const titleBarVariants = cva(
  [
    'flex',
    'items-center',
    'justify-between',
    'h-[18px]',
    'mb-1',
    'px-0.5',
    'text-[11px]',
    'font-bold',
    'select-none',
  ],
  {
    variants: {
      active: {
        true: 'bg-linear-to-r from-title-active to-title-active-gradient text-title-active-text',
        false: 'bg-linear-to-r from-title-inactive to-title-inactive-gradient text-title-inactive-text',
      },
    },
    defaultVariants: {
      active: true,
    },
  },
)

export interface WindowTitleBarProps extends React.ComponentProps<'div'> {}

export function WindowTitleBar({
  children,
  className,
  ...props
}: WindowTitleBarProps): React.ReactElement {
  const { state, meta } = useWindowContext()
  const { setTitleBarRef } = useWindowRefs()
  const isDraggable = meta.draggable && !state.maximized

  return (
    <div
      ref={setTitleBarRef}
      className={cn(
        titleBarVariants({ active: state.active }),
        isDraggable && 'cursor-move',
        className,
      )}
      data-draggable={isDraggable ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
