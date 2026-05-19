import type { MenuProps } from '../menu/menu'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../../lib/utils'
import { useDismissable, useLayer } from '../../primitives'
import { LayerPortal } from '../layer/layer-portal'
import { Menu } from '../menu/menu'

// ─── WindowMenuBar ────────────────────────────────────────────────────────────

const menuBarVariants = cva([
  'h-4',
  'flex',
  'items-center',
  'gap-0',
  'px-px',
  'bg-(--menu-bar)',
  'text-(--menu-text)',
  'select-none',
])

type WindowMenuBarValue = string | null
type WindowMenuBarDirection = 'next' | 'previous'

const WINDOW_MENU_BAR_TRIGGER_SELECTOR = '[data-window-menu-bar-trigger]'

function getEnabledWindowMenuBarTriggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(WINDOW_MENU_BAR_TRIGGER_SELECTOR))
    .filter(trigger => !trigger.disabled && trigger.getAttribute('aria-disabled') !== 'true')
}

function getWindowMenuBarTriggerValue(trigger: HTMLButtonElement): string | undefined {
  return trigger.getAttribute('data-window-menu-bar-value') ?? undefined
}

function getAnimationSnapshot(node: HTMLElement | null): { animationName: string, display: string } {
  if (!node)
    return { animationName: 'none', display: 'none' }

  const style = getComputedStyle(node)
  return {
    animationName: style.animationName || 'none',
    display: style.display,
  }
}

function hasAnimationName(animationNameList: string, animationName: string): boolean {
  return animationNameList
    .split(',')
    .map(name => name.trim())
    .includes(animationName)
}

interface WindowMenuBarContextValue {
  value: WindowMenuBarValue
  setValue: (value: WindowMenuBarValue) => void
  focusMenu: (currentValue: string, direction: WindowMenuBarDirection, openNext: boolean) => void
}

const WindowMenuBarContext = React.createContext<WindowMenuBarContextValue | null>(null)

function useWindowMenuBarContext(component: string): WindowMenuBarContextValue {
  const context = React.use(WindowMenuBarContext)
  if (!context)
    throw new Error(`${component} must be used within a <WindowMenuBar>`)
  return context
}

export interface WindowMenuBarProps extends Omit<React.ComponentProps<'div'>, 'defaultValue'> {
  /** Controlled value for the currently open top-level menu. */
  value?: WindowMenuBarValue
  /** Initial open menu for uncontrolled usage. */
  defaultValue?: WindowMenuBarValue
  /** Called when the open top-level menu changes. */
  onValueChange?: (value: WindowMenuBarValue) => void
}

/**
 * Horizontal menu bar placed at the top of a window (e.g. File / Edit / View).
 *
 * Owns only top-level menu coordination. Window active/inactive click policy
 * belongs to the window shell in the consumer application.
 */
export function WindowMenuBar({
  className,
  children,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onKeyDown,
  ref,
  ...props
}: WindowMenuBarProps): React.ReactElement {
  const menuBarRef = React.useRef<HTMLDivElement | null>(null)
  const [uncontrolledValue, setUncontrolledValue] = React.useState<WindowMenuBarValue>(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue

  const setMenuBarRef = React.useCallback((node: HTMLDivElement | null) => {
    menuBarRef.current = node
    if (typeof ref === 'function')
      ref(node)
    else if (ref)
      ref.current = node
  }, [ref])

  const setValue = React.useCallback((nextValue: WindowMenuBarValue) => {
    if (!isControlled)
      setUncontrolledValue(nextValue)
    onValueChange?.(nextValue)
  }, [isControlled, onValueChange])

  const focusMenu = React.useCallback((currentValue: string, direction: WindowMenuBarDirection, openNext: boolean) => {
    const menuBar = menuBarRef.current
    if (!menuBar)
      return

    const triggers = getEnabledWindowMenuBarTriggers(menuBar)
    if (triggers.length === 0)
      return

    const currentIndex = triggers.findIndex(trigger => getWindowMenuBarTriggerValue(trigger) === currentValue)
    if (currentIndex < 0)
      return

    const offset = direction === 'next' ? 1 : -1
    const nextIndex = (currentIndex + offset + triggers.length) % triggers.length
    const nextTrigger = triggers[nextIndex]
    const nextValue = nextTrigger ? getWindowMenuBarTriggerValue(nextTrigger) : undefined

    if (!nextTrigger)
      return

    nextTrigger.focus()
    if (openNext && nextValue)
      setValue(nextValue)
  }, [setValue])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return

    const target = event.target instanceof Element ? event.target : null
    const currentTrigger = target?.closest<HTMLButtonElement>(WINDOW_MENU_BAR_TRIGGER_SELECTOR)
    if (!currentTrigger || !event.currentTarget.contains(currentTrigger))
      return

    const currentValue = getWindowMenuBarTriggerValue(currentTrigger)
    if (!currentValue)
      return

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusMenu(currentValue, event.key === 'ArrowRight' ? 'next' : 'previous', value !== null)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setValue(currentValue)
    }
  }

  const contextValue = React.useMemo<WindowMenuBarContextValue>(() => ({
    value,
    setValue,
    focusMenu,
  }), [value, setValue, focusMenu])

  return (
    <WindowMenuBarContext value={contextValue}>
      <div
        ref={setMenuBarRef}
        role="menubar"
        className={cn(menuBarVariants(), className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </WindowMenuBarContext>
  )
}

// ─── WindowMenuBarMenu ───────────────────────────────────────────────────────

interface WindowMenuBarMenuContextValue {
  value: string
  open: boolean
  triggerId: string
  contentId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLElement | null>
}

const WindowMenuBarMenuContext = React.createContext<WindowMenuBarMenuContextValue | null>(null)

function useWindowMenuBarMenuContext(component: string): WindowMenuBarMenuContextValue {
  const context = React.use(WindowMenuBarMenuContext)
  if (!context)
    throw new Error(`${component} must be used within a <WindowMenuBarMenu>`)
  return context
}

export interface WindowMenuBarMenuProps {
  /** Stable value for controlled menubars. Generated when omitted. */
  value?: string
  children: React.ReactNode
}

export function WindowMenuBarMenu({
  value: valueProp,
  children,
}: WindowMenuBarMenuProps): React.ReactElement {
  const menubar = useWindowMenuBarContext('WindowMenuBarMenu')
  const generatedValueId = React.useId()
  const triggerId = React.useId()
  const contentId = React.useId()
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLElement | null>(null)
  const value = valueProp ?? generatedValueId

  const contextValue = React.useMemo<WindowMenuBarMenuContextValue>(() => ({
    value,
    open: menubar.value === value,
    triggerId,
    contentId,
    triggerRef,
    contentRef,
  }), [value, menubar.value, triggerId, contentId])

  return <WindowMenuBarMenuContext value={contextValue}>{children}</WindowMenuBarMenuContext>
}

// ─── WindowMenuBarItem ────────────────────────────────────────────────────────

const menuBarItemVariants = cva(
  [
    'bg-transparent',
    'border-none',
    'px-1.5',
    'py-0.5',
    'text-(--menu-text)',
    'enabled:hover:bg-(--menu-hilight)',
    'enabled:hover:text-(--hilight-text)',
    'enabled:focus-visible:bg-(--menu-hilight)',
    'enabled:focus-visible:text-(--hilight-text)',
    'outline-none',
    'disabled:text-(--gray-text)',
  ],
  {
    variants: {
      selected: {
        true: ['bg-(--menu-hilight)', 'text-(--hilight-text)'],
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export interface WindowMenuBarItemProps extends React.ComponentProps<'button'> {}

/**
 * A single trigger inside a `WindowMenuBar`. Renders as a flat button using
 * menu-bar theme tokens. Consumers can compose their own dropdown / menu
 * behavior via the standard `onClick`.
 */
export function WindowMenuBarItem({
  className,
  type = 'button',
  ref,
  ...props
}: WindowMenuBarItemProps): React.ReactElement {
  return (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      className={cn(menuBarItemVariants(), className)}
      {...props}
    />
  )
}

// ─── WindowMenuBarTrigger ────────────────────────────────────────────────────

export interface WindowMenuBarTriggerProps extends React.ComponentProps<'button'> {}

export function WindowMenuBarTrigger({
  className,
  id,
  type = 'button',
  disabled = false,
  onClick,
  onPointerEnter,
  ref,
  ...props
}: WindowMenuBarTriggerProps): React.ReactElement {
  const menubar = useWindowMenuBarContext('WindowMenuBarTrigger')
  const menu = useWindowMenuBarMenuContext('WindowMenuBarTrigger')

  const setTriggerRef = React.useCallback((node: HTMLButtonElement | null) => {
    menu.triggerRef.current = node
    if (typeof ref === 'function')
      ref(node)
    else if (ref)
      ref.current = node
  }, [ref, menu.triggerRef])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented || disabled)
      return

    menubar.setValue(menu.open ? null : menu.value)
  }

  const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>): void => {
    onPointerEnter?.(event)
    if (event.defaultPrevented || disabled || event.pointerType === 'touch')
      return

    if (menubar.value !== null && !menu.open)
      menubar.setValue(menu.value)
  }

  return (
    <button
      ref={setTriggerRef}
      id={id ?? menu.triggerId}
      type={type}
      role="menuitem"
      aria-controls={menu.open ? menu.contentId : undefined}
      aria-expanded={menu.open}
      aria-haspopup="menu"
      data-state={menu.open ? 'open' : 'closed'}
      data-window-menu-bar-trigger=""
      data-window-menu-bar-value={menu.value}
      disabled={disabled}
      className={cn(menuBarItemVariants({ selected: menu.open }), className)}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      {...props}
    />
  )
}

// ─── WindowMenuBarContent ────────────────────────────────────────────────────

export interface WindowMenuBarContentProps extends Omit<MenuProps, 'ref'> {
  /** Whether clicking an enabled command item closes the top-level menu. */
  closeOnItemClick?: boolean
  /** Pixel offset along the side axis. Defaults to 0 for attached menu bars. */
  sideOffset?: number
  /** Estimated menu width for first-paint flip calculations. Defaults to 160. */
  estimatedWidth?: number
  /** Estimated menu height for first-paint flip calculations. Defaults to 200. */
  estimatedHeight?: number
  /** Optional collision boundary for menu positioning. Defaults to the viewport. */
  boundaryRef?: React.RefObject<Element | null>
}

export function WindowMenuBarContent({
  className,
  style,
  id,
  onClick,
  onKeyDown,
  onAnimationEnd,
  closeOnItemClick = true,
  sideOffset = 0,
  estimatedWidth = 160,
  estimatedHeight = 200,
  boundaryRef,
  maxHeight: maxHeightProp,
  children,
  ...props
}: WindowMenuBarContentProps): React.ReactElement | null {
  const menubar = useWindowMenuBarContext('WindowMenuBarContent')
  const menu = useWindowMenuBarMenuContext('WindowMenuBarContent')
  const menuRef = React.useRef<HTMLMenuElement | null>(null)
  const [localOpen, dispatchLocalOpen] = React.useReducer((_open: boolean, nextOpen: boolean) => nextOpen, menu.open)
  const previousAnimationNameRef = React.useRef('none')
  const shouldRender = menu.open || localOpen

  React.useLayoutEffect(() => {
    if (menu.open) {
      dispatchLocalOpen(true)
      previousAnimationNameRef.current = getAnimationSnapshot(menuRef.current).animationName
      return
    }

    if (!localOpen)
      return

    const { animationName, display } = getAnimationSnapshot(menuRef.current)
    const hasExitAnimation = animationName !== 'none'
      && display !== 'none'
      && animationName !== previousAnimationNameRef.current

    if (!hasExitAnimation)
      dispatchLocalOpen(false)
  }, [menu.open, localOpen])

  const setMenuRef = React.useCallback((node: HTMLMenuElement | null) => {
    menuRef.current = node
    menu.contentRef.current = node
  }, [menu.contentRef])

  // Keep positioning alive while exit animations keep the content mounted.
  const position = useLayer({
    anchorRef: menu.triggerRef,
    layerRef: menuRef,
    open: shouldRender,
    side: 'bottom',
    align: 'start',
    gap: sideOffset,
    estimatedWidth,
    estimatedHeight,
    boundaryRef,
  })

  const layerRefs = React.useMemo(() => [menu.triggerRef, menu.contentRef], [menu.triggerRef, menu.contentRef])
  useDismissable({
    enabled: menu.open,
    onDismiss: () => menubar.setValue(null),
    outsidePointer: true,
    layerRefs,
  })

  React.useLayoutEffect(() => {
    if (!menu.open)
      return
    const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
    firstItem?.focus()
  }, [menu.open])

  const handleClick = (event: React.MouseEvent<HTMLMenuElement>): void => {
    onClick?.(event)
    if (!closeOnItemClick || event.defaultPrevented)
      return

    const item = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[role="menuitem"]')
      : null
    if (!item)
      return
    if (item.getAttribute('aria-disabled') === 'true')
      return
    if (item.getAttribute('aria-haspopup') === 'menu')
      return

    menubar.setValue(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLMenuElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented)
      return

    if (event.key === 'Escape') {
      event.preventDefault()
      menubar.setValue(null)
      menu.triggerRef.current?.focus()
      return
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      menubar.focusMenu(menu.value, event.key === 'ArrowRight' ? 'next' : 'previous', true)
    }
  }

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLMenuElement>): void => {
    onAnimationEnd?.(event)
    if (event.defaultPrevented)
      return

    if (!menu.open && event.currentTarget === event.target) {
      const { animationName } = getAnimationSnapshot(event.currentTarget)
      if (!hasAnimationName(animationName, event.animationName))
        return

      dispatchLocalOpen(false)
    }
  }

  if (!shouldRender)
    return null

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
        id={id ?? menu.contentId}
        aria-labelledby={menu.triggerId}
        data-window-menu-bar-content=""
        data-window-menu-bar-value={menu.value}
        data-state={menu.open ? 'open' : 'closed'}
        className={cn(
          'pointer-events-auto min-w-[var(--window-menu-bar-content-min-width,160px)]',
          !menu.open && 'pointer-events-none',
          className,
        )}
        style={layerStyle}
        maxHeight={resolvedMaxHeight}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onAnimationEnd={handleAnimationEnd}
        {...props}
      >
        {children}
      </Menu>
    </LayerPortal>
  )
}
