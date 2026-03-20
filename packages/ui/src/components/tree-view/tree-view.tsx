import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import * as React from 'react'

const treeViewItemStyles = cva(
  [
    'flex',
    'items-center',
    'gap-1',
    'p-0.5',
    'cursor-pointer',
    'select-none',
    'focus-visible:ring-2',
    'focus-visible:outline-none',
    'focus-visible:ring-(--menu-hilight)',
  ],
  {
    variants: {
      variant: {
        summary: [
          'list-none',
          'before:block',
          'before:h-[11px]',
          'before:w-[11px]',
          'before:leading-[11px]',
          'before:pl-px',
          'before:border',
          'before:border-(--button-shadow)',
          'before:text-center',
          'before:bg-(--button-hilight)',
          'before:text-(--window-text)',
          'before:flex',
          'before:cursor-pointer',
          'before:items-center',
          'before:justify-center',
          'before:shrink-0',
          '[&::-webkit-details-marker]:content-none',
          '[&::marker]:content-none',
        ],
        leaf: [],
      },
      expanded: {
        true: 'before:content-[\'-\']',
        false: 'before:content-[\'+\']',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
      interactive: {
        true: 'hover:bg-(--menu-hottrack-light)',
        false: 'hover:bg-transparent',
      },
      selected: {
        true: [
          'bg-(--menu-hilight)',
          'text-(--hilight-text)',
        ],
        false: [],
      },
    },
    compoundVariants: [
      {
        selected: true,
        interactive: true,
        className: 'hover:bg-(--menu-hilight)',
      },
    ],
    defaultVariants: {
      selected: false,
    },
  },
)

interface TreeViewItemProps {
  /** The label to display for this item */
  label: React.ReactNode
  /** Optional icon to display before the label */
  icon?: React.ReactNode
  /** Child items to nest under this item */
  children?: React.ReactNode
  /** Whether this item is initially expanded (uncontrolled) */
  defaultExpanded?: boolean
  /** Controlled expanded state. When provided, overrides internal state. */
  expanded?: boolean
  /** Callback fired when the user attempts to toggle expand/collapse (controlled mode). */
  onExpandedChange?: (expanded: boolean) => void
  /** Whether this item is currently selected (shows highlight) */
  selected?: boolean
  /** When true and the item is expanded, clicking will not collapse it */
  preventCollapse?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler for the item */
  onClick?: () => void
}

export function TreeViewItem({
  label,
  icon,
  children,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  selected = false,
  preventCollapse = false,
  disabled = false,
  className,
  onClick,
}: TreeViewItemProps): React.ReactElement {
  const hasChildren = Boolean(children)
  const isControlled = expandedProp !== undefined
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded)
  const expanded = isControlled ? expandedProp : internalExpanded

  return (
    <li className={cn('list-none', className)}>
      {hasChildren
        ? (
            <details
              open={expanded}
              onToggle={(e) => {
                if (disabled) {
                  e.preventDefault()
                }
                else if (isControlled) {
                  onExpandedChange?.(e.currentTarget.open)
                }
                else {
                  setInternalExpanded(e.currentTarget.open)
                }
              }}
            >
              <summary
                className={cn(
                  treeViewItemStyles({
                    variant: 'summary',
                    expanded,
                    disabled,
                    selected,
                  }),
                )}
                onClick={(e) => {
                  if (preventCollapse && expanded) {
                    e.preventDefault()
                  }
                  if (!disabled) {
                    onClick?.()
                  }
                }}
              >
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="leading-none">{label}</span>
              </summary>
              <ul className="list-none pl-4 ml-4 border-l border-dotted border-(--button-shadow) [&>li]:relative [&>li]:before:content-[''] [&>li]:before:block [&>li]:before:absolute [&>li]:before:-left-4 [&>li]:before:top-2.75 [&>li]:before:w-3 [&>li]:before:border-b [&>li]:before:border-dotted [&>li]:before:border-(--button-shadow)">
                {children}
              </ul>
            </details>
          )
        : (
            <div
              role={onClick ? 'button' : undefined}
              tabIndex={disabled || !onClick ? undefined : 0}
              className={cn(
                treeViewItemStyles({
                  variant: 'leaf',
                  disabled,
                  selected,
                  interactive: Boolean(onClick),
                }),
              )}
              onClick={(e) => {
                if (disabled)
                  return
                e.stopPropagation()
                onClick?.()
              }}
              onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onClick()
                }
              }}
            >
              {icon && <span className="shrink-0">{icon}</span>}
              <span className="leading-none">{label}</span>
            </div>
          )}
    </li>
  )
}

interface TreeViewProps {
  /** The tree items to display */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

function TreeView({
  children,
  className,
}: TreeViewProps): React.ReactElement {
  return (
    <ul
      className={cn(
        'flex',
        'flex-col',
        'min-h-full',
        'bg-(--button-hilight)',
        'm-0',
        'p-1.5',
        'text-(--window-text)',
        className,
      )}
    >
      {children}
    </ul>
  )
}

export { TreeView }

export type { TreeViewItemProps, TreeViewProps }
