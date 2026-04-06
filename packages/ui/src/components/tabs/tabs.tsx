import { cn, cnPure } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useId, useState } from 'react'

import { TabsContext, useTabsContext } from './tabs-context'

// ============================================================================
// TabList
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

// ============================================================================
// Tab
// ============================================================================

const tabVariants = cva(
  [
    'relative',
    'z-1',
    'pb-0.5',
    'rounded-t-[3px]',
    'bg-(--button-face)',
    'cursor-pointer',
    // Border styles mimicking Windows 98 tab
    'shadow-[inset_-1px_0_var(--button-dk-shadow),inset_1px_1px_var(--button-hilight),inset_-2px_0_var(--button-shadow),inset_2px_2px_var(--button-light)]',
  ],
  {
    variants: {
      selected: {
        true: [
          'z-8',
          '-mt-0.5',
          '-ml-0.75',
          'first:ml-0',
          // Active tab has bottom border matching background
          'shadow-[inset_-1px_0_var(--button-dk-shadow),inset_1px_1px_var(--button-hilight),inset_-2px_0_var(--button-shadow),inset_2px_2px_var(--button-light)]',
        ],
        false: [],
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

const tabLabelVariants = cva(
  [
    'block',
    'm-1.5',
    'text-(--button-text)',
    'select-none',
    'outline-none',
    'focus-visible:outline-1',
    'focus-visible:outline-dotted',
    'focus-visible:outline-(--button-text)',
  ],
  {
    variants: {
      selected: {
        true: ['focus-visible:outline-none'],
        false: [],
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export interface TabProps extends Omit<React.ComponentProps<'li'>, 'role'> {
  /** Unique value identifying this tab */
  value: string
  /** Whether the tab is disabled */
  disabled?: boolean
}

export function Tab({ children, className, value, disabled, ...props }: TabProps): React.ReactElement {
  const { selectedValue, setSelectedValue, baseId } = useTabsContext()
  const isSelected = selectedValue === value

  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  const handleClick = (): void => {
    if (!disabled) {
      setSelectedValue(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!disabled) {
        setSelectedValue(value)
      }
    }
  }

  return (
    <li
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(tabVariants({ selected: isSelected }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className={cn(tabLabelVariants({ selected: isSelected }))}>
        {children}
      </span>
    </li>
  )
}

// ============================================================================
// TabPanel
// ============================================================================

const tabPanelVariants = cva([
  'relative',
  'z-2',
  'bg-(--button-face)',
  'p-2',
  'shadow-(--shadow-raised)',
])

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

// ============================================================================
// Tabs (Root)
// ============================================================================

const tabsRootVariants = cva(['inline-flex', 'flex-col'])

export interface TabsProps extends React.ComponentProps<'div'> {
  /** The default selected tab value (uncontrolled mode) */
  defaultValue?: string
  /** The selected tab value (controlled mode) */
  value?: string
  /** Callback when the selected tab changes */
  onValueChange?: (value: string) => void
  /** Keep all panels mounted in the DOM to preserve a stable height */
  keepMounted?: boolean
}

export function Tabs({
  children,
  className,
  defaultValue = '',
  value,
  onValueChange,
  keepMounted = false,
  ...props
}: TabsProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const baseId = useId()

  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue

  const setSelectedValue = (newValue: string): void => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext value={{ selectedValue, setSelectedValue, baseId, keepMounted }}>
      <div
        className={cnPure(
          keepMounted ? 'grid grid-rows-[auto_1fr]' : tabsRootVariants(),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext>
  )
}
