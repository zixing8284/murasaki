import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

const taskbarVariants = cva([
  'flex',
  'flex-row',
  'items-center',
  'bg-(--button-face)',
  'p-0.75',
  'shadow-(--shadow-raised)',
  'z-2',
  'overflow-hidden',
  'select-none',
])

export interface TaskbarProps extends React.ComponentProps<'footer'> {}

export function Taskbar({
  children,
  className,
  ref,
  ...props
}: TaskbarProps): React.ReactElement {
  return (
    <footer
      ref={ref}
      data-area="taskbar"
      className={cn(taskbarVariants(), className)}
      {...props}
    >
      {children}
    </footer>
  )
}
