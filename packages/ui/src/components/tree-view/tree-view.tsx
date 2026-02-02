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
    'focus-visible:ring-(--color-menu-hilight)',
  ],
  {
    variants: {
      variant: {
        summary: [
          'list-none',
          'before:block',
          'before:content-[\'\']',
          'before:h-[11px]',
          'before:w-[11px]',
          'before:leading-[11px]',
          'before:pl-px',
          'before:border',
          'before:border-(--color-btn-shadow)',
          'before:text-center',
          'before:bg-(--color-btn-hilight)',
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
        true: 'hover:bg-(--color-menu-hottrack-light)',
        false: 'hover:bg-transparent',
      },
    },
    compoundVariants: [
      {
        variant: 'summary',
        expanded: true,
        className: 'before:content-[\'-\']',
      },
      {
        variant: 'summary',
        expanded: false,
        className: 'before:content-[\'+\']',
      },
    ],
  },
)

interface TreeViewItemProps {
  /** The label to display for this item */
  label: React.ReactNode
  /** Optional icon to display before the label */
  icon?: React.ReactNode
  /** Child items to nest under this item */
  children?: React.ReactNode
  /** Whether this item is initially expanded */
  defaultExpanded?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler for the item (when it has no children) */
  onClick?: () => void
}

export function TreeViewItem({
  label,
  icon,
  children,
  defaultExpanded = false,
  disabled = false,
  className,
  onClick,
}: TreeViewItemProps): React.ReactElement {
  const hasChildren = Boolean(children)
  const [expanded, setExpanded] = React.useState(defaultExpanded)

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
                else {
                  setExpanded(e.currentTarget.open)
                }
              }}
            >
              <summary
                className={cn(
                  treeViewItemStyles({
                    variant: 'summary',
                    expanded,
                    disabled,
                  }),
                )}
              >
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="leading-none">{label}</span>
              </summary>
              <ul className="list-none pl-4 ml-4 border-l border-dotted border-(--color-btn-shadow) [&>li]:relative [&>li]:before:content-[''] [&>li]:before:block [&>li]:before:absolute [&>li]:before:-left-4 [&>li]:before:top-2.75 [&>li]:before:w-3 [&>li]:before:border-b [&>li]:before:border-dotted [&>li]:before:border-(--color-btn-shadow)">
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

function TreeViewRoot({
  children,
  className,
}: TreeViewProps): React.ReactElement {
  return (
    <ul
      className={cn(
        'block',
        'bg-(--color-btn-hilight)',
        'm-0',
        'p-1.5',
        'shadow-(--shadow-border-field)',
        'text-(--color-window-text)',
        className,
      )}
    >
      {children}
    </ul>
  )
}

export const TreeView = Object.assign(TreeViewRoot, {
  Item: TreeViewItem,
})

export type { TreeViewItemProps, TreeViewProps }
