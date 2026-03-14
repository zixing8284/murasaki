import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useTabsContext } from './tabs-context'

// ============================================================================
// Styles
// ============================================================================

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

// ============================================================================
// Component
// ============================================================================

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
