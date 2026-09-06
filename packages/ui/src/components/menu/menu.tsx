import type { MenuSubContextValue } from './menu-sub-context'

import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../../lib/utils'
import { LayerPortal } from '../../primitives/layer-root/layer-portal'
import { useDismissable } from '../../primitives/use-dismissable'
import { useLayer } from '../../primitives/use-layer'
import { useRovingFocus } from '../../primitives/use-roving-focus'
import { useTypeahead } from '../../primitives/use-typeahead'
import { MenuRadioGroupContext, useMenuRadioGroupContext } from './menu-radio-context'
import { MenuScrollArrow, useMenuOverflow } from './menu-scroll'
import { MenuSubContext, useMenuSubContext } from './menu-sub-context'

// ─── Menu coordination ───────────────────────────────────────────────────────

interface MenuCoordinationContextValue {
  activateSub: (id: string, close: () => void) => void
  deactivateSub: (id: string) => void
}

const MenuCoordinationContext = React.createContext<MenuCoordinationContextValue | null>(null)

// ─── Menu ─────────────────────────────────────────────────────────────────────

const menuVariants = cva([
  'bg-(--menu)',
  'shadow-(--shadow-raised)',
  'flex',
  'flex-col',
  'items-stretch',
  'p-1',
  'min-w-[130px]',
  'list-none',
  'm-0',
])

export interface MenuProps extends React.ComponentProps<'menu'> {
  /**
   * When set, the menu engages a vertical max-height with Win98-style
   * up/down scroll-arrow steppers at the top and bottom edges. Items
   * outside the visible window are clipped and reached via the arrows
   * or keyboard navigation (focus auto-scrolls into view).
   */
  maxHeight?: number | undefined
}

const MENU_ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'

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
  style,
  onKeyDown,
  maxHeight,
  children,
  ref,
  ...props
}: MenuProps): React.ReactElement {
  const menuRef = React.useRef<HTMLMenuElement | null>(null)
  const overflowListRef = React.useRef<HTMLDivElement | null>(null)
  const wasMaxHeightRef = React.useRef(false)
  const activeSubRef = React.useRef<{ id: string, close: () => void } | null>(null)

  const coordination: MenuCoordinationContextValue = {
    activateSub(id, close) {
      const prev = activeSubRef.current
      if (prev && prev.id !== id)
        prev.close()
      activeSubRef.current = { id, close }
    },
    deactivateSub(id) {
      if (activeSubRef.current?.id === id)
        activeSubRef.current = null
    },
  }

  const setMenuRef = (node: HTMLMenuElement | null): void => {
    menuRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    }
    else if (ref) {
      ref.current = node
    }
  }

  useRovingFocus({
    enabled: true,
    containerRef: menuRef,
    itemSelector: MENU_ITEM_SELECTOR,
    orientation: 'vertical',
  })

  const handleTypeaheadMatch = (search: string): void => {
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
  }

  const typeahead = useTypeahead({
    enabled: true,
    onMatch: handleTypeaheadMatch,
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLMenuElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return

    // Auto-scroll the focused item into view as roving focus moves; harmless
    // when the menu isn't overflowing.
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      window.requestAnimationFrame(() => {
        const active = document.activeElement
        if (active instanceof HTMLElement && menuRef.current?.contains(active)) {
          active.scrollIntoView({ block: 'nearest' })
        }
      })
    }

    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey)
      return

    if (isTypingTarget(event.target))
      return

    typeahead.onChar(event.key)
  }

  const hasMaxHeight = typeof maxHeight === 'number' && Number.isFinite(maxHeight)
  const { canScrollUp, canScrollDown, scrollByStep } = useMenuOverflow(overflowListRef, hasMaxHeight)
  const menuStyle = hasMaxHeight
    ? { ...style, maxHeight }
    : style

  React.useLayoutEffect(() => {
    if (hasMaxHeight && !wasMaxHeightRef.current) {
      overflowListRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    }
    wasMaxHeightRef.current = hasMaxHeight
  }, [hasMaxHeight])

  return (
    <MenuCoordinationContext value={coordination}>
      <menu
        ref={setMenuRef}
        role="menu"
        className={cn(menuVariants(), hasMaxHeight && 'overflow-hidden', className)}
        style={menuStyle}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {hasMaxHeight && canScrollUp && (
          <MenuScrollArrow direction="up" onStep={() => scrollByStep(-1)} />
        )}
        <div
          ref={overflowListRef}
          role="presentation"
          data-menu-scroll-list={hasMaxHeight ? '' : undefined}
          className={cn(
            'flex flex-col items-stretch list-none m-0 p-0 min-h-0',
            hasMaxHeight && [
              'flex-1 overflow-y-auto overflow-x-hidden',
              '[scroll-snap-type:y_mandatory]',
              '[&>[role=menuitem]]:[scroll-snap-align:start]',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            ],
          )}
        >
          {children}
        </div>
        {hasMaxHeight && canScrollDown && (
          <MenuScrollArrow direction="down" onStep={() => scrollByStep(1)} />
        )}
      </menu>
    </MenuCoordinationContext>
  )
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

const menuItemVariants = cva(
  [
    'flex',
    'flex-row',
    'items-center',
    'gap-2',
    'px-[6px]',
    'py-[4px]',
    'm-[1px_0]',
    'list-none',
  ],
  {
    variants: {
      disabled: {
        true: ['text-(--gray-text)', 'cursor-default', '[text-shadow:1px_1px_0_var(--button-hilight)]'],
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

// Shared 16px indicator gutter used by the check and radio bullets. Text-only
// items opt into the same gutter via `reserveIconSpace` so their labels stay
// aligned with checkable siblings. Consumer icons are composed as children and
// are never forced to a fixed size (shadcn-style composition).
const MENU_INDICATOR_SLOT = 'flex size-[16px] shrink-0 items-center justify-center'

function MenuCheckIcon(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 7 7" width="7" height="7" shapeRendering="crispEdges" fill="currentColor">
      <rect x="0" y="3" width="1" height="2" />
      <rect x="1" y="4" width="1" height="2" />
      <rect x="2" y="5" width="1" height="2" />
      <rect x="3" y="4" width="1" height="2" />
      <rect x="4" y="3" width="1" height="2" />
      <rect x="5" y="2" width="1" height="2" />
      <rect x="6" y="1" width="1" height="2" />
    </svg>
  )
}

function MenuBulletIcon(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 4 4" width="4" height="4" shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="0" width="2" height="4" />
      <rect x="0" y="1" width="4" height="2" />
    </svg>
  )
}

export interface MenuItemProps extends React.ComponentProps<'li'> {
  disabled?: boolean
  selected?: boolean
  /**
   * When true, reserve the leading indicator gutter even though this item has
   * no icon or check. Use it so plain rows stay aligned with checkable or
   * icon-bearing siblings in the same menu. Compose icons as children.
   */
  reserveIconSpace?: boolean
}

export function MenuItem({
  className,
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
  const handleItemClick = (event: React.MouseEvent<HTMLLIElement>): void => {
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
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      {...props}
    >
      {reserveIconSpace && <span aria-hidden="true" className={MENU_INDICATOR_SLOT} />}
      {children}
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

// ─── MenuLabel ───────────────────────────────────────────────────

const menuLabelVariants = cva([
  'px-[6px]',
  'py-[4px]',
  'm-[1px_0]',
  'text-(--gray-text)',
  'select-none',
  'list-none',
])

export interface MenuLabelProps extends React.ComponentProps<'li'> {}

/** A non-interactive heading for a group of menu items. */
export function MenuLabel({ className, ref, ...props }: MenuLabelProps): React.ReactElement {
  return (
    <li ref={ref} role="presentation" className={cn(menuLabelVariants(), className)} {...props} />
  )
}

// ─── MenuShortcut ──────────────────────────────────────────────

export interface MenuShortcutProps extends React.ComponentProps<'span'> {}

/** Right-aligned accelerator hint (e.g. `Ctrl+S`) placed inside a menu item. */
export function MenuShortcut({ className, ...props }: MenuShortcutProps): React.ReactElement {
  return <span className={cn('ml-auto pl-5', className)} {...props} />
}

// ─── MenuCheckboxItem ──────────────────────────────────────────

export interface MenuCheckboxItemProps extends Omit<React.ComponentProps<'li'>, 'onChange'> {
  /** Whether the item is checked. */
  checked?: boolean
  /** Called with the next checked value when toggled. */
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

/** A menu item with a check indicator. Toggles `checked` on activation. */
export function MenuCheckboxItem({
  className,
  checked = false,
  onCheckedChange,
  disabled = false,
  onClick,
  onKeyDown,
  tabIndex,
  children,
  ref,
  ...props
}: MenuCheckboxItemProps): React.ReactElement {
  const handleClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
    if (!event.defaultPrevented)
      onCheckedChange?.(!checked)
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
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-checked={checked || undefined}
      className={cn(menuItemVariants({ disabled }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      {...props}
    >
      <span className={MENU_INDICATOR_SLOT}>{checked ? <MenuCheckIcon /> : null}</span>
      {children}
    </li>
  )
}

// ─── MenuRadioGroup ───────────────────────────────────────────

export interface MenuRadioGroupProps extends React.ComponentProps<'div'> {
  /** The value of the currently selected item. */
  value?: string
  /** Called with the next value when the selection changes. */
  onValueChange?: (value: string) => void
}

/** Groups `MenuRadioItem`s into a single-selection set. */
export function MenuRadioGroup({
  className,
  value,
  onValueChange,
  children,
  ref,
  ...props
}: MenuRadioGroupProps): React.ReactElement {
  const context = {
    value,
    onValueChange: (next: string): void => onValueChange?.(next),
  }
  return (
    <MenuRadioGroupContext value={context}>
      <div ref={ref} role="group" className={cn('contents', className)} {...props}>
        {children}
      </div>
    </MenuRadioGroupContext>
  )
}

// ─── MenuRadioItem ────────────────────────────────────────────

export interface MenuRadioItemProps extends React.ComponentProps<'li'> {
  /** The value this item selects within its `MenuRadioGroup`. */
  value: string
  disabled?: boolean
}

/** A menu item with a radio indicator. Selects its `value` on activation. */
export function MenuRadioItem({
  className,
  value,
  disabled = false,
  onClick,
  onKeyDown,
  tabIndex,
  children,
  ref,
  ...props
}: MenuRadioItemProps): React.ReactElement {
  const group = useMenuRadioGroupContext()
  const checked = group?.value === value

  const handleClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
    if (!event.defaultPrevented)
      group?.onValueChange(value)
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
      role="menuitemradio"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-checked={checked || undefined}
      className={cn(menuItemVariants({ disabled }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      {...props}
    >
      <span className={MENU_INDICATOR_SLOT}>{checked ? <MenuBulletIcon /> : null}</span>
      {children}
    </li>
  )
}

// ─── MenuSub ──────────────────────────────────────────────────────────────────

export interface MenuSubProps {
  children: React.ReactNode
  /** Controlled open state. When omitted, the submenu manages its own state. */
  open?: boolean
  /** Called with the next open value when the user opens or closes the submenu. */
  onOpenChange?: (open: boolean) => void
  /** Pixel delay before hover opens the submenu. Defaults to 120ms. */
  hoverOpenDelay?: number
  /** Pixel delay before hover closes the submenu. Defaults to 200ms. */
  hoverCloseDelay?: number
}

/**
 * Root for a nested submenu. Pair with `<MenuSubTrigger>` (an item inside the
 * parent `<Menu>`) and `<MenuSubContent>` (the portalled child menu).
 */
export function MenuSub({
  children,
  open: openProp,
  onOpenChange,
  hoverOpenDelay = 46,
  hoverCloseDelay = 0,
}: MenuSubProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const menu = React.use(MenuCoordinationContext)
  const subId = React.useId()

  const triggerRef = React.useRef<HTMLLIElement | null>(null)
  const contentRef = React.useRef<HTMLElement | null>(null)
  const openTimerRef = React.useRef<number | null>(null)
  const closeTimerRef = React.useRef<number | null>(null)

  const setOpen = React.useCallback((next: boolean): void => {
    if (!isControlled)
      setUncontrolledOpen(next)
    onOpenChange?.(next)
  }, [isControlled, setUncontrolledOpen, onOpenChange])

  const setTriggerRef = (node: HTMLLIElement | null): void => {
    triggerRef.current = node
  }

  const setContentRef = (node: HTMLElement | null): void => {
    contentRef.current = node
  }

  const cancelOpen = (): void => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }

  const cancelClose = (): void => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleOpen = (): void => {
    cancelClose()
    if (open || openTimerRef.current !== null)
      return
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null
      setOpen(true)
    }, hoverOpenDelay)
  }

  const scheduleClose = (): void => {
    cancelOpen()
    if (!open || closeTimerRef.current !== null)
      return
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, hoverCloseDelay)
  }

  React.useEffect(() => {
    return () => {
      if (openTimerRef.current !== null)
        window.clearTimeout(openTimerRef.current)
      if (closeTimerRef.current !== null)
        window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  // Coordinate with parent Menu: when this submenu opens, close siblings.
  React.useEffect(() => {
    if (!menu)
      return
    if (open) {
      menu.activateSub(subId, () => setOpen(false))
    }
    else {
      menu.deactivateSub(subId)
    }
  }, [open, menu, subId, setOpen])

  const value: MenuSubContextValue = {
    open,
    setOpen,
    triggerRef,
    contentRef,
    setTriggerRef,
    setContentRef,
    scheduleClose,
    cancelClose,
    scheduleOpen,
    cancelOpen,
  }

  return <MenuSubContext value={value}>{children}</MenuSubContext>
}

// ─── MenuSubTrigger ───────────────────────────────────────────────────────────

function MenuSubChevron({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 4 7"
      width="4"
      height="7"
      className={className}
      shapeRendering="crispEdges"
    >
      <path d="M0 0h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1H0V6h1V5h1V4h1V3H2V2H1V1H0z" fill="currentColor" />
    </svg>
  )
}

export interface MenuSubTriggerProps extends Omit<React.ComponentProps<'li'>, 'onChange'> {
  disabled?: boolean
  /**
   * When true, reserve the leading indicator gutter even though this trigger
   * has no icon, so its label stays aligned with checkable or icon-bearing
   * siblings. Compose icons as children.
   */
  reserveIconSpace?: boolean
}

export function MenuSubTrigger({
  className,
  disabled = false,
  reserveIconSpace = false,
  tabIndex,
  children,
  onClick,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  ref,
  ...props
}: MenuSubTriggerProps): React.ReactElement {
  const sub = useMenuSubContext('MenuSubTrigger')
  const { setTriggerRef: setContextTriggerRef } = sub

  const setTriggerRef = (node: HTMLLIElement | null): void => {
    setContextTriggerRef(node)
    if (typeof ref === 'function')
      ref(node)
    else if (ref)
      ref.current = node
  }

  const handleSubTriggerClick = (event: React.MouseEvent<HTMLLIElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented || disabled)
      return
    sub.cancelOpen()
    sub.cancelClose()
    // Windows 98 behavior: clicking a submenu trigger always opens (or keeps
    // open) the submenu. It never toggles it closed — only hovering away,
    // Escape, or ArrowLeft can close a submenu.
    sub.setOpen(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled)
      return

    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      // Stop the event from reaching the parent <Menu> typeahead handler.
      event.stopPropagation()
      sub.cancelClose()
      sub.cancelOpen()
      sub.setOpen(true)
    }
    else if (event.key === 'ArrowLeft' && sub.open) {
      event.preventDefault()
      event.stopPropagation()
      sub.cancelOpen()
      sub.setOpen(false)
    }
  }

  const handlePointerEnter = (event: React.PointerEvent<HTMLLIElement>): void => {
    onPointerEnter?.(event)
    if (disabled || event.pointerType === 'touch')
      return
    sub.scheduleOpen()
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLLIElement>): void => {
    onPointerLeave?.(event)
    if (disabled || event.pointerType === 'touch')
      return
    sub.cancelOpen()
    if (sub.open)
      sub.scheduleClose()
  }

  const chevronClass = sub.open
    ? 'text-(--hilight-text)'
    : 'text-(--menu-text) group-hover:text-(--hilight-text)'

  return (
    <li
      ref={setTriggerRef}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={sub.open}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-state={sub.open ? 'open' : 'closed'}
      className={cn(
        'group',
        menuItemVariants({ disabled, selected: sub.open }),
        className,
      )}
      onClick={handleSubTriggerClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      {...props}
    >
      {reserveIconSpace && <span aria-hidden="true" className={MENU_INDICATOR_SLOT} />}
      {children}
      <MenuSubChevron className={cn('ml-auto shrink-0', chevronClass)} />
    </li>
  )
}

// ─── MenuSubContent ───────────────────────────────────────────────────────────

export interface MenuSubContentProps extends Omit<MenuProps, 'ref'> {
  /** Pixel offset along the side axis. Defaults to -2 for a slight overlap (Win98 feel). */
  sideOffset?: number
  /** Estimated submenu width for first-paint flip calculations. Defaults to 180. */
  estimatedWidth?: number
  /** Estimated submenu height for first-paint flip calculations. Defaults to 200. */
  estimatedHeight?: number
  /** Optional collision boundary for submenu positioning. Defaults to the viewport. */
  boundaryRef?: React.RefObject<Element | null>
}

export function MenuSubContent({
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  sideOffset = -2,
  estimatedWidth = 180,
  estimatedHeight = 200,
  boundaryRef,
  maxHeight: maxHeightProp,
  children,
  ...props
}: MenuSubContentProps): React.ReactElement | null {
  const sub = useMenuSubContext('MenuSubContent')
  const { setContentRef: setContextContentRef } = sub

  const menuRef = React.useRef<HTMLMenuElement | null>(null)
  const setMenuRef = (node: HTMLMenuElement | null): void => {
    menuRef.current = node
    setContextContentRef(node)
  }

  const [position, ready] = useLayer({
    anchorRef: sub.triggerRef,
    layerRef: menuRef,
    open: sub.open,
    side: 'right',
    align: 'start',
    gap: sideOffset,
    estimatedWidth,
    estimatedHeight,
    boundaryRef,
  })

  // Dismiss on Escape or outside pointerdown. Trigger + content are "inside".
  const layerRefs = [menuRef, sub.triggerRef]
  useDismissable({
    enabled: sub.open,
    onDismiss: () => sub.setOpen(false),
    outsidePointer: true,
    layerRefs,
  })

  // Focus first enabled item when the submenu opens.
  React.useLayoutEffect(() => {
    if (!sub.open)
      return
    const menu = menuRef.current
    if (!menu)
      return
    const first = menu.querySelector<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"]),[role="menuitemcheckbox"]:not([aria-disabled="true"]),[role="menuitemradio"]:not([aria-disabled="true"])',
    )
    first?.focus()
  }, [sub.open])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLMenuElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      sub.setOpen(false)
      sub.triggerRef.current?.focus()
    }
  }

  const handlePointerEnter = (event: React.PointerEvent<HTMLMenuElement>): void => {
    onPointerEnter?.(event)
    sub.cancelClose()
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLMenuElement>): void => {
    onPointerLeave?.(event)
    if (event.pointerType === 'touch')
      return
    sub.scheduleClose()
  }

  if (!sub.open)
    return null

  // Until `useLayer` computes a position (runs in rAF), render offscreen so
  // the layer is still focusable but not visible at the wrong spot.
  const resolvedMaxHeight = ready && position
    ? Math.min(maxHeightProp ?? position.availableHeight, position.availableHeight)
    : maxHeightProp
  const layerStyle: React.CSSProperties = {
    position: 'fixed',
    left: ready && position ? position.x : -9999,
    top: ready && position ? position.y : -9999,
    zIndex: 'var(--react98-layer-popup-z-index)',
    ...style,
  }

  return (
    <LayerPortal>
      <Menu
        ref={setMenuRef}
        className={cn('pointer-events-auto min-w-[var(--menu-sub-min-width,160px)]', className)}
        style={layerStyle}
        maxHeight={resolvedMaxHeight}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {children}
      </Menu>
    </LayerPortal>
  )
}
