import { cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { useRovingFocus } from '../../primitives/use-roving-focus'

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
    'focus-visible:ring-(--hilight)',
  ],
  {
    variants: {
      variant: {
        summary: [
          'list-none',
          '[&::-webkit-details-marker]:content-none',
          '[&::marker]:content-none',
        ],
        leaf: [],
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
      interactive: {
        true: [
          'hover:text-(--hot-tracking-color)',
          'active:bg-(--hilight)',
          'active:text-(--hilight-text)',
          'focus-visible:bg-(--hilight)',
          'focus-visible:text-(--hilight-text)',
        ],
        false: '',
      },
      selected: {
        true: [
          'bg-(--hilight)',
          'text-(--hilight-text)',
        ],
        false: [],
      },
    },
    compoundVariants: [
      {
        selected: true,
        interactive: true,
        className: 'hover:text-(--hilight-text) focus-visible:ring-(--hilight-text)',
      },
    ],
    defaultVariants: {
      selected: false,
    },
  },
)

const treeViewDisclosureStyles = cva([
  'flex',
  'h-2.75',
  'w-2.75',
  'shrink-0',
  'cursor-pointer',
  'items-center',
  'justify-center',
  'border',
  'border-(--button-shadow)',
  'bg-(--window)',
  'pl-px',
  'text-center',
  'leading-2.75',
  'text-(--window-text)',
])

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
                role="treeitem"
                aria-expanded={expanded}
                aria-disabled={disabled || undefined}
                data-expanded={expanded || undefined}
                data-selected={selected || undefined}
                data-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : 0}
                className={cn(
                  treeViewItemStyles({
                    variant: 'summary',
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
                <span
                  aria-hidden="true"
                  data-tree-view-disclosure=""
                  className={treeViewDisclosureStyles()}
                >
                  {expanded ? '-' : '+'}
                </span>
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="leading-none">{label}</span>
              </summary>
              <ul role="group" className="list-none pl-4 ml-4 border-l border-dotted border-(--button-shadow) [&>li]:relative [&>li]:before:content-[''] [&>li]:before:block [&>li]:before:absolute [&>li]:before:-left-4 [&>li]:before:top-2.75 [&>li]:before:w-3 [&>li]:before:border-b [&>li]:before:border-dotted [&>li]:before:border-(--button-shadow)">
                {children}
              </ul>
            </details>
          )
        : (
            <div
              role="treeitem"
              aria-disabled={disabled || undefined}
              data-selected={selected || undefined}
              data-disabled={disabled || undefined}
              tabIndex={disabled || !onClick ? -1 : 0}
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

// Skip treeitems inside collapsed branches. A <summary>'s own <details>
// does not count, because the summary itself is visible even when its
// children are collapsed.
function filterItem(el: HTMLElement): boolean {
  let cursor: HTMLElement | null
    = el.tagName === 'SUMMARY'
      ? el.parentElement?.parentElement ?? null
      : el.parentElement
  while (cursor) {
    if (cursor.tagName === 'DETAILS' && !(cursor as HTMLDetailsElement).open)
      return false
    cursor = cursor.parentElement
  }
  return true
}

function TreeView({
  children,
  className,
}: TreeViewProps): React.ReactElement {
  const ref = React.useRef<HTMLUListElement>(null)

  useRovingFocus({
    enabled: true,
    containerRef: ref,
    itemSelector: '[role="treeitem"]',
    orientation: 'vertical',
    loop: false,
    filterItem,
  })

  // ARIA TreeView pattern for the horizontal axis:
  //   ArrowRight on a collapsed parent expands it; on an expanded parent moves
  //   focus to the first child treeitem.
  //   ArrowLeft on an expanded parent collapses it; on a leaf or collapsed
  //   parent moves focus to its parent treeitem.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')
      return
    const active = document.activeElement
    if (!(active instanceof HTMLElement))
      return
    if (active.getAttribute('role') !== 'treeitem')
      return
    if (!ref.current?.contains(active))
      return

    const isSummary = active.tagName === 'SUMMARY'
    const details = isSummary ? (active.parentElement as HTMLDetailsElement | null) : null

    if (event.key === 'ArrowRight') {
      if (details && !details.open) {
        event.preventDefault()
        details.open = true
        details.dispatchEvent(new Event('toggle'))
        return
      }
      if (details && details.open) {
        const child = details.querySelector<HTMLElement>(':scope > ul [role="treeitem"]')
        if (child) {
          event.preventDefault()
          child.focus()
        }
      }
      return
    }

    // ArrowLeft
    if (details && details.open) {
      event.preventDefault()
      details.open = false
      details.dispatchEvent(new Event('toggle'))
      return
    }
    // Leaf, or summary of a collapsed branch: jump to the summary of the
    // enclosing details. For a leaf that is `closest('details')`; for a
    // collapsed summary it is the parent of its own details.
    const enclosingDetails = isSummary
      ? active.closest('details')?.parentElement?.closest('details')
      : active.closest('details')
    const parentSummary = enclosingDetails?.querySelector<HTMLElement>(':scope > summary[role="treeitem"]')
    if (parentSummary) {
      event.preventDefault()
      parentSummary.focus()
    }
  }

  return (
    <ul
      ref={ref}
      role="tree"
      onKeyDown={handleKeyDown}
      className={cn(
        'flex',
        'flex-col',
        'min-h-full',
        'bg-(--window)',
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
