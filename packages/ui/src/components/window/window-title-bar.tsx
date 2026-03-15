import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useWindowContext } from './window-context'

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
        true: 'bg-linear-to-r from-(--active-title) to-(--gradient-active-title) text-(--title-text)',
        false: 'bg-linear-to-r from-(--inactive-title) to-(--gradient-inactive-title) text-(--inactive-title-text)',
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
  ref,
  onDoubleClick,
  ...props
}: WindowTitleBarProps): React.ReactElement {
  const { state, actions } = useWindowContext()

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    actions.toggleMaximized()
    onDoubleClick?.(e)
  }

  return (
    <div
      ref={ref}
      className={cn(
        titleBarVariants({ active: state.active }),
        className,
      )}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      {children}
    </div>
  )
}
