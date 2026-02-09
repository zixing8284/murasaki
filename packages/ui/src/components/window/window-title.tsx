import { cn } from '#/lib/utils'

export interface WindowTitleProps extends React.ComponentProps<'div'> {
  /** Icon element to display before title */
  icon?: React.ReactNode
}

export function WindowTitle({
  children,
  className,
  icon,
  ...props
}: WindowTitleProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-1 truncate px-1',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}
