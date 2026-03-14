import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

// ============================================================================
// Styles
// ============================================================================

const tabListVariants = cva([
  'relative',
  'm-0',
  '-mb-0.5',
  'p-0',
  'pt-0.5', // Reserve space for selected tab's negative margin
  'flex',
  'list-none',
])

// ============================================================================
// Component
// ============================================================================

export type TabListProps = React.ComponentProps<'menu'>

export function TabList({ children, className, ...props }: TabListProps): React.ReactElement {
  return (
    <menu
      role="tablist"
      className={cn(tabListVariants(), className)}
      {...props}
    >
      {children}
    </menu>
  )
}
