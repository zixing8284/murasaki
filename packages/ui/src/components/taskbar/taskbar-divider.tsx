import { cn } from '#/lib/utils'

export interface TaskbarDividerProps extends React.ComponentProps<'div'> {}

export function TaskbarDivider({
  className,
  ref,
  ...props
}: TaskbarDividerProps): React.ReactElement {
  return (
    <div ref={ref} className={cn('flex items-center mx-0.5 gap-px', className)} {...props}>
      <div className="h-5.5 w-px border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
      <div className="shadow-(--shadow-raised) h-5 w-1" />
    </div>
  )
}
