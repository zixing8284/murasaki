import { cva } from 'class-variance-authority'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { useRovingFocus, useTypeahead } from '../../primitives'

// ─── Menu ─────────────────────────────────────────────────────────────────────

const menuVariants = cva([
  'bg-(--menu)',
  'shadow-(--shadow-raised)',
  'flex',
  'flex-col',
  'items-stretch',
  'p-0.5',
  'list-none',
  'm-0',
])

export interface MenuProps extends React.ComponentProps<'menu'> {}

const MENU_ITEM_SELECTOR = '[role="menuitem"]'

function getEnabledMenuItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR))
    .filter(item => item.getAttribute('aria-disabled') !== 'true')
}

function getMenuItemText(item: HTMLElement): string {
  return item.textContent?.trim().toLowerCase() ?? ''
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement))
    return false

  if (target.isContentEditable)
    return true

  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
}

export function Menu({
  className,
  onKeyDown,
  ref,
  ...props
}: MenuProps): React.ReactElement {
  const menuRef = React.useRef<HTMLMenuElement | null>(null)

  const setMenuRef = React.useCallback((node: HTMLMenuElement | null) => {
    menuRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    }
    else if (ref) {
      ref.current = node
    }
  }, [ref])

  useRovingFocus({
    enabled: true,
    containerRef: menuRef,
    itemSelector: MENU_ITEM_SELECTOR,
    orientation: 'vertical',
  })

  const handleTypeaheadMatch = React.useCallback((search: string) => {
    const menu = menuRef.current
    if (!menu)
      return

    const items = getEnabledMenuItems(menu)
    if (items.length === 0)
      return

    const active = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const activeIndex = active ? items.indexOf(active) : -1
    const orderedItems = activeIndex >= 0
      ? [...items.slice(activeIndex + 1), ...items.slice(0, activeIndex + 1)]
      : items
    const match = orderedItems.find(item => getMenuItemText(item).startsWith(search))
    match?.focus()
  }, [])

  const typeahead = useTypeahead({
    enabled: true,
    onMatch: handleTypeaheadMatch,
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLMenuElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return

    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey)
      return

    if (isTypingTarget(event.target))
      return

    typeahead.onChar(event.key)
  }

  return (
    <menu
      ref={setMenuRef}
      role="menu"
      className={cn(menuVariants(), className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

const menuItemVariants = cva(
  [
    'flex',
    'flex-row',
    'items-center',
    'gap-2',
    'p-[4px_6px]',
    'm-[1px_0]',
    'list-none',
  ],
  {
    variants: {
      disabled: {
        true: ['text-(--gray-text)', 'cursor-default'],
        false: ['cursor-pointer', 'text-(--menu-text)', 'hover:bg-(--menu-hilight)', 'hover:text-(--hilight-text)'],
      },
      selected: {
        true: ['bg-(--menu-hilight)', 'text-(--hilight-text)'],
      },
    },
    defaultVariants: {
      disabled: false,
      selected: false,
    },
  },
)

export interface MenuItemProps extends React.ComponentProps<'li'> {
  icon?: React.ReactNode
  disabled?: boolean
  selected?: boolean
  /**
   * When true, always reserve space for the icon column even when `icon`
   * is `null` / `undefined`. Useful in menus where some items have icons
   * (e.g. a check glyph) and others don't, so the text stays aligned.
   */
  reserveIconSpace?: boolean
}

export function MenuItem({
  className,
  icon,
  disabled = false,
  onClick,
  onKeyDown,
  selected = false,
  reserveIconSpace = false,
  tabIndex,
  children,
  ref,
  ...props
}: MenuItemProps): React.ReactElement {
  const showIconSlot = icon != null || reserveIconSpace

  const handleClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    if (disabled) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return

    if (event.key !== 'Enter' && event.key !== ' ')
      return

    event.preventDefault()
    if (!disabled)
      event.currentTarget.click()
  }

  return (
    <li
      ref={ref}
      role="menuitem"
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
      className={cn(menuItemVariants({ disabled, selected }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      {...props}
    >
      {showIconSlot && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
    </li>
  )
}

// ─── MenuSeparator ────────────────────────────────────────────────────────────

const menuSeparatorVariants = cva([
  'border-b',
  'border-(--button-hilight)',
  'border-t',
  'border-t-(--button-shadow)',
  'm-0.5',
  'list-none',
])

export interface MenuSeparatorProps extends React.ComponentProps<'li'> {}

export function MenuSeparator({ className, ref, ...props }: MenuSeparatorProps): React.ReactElement {
  return (
    <li
      ref={ref}
      role="separator"
      className={cn(menuSeparatorVariants(), className)}
      {...props}
    />
  )
}
