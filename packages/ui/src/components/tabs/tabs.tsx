import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { createContext, use, useId, useState } from 'react'

// ============================================================================
// Context
// ============================================================================

interface TabsContextValue {
  /** The currently selected tab value */
  selectedValue: string
  /** Callback to change the selected tab */
  setSelectedValue: (value: string) => void
  /** Base ID for generating unique IDs for tabs and panels */
  baseId: string
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabsContext(): TabsContextValue {
  const context = use(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs')
  }
  return context
}

// ============================================================================
// Styles
// ============================================================================

const tabsRootVariants = cva(['inline-flex', 'flex-col'])

const tabListVariants = cva([
  'relative',
  'm-0',
  '-mb-0.5',
  'p-0',
  'pt-0.5', // Reserve space for selected tab's negative margin
  'flex',
  'list-none',
])

const tabVariants = cva(
  [
    'relative',
    'z-1',
    'pb-0.5',
    'rounded-t-[3px]',
    'bg-btn-face',
    'cursor-pointer',
    // Border styles mimicking Windows 98 tab
    'shadow-[inset_-1px_0_var(--color-btn-dk-shadow),inset_1px_1px_var(--color-btn-hilight),inset_-2px_0_var(--color-btn-shadow),inset_2px_2px_var(--color-btn-light)]',
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
          'shadow-[inset_-1px_0_var(--color-btn-dk-shadow),inset_1px_1px_var(--color-btn-hilight),inset_-2px_0_var(--color-btn-shadow),inset_2px_2px_var(--color-btn-light)]',
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
    'text-btn-text',
    'select-none',
    'outline-none',
    'focus-visible:outline-1',
    'focus-visible:outline-dotted',
    'focus-visible:outline-btn-text',
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

const tabPanelVariants = cva([
  'relative',
  'z-2',
  'bg-btn-face',
  'p-2',
  'shadow-raised',
])

// ============================================================================
// Components
// ============================================================================

interface TabsRootProps extends React.ComponentProps<'div'> {
  /** The default selected tab value (uncontrolled mode) */
  defaultValue?: string
  /** The selected tab value (controlled mode) */
  value?: string
  /** Callback when the selected tab changes */
  onValueChange?: (value: string) => void
}

function TabsRoot({
  children,
  className,
  defaultValue = '',
  value,
  onValueChange,
  ...props
}: TabsRootProps): React.ReactElement {
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
    <TabsContext value={{ selectedValue, setSelectedValue, baseId }}>
      <div className={cn(tabsRootVariants(), className)} {...props}>
        {children}
      </div>
    </TabsContext>
  )
}

type TabListProps = React.ComponentProps<'menu'>

function TabList({ children, className, ...props }: TabListProps): React.ReactElement {
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

interface TabProps extends Omit<React.ComponentProps<'li'>, 'role'> {
  /** Unique value identifying this tab */
  value: string
  /** Whether the tab is disabled */
  disabled?: boolean
}

function Tab({ children, className, value, disabled, ...props }: TabProps): React.ReactElement {
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

interface TabPanelProps extends Omit<React.ComponentProps<'div'>, 'role'> {
  /** Value matching the corresponding Tab */
  value: string
}

function TabPanel({ children, className, value, ...props }: TabPanelProps): React.ReactElement | null {
  const { selectedValue, baseId } = useTabsContext()
  const isSelected = selectedValue === value

  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  if (!isSelected) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={cn(tabPanelVariants(), className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// Named Exports
// ============================================================================

export { Tab, TabList, TabPanel, TabsRoot }
export type { TabListProps, TabPanelProps, TabProps, TabsRootProps }
