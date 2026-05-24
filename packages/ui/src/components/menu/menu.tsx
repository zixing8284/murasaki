import type { MenuSubContextValue } from './menu-sub-context'

import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../../lib/utils'
import { LayerPortal, useDismissable, useLayer, useRovingFocus, useTypeahead } from '../../primitives'
import { MenuScrollArrow, useMenuOverflow } from './menu-scroll'
import { MenuSubContext, useMenuSubContext } from './menu-sub-context'

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

  const triggerRef = React.useRef<HTMLLIElement | null>(null)
  const contentRef = React.useRef<HTMLElement | null>(null)
  const openTimerRef = React.useRef<number | null>(null)
  const closeTimerRef = React.useRef<number | null>(null)

  const setOpen = React.useCallback((next: boolean) => {
    if (!isControlled)
      setUncontrolledOpen(next)
    onOpenChange?.(next)
  }, [isControlled, onOpenChange])

  const cancelOpen = React.useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const cancelClose = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleOpen = React.useCallback(() => {
    cancelClose()
    if (open || openTimerRef.current !== null)
      return
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null
      setOpen(true)
    }, hoverOpenDelay)
  }, [open, hoverOpenDelay, setOpen, cancelClose])

  const scheduleClose = React.useCallback(() => {
    cancelOpen()
    if (!open || closeTimerRef.current !== null)
      return
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, hoverCloseDelay)
  }, [open, hoverCloseDelay, setOpen, cancelOpen])

  React.useEffect(() => {
    return () => {
      if (openTimerRef.current !== null)
        window.clearTimeout(openTimerRef.current)
      if (closeTimerRef.current !== null)
        window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  const value = React.useMemo<MenuSubContextValue>(() => ({
    open,
    setOpen,
    triggerRef,
    contentRef,
    scheduleClose,
    cancelClose,
    scheduleOpen,
    cancelOpen,
  }), [open, setOpen, scheduleClose, cancelClose, scheduleOpen, cancelOpen])

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
  icon?: React.ReactNode
  disabled?: boolean
  /**
   * When true, always reserve space for the icon column even when `icon` is
   * `null` / `undefined`. Useful so submenu trigger labels stay aligned with
   * sibling `<MenuItem>` rows that have icons.
   */
  reserveIconSpace?: boolean
}

export function MenuSubTrigger({
  className,
  icon,
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

  const setTriggerRef = React.useCallback((node: HTMLLIElement | null) => {
    sub.triggerRef.current = node
    if (typeof ref === 'function')
      ref(node)
    else if (ref)
      ref.current = node
  }, [ref, sub.triggerRef])

  const showIconSlot = icon != null || reserveIconSpace

  const handleClick = (event: React.MouseEvent<HTMLLIElement>): void => {
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
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      {...props}
    >
      {showIconSlot && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
      <MenuSubChevron className={cn('shrink-0', chevronClass)} />
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

  const menuRef = React.useRef<HTMLMenuElement | null>(null)
  const setMenuRef = React.useCallback((node: HTMLMenuElement | null) => {
    menuRef.current = node
    sub.contentRef.current = node
  }, [sub.contentRef])

  const position = useLayer({
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
  const layerRefs = React.useMemo(
    () => [menuRef, sub.triggerRef],
    [sub.triggerRef],
  )
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
      '[role="menuitem"]:not([aria-disabled="true"])',
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
  const positioned = position !== null
  const resolvedMaxHeight = position
    ? Math.min(maxHeightProp ?? position.availableHeight, position.availableHeight)
    : maxHeightProp
  const layerStyle: React.CSSProperties = {
    position: 'fixed',
    left: positioned ? position.x : -9999,
    top: positioned ? position.y : -9999,
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
