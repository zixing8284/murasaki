import { cn } from '../../lib/utils'

export interface TaskbarNotificationAreaProps extends React.ComponentProps<'div'> {}

export function TaskbarNotificationArea({
  children,
  className,
  ref,
  ...props
}: TaskbarNotificationAreaProps): React.ReactElement {
  return (
    <div
      ref={ref}
      className={cn(
        'h-5.5 px-0.5 flex flex-row items-center border-l border-l-(--button-shadow) border-t border-t-(--button-shadow) border-r border-r-(--button-hilight) border-b border-b-(--button-hilight) mt-px truncate',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
