import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const taskbarVariants = cva([
  'flex',
  'flex-row',
  'items-center',
  'bg-(--button-face)',
  'p-0.75',
  'shadow-(--shadow-raised)',
  'isolate',
  'z-2',
  'overflow-hidden',
  'select-none',
])

export { TaskbarDivider } from './taskbar-divider'
export type { TaskbarDividerProps } from './taskbar-divider'
export { TaskbarNotificationArea } from './taskbar-notification-area'
export type { TaskbarNotificationAreaProps } from './taskbar-notification-area'
export { TaskbarQuickLaunch } from './taskbar-quick-launch'
export type { TaskbarQuickLaunchIcon, TaskbarQuickLaunchProps } from './taskbar-quick-launch'
export { TaskbarSystemClock } from './taskbar-system-clock'
export type { TaskbarSystemClockProps } from './taskbar-system-clock'

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
