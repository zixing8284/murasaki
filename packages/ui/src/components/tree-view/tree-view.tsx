import { cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { useRovingFocus } from '../../primitives/use-roving-focus'

const treeViewItemStyles = cva(
  [
    'flex',
    'items-center',
    'gap-0.5',
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
        branch: [],
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
  'text-(--window-text)',
  'leading-none',
  'overflow-hidden',
])

/** Centered crisp `+` glyph shown on a collapsed branch. */
function TreeExpandGlyph(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 7 7" width="7" height="7" shapeRendering="crispEdges" fill="currentColor">
      <rect x="0" y="3" width="7" height="1" />
      <rect x="3" y="0" width="1" height="7" />
    </svg>
  )
}

/** Centered crisp `-` glyph shown on an expanded branch. */
function TreeCollapseGlyph(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 7 7" width="7" height="7" shapeRendering="crispEdges" fill="currentColor">
      <rect x="0" y="3" width="7" height="1" />
    </svg>
  )
}

// Nested branch list: one level of indentation plus the dotted "elbow"
// connectors (a vertical dotted spine with a horizontal stub into each child).
// The stub reaches almost to the child glyph so the dotted line reads as
// touching it (Win98 tree spacing).
const treeGroupBase = 'list-none border-l border-dotted border-(--button-shadow) [&>li]:relative [&>li]:before:content-[\'\'] [&>li]:before:block [&>li]:before:absolute [&>li]:before:top-2.75 [&>li]:before:border-b [&>li]:before:border-dotted [&>li]:before:border-(--button-shadow)'

const treeGroupClassName = `${treeGroupBase} pl-4 ml-2 [&>li]:before:-left-4 [&>li]:before:w-4`

// Top-level group under a toggle-less namespace root (Desktop): pull the
// children left so their disclosure box sits beneath the root icon, while the
// dotted spine still drops from under that icon to connect them.
const treeRootGroupClassName = `${treeGroupBase} pl-1 ml-0.5 [&>li]:before:-left-1 [&>li]:before:w-1`

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
  /** Callback fired when the user toggles expand/collapse (controlled mode). */
  onExpandedChange?: (expanded: boolean) => void
  /** Whether this item is currently selected (shows highlight) */
  selected?: boolean
  /**
   * Render a branch with no expand/collapse control: its children are always
   * shown and the leading disclosure box is omitted. Use for a namespace root
   * (e.g. Desktop) whose own children carry the toggles instead.
   */
  hideToggle?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Icon to show when the branch is collapsed (replaces the default `+` glyph) */
  expandIcon?: React.ReactNode
  /** Icon to show when the branch is expanded (replaces the default `-` glyph) */
  collapseIcon?: React.ReactNode
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
  hideToggle = false,
  disabled = false,
  expandIcon,
  collapseIcon,
  className,
  onClick,
}: TreeViewItemProps): React.ReactElement {
  const hasChildren = Boolean(children)
  const isControlled = expandedProp !== undefined
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded)
  const expanded = isControlled ? expandedProp : internalExpanded

  const setExpanded = (next: boolean): void => {
    if (disabled)
      return
    if (isControlled)
      onExpandedChange?.(next)
    else
      setInternalExpanded(next)
  }

  const activate = (): void => {
    if (!disabled)
      onClick?.()
  }

  // Toggle-less branch (namespace root): always show children, no disclosure.
  if (hasChildren && hideToggle) {
    return (
      <li className={cn('list-none', className)}>
        <div
          role="treeitem"
          aria-expanded
          aria-disabled={disabled || undefined}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          tabIndex={disabled || !onClick ? -1 : 0}
          className={cn(treeViewItemStyles({ variant: 'leaf', disabled, selected, interactive: Boolean(onClick) }))}
          onClick={activate}
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
        <ul role="group" className={treeRootGroupClassName}>
          {children}
        </ul>
      </li>
    )
  }

  if (hasChildren) {
    // Windows Explorer tree semantics: the disclosure box is the only
    // single-click expand/collapse target. The row itself selects/activates on
    // single click and toggles only on double click, so clicking the icon or
    // label never expands or collapses the branch.
    return (
      <li className={cn('list-none', className)}>
        <div
          role="treeitem"
          aria-expanded={expanded}
          aria-disabled={disabled || undefined}
          data-expanded={expanded || undefined}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          className={cn(treeViewItemStyles({ variant: 'branch', disabled, selected }))}
          onClick={activate}
          onDoubleClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              onClick()
            }
          }}
        >
          <span
            aria-hidden="true"
            data-tree-view-disclosure=""
            className={treeViewDisclosureStyles()}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            onDoubleClick={e => e.stopPropagation()}
          >
            {expanded ? (collapseIcon ?? <TreeCollapseGlyph />) : (expandIcon ?? <TreeExpandGlyph />)}
          </span>
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="leading-none">{label}</span>
        </div>
        {expanded && (
          <ul role="group" className={treeGroupClassName}>
            {children}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li className={cn('list-none', className)}>
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
    </li>
  )
}

interface TreeViewProps {
  /** The tree items to display */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

// Collapsed branches unmount their children, so every `[role="treeitem"]` in the
// DOM is visible and no roving-focus filtering is required.

// The first child treeitem of an expanded branch row (the group `<ul>` is the
// row's next sibling inside the shared `<li>`).
function firstChildTreeItem(row: HTMLElement): HTMLElement | null {
  return row.parentElement?.querySelector<HTMLElement>(
    ':scope > ul[role="group"] > li > [role="treeitem"]',
  ) ?? null
}

// The parent branch row of a nested treeitem, or `null` at the top level.
function parentTreeItem(row: HTMLElement): HTMLElement | null {
  const group = row.parentElement?.parentElement
  if (!group || group.getAttribute('role') !== 'group')
    return null
  return group.parentElement?.querySelector<HTMLElement>(':scope > [role="treeitem"]') ?? null
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
  })

  // ARIA TreeView pattern for the horizontal axis:
  //   ArrowRight on a collapsed branch expands it; on an expanded branch moves
  //   focus to the first child treeitem.
  //   ArrowLeft on an expanded branch collapses it; on a leaf or collapsed
  //   branch moves focus to its parent treeitem.
  // Expand/collapse reuses each row's own disclosure control so the keyboard
  // and pointer paths share one toggle implementation.
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

    const disclosure = active.querySelector<HTMLElement>(':scope > [data-tree-view-disclosure]')
    const isExpanded = active.getAttribute('aria-expanded') === 'true'

    if (event.key === 'ArrowRight') {
      if (disclosure && !isExpanded) {
        event.preventDefault()
        disclosure.click()
        return
      }
      const child = firstChildTreeItem(active)
      if (child) {
        event.preventDefault()
        child.focus()
      }
      return
    }

    // ArrowLeft
    if (disclosure && isExpanded) {
      event.preventDefault()
      disclosure.click()
      return
    }
    const parent = parentTreeItem(active)
    if (parent) {
      event.preventDefault()
      parent.focus()
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
