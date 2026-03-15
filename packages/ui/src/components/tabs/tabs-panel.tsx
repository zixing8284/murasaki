import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useTabsContext } from './tabs-context'

// ============================================================================
// Styles
// ============================================================================

const tabPanelVariants = cva([
  'relative',
  'z-2',
  'bg-(--button-face)',
  'p-2',
  'shadow-raised',
])

// ============================================================================
// Component
// ============================================================================

export interface TabPanelProps extends Omit<React.ComponentProps<'div'>, 'role'> {
  /** Value matching the corresponding Tab */
  value: string
}

export function TabPanel({ children, className, value, ...props }: TabPanelProps): React.ReactElement | null {
  const { selectedValue, baseId, keepMounted } = useTabsContext()
  const isSelected = selectedValue === value

  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  if (!isSelected && !keepMounted) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={cn(
        tabPanelVariants(),
        keepMounted && 'col-start-1 row-start-2',
        !isSelected && keepMounted && 'invisible',
        className,
      )}
      {...((!isSelected && keepMounted) ? { inert: true } : {})}
      {...props}
    >
      {children}
    </div>
  )
}
