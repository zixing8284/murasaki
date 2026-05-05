import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const contentVariants = cva([
  'flex-1',
  'min-h-0',
  'bg-(--button-face)',
  'text-(--window-text)',
  'overflow-hidden',
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
