import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

const contentVariants = cva([
  'flex-1',
  'min-h-0',
  'bg-window-bg',
  'text-window-text',
  'p-2',
  'overflow-hidden',
  // 'sunken-panel',
])

export interface WindowContentProps extends React.ComponentProps<'div'> {}

export function WindowContent({
  children,
  className,
  ...props
}: WindowContentProps): React.ReactElement {
  return (
    <div className={cn(contentVariants(), className)} {...props}>
      {children}
    </div>
  )
}
