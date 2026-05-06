/* eslint-disable react-refresh/only-export-components */

import type {
  ComponentProps,
  CSSProperties,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react'
import {
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cnPure } from '../../lib/utils'
import { useDismissable, useFocusScope } from '../../primitives'
import {
  ContextMenuContext,
} from './context-menu-context'

// Re-export primitives so consumers only import from this module.
export { useContextMenu } from './context-menu-context'
export type { ContextMenuContextValue } from './context-menu-context'

// ─── ContextMenu ──────────────────────────────────────────────────────────────

export interface ContextMenuProps {
  children: ReactNode
  /**
   * Constrains the popup to stay within this element's bounding box.
   * When `null` or omitted the viewport is used as the boundary.
   */
  container?: HTMLElement | null
}

/**
 * Root provider for a contextual popup menu triggered by a right-click
 * (or programmatic call) on a descendant `<ContextMenuTrigger>`.
 *
 * Renders its children as-is; state is exposed via context for
 * `<ContextMenuTrigger>`, `<ContextMenuContent>`, and `useContextMenu()`.
 */
export function ContextMenu({
  children,
  container = null,
}: ContextMenuProps): ReactElement {
  const [state, setState] = useState<{ open: boolean, x: number, y: number }>({
    open: false,
    x: 0,
    y: 0,
  })

  const openAt = useCallback((x: number, y: number) => {
    setState({ open: true, x, y })
  }, [])

  const close = useCallback(() => {
    setState(prev => (prev.open ? { ...prev, open: false } : prev))
  }, [])

  const value = useMemo(
    () => ({ open: state.open, x: state.x, y: state.y, container, openAt, close }),
    [state.open, state.x, state.y, container, openAt, close],
  )

  return <ContextMenuContext value={value}>{children}</ContextMenuContext>
}

// ─── ContextMenuTrigger ───────────────────────────────────────────────────────

export interface ContextMenuTriggerProps {
  /** Trigger content. Child `onContextMenu` handlers run before this trigger. */
  children: ReactNode
  /** When true, right-clicking the child does not open the menu. */
  disabled?: boolean
  /**
   * When true, the trigger only opens if the right-click target is the first
   * child element itself (i.e. not a descendant). Useful for outer "blank area"
   * triggers that should defer to inner triggers on children.
   */
  onlyDirectTarget?: boolean
}

const CONTENTS_STYLE: CSSProperties = { display: 'contents' }

function shouldOpenFromContextMenu(
  event: MouseEvent<HTMLElement>,
  onlyDirectTarget: boolean | undefined,
): boolean {
  if (event.defaultPrevented)
    return false

  if (!onlyDirectTarget)
    return true

  return event.target === event.currentTarget.firstElementChild
}

/**
 * Opens the surrounding `<ContextMenu>` at the pointer position.
 */
export function ContextMenuTrigger({
  children,
  disabled,
  onlyDirectTarget,
}: ContextMenuTriggerProps): ReactElement {
  const ctx = use(ContextMenuContext)
  if (!ctx) {
    throw new Error('ContextMenuTrigger must be used within a <ContextMenu>')
  }

  const handleContextMenu = (event: MouseEvent<HTMLElement>): void => {
    if (disabled)
      return
    if (!shouldOpenFromContextMenu(event, onlyDirectTarget))
      return
    event.preventDefault()
    event.stopPropagation()
    ctx.openAt(event.clientX, event.clientY)
  }

  return (
    <span
      data-slot="context-menu-trigger"
      onContextMenu={handleContextMenu}
      style={CONTENTS_STYLE}
    >
      {children}
    </span>
  )
}

// ─── ContextMenuContent ───────────────────────────────────────────────────────

export interface ContextMenuContentProps extends ComponentProps<'div'> {
  /**
   * When true, clicking an enabled `[role="menuitem"]` inside the content
   * automatically closes the menu. Defaults to true.
   */
  closeOnItemClick?: boolean
}

function getClampedPosition({
  container,
  element,
  x,
  y,
}: {
  container: HTMLElement | null
  element: HTMLElement
  x: number
  y: number
}): { left: number, top: number } {
  const menuRect = element.getBoundingClientRect()

  let minX: number, minY: number, maxX: number, maxY: number
  if (container) {
    const containerRect = container.getBoundingClientRect()
    minX = containerRect.left
    minY = containerRect.top
    maxX = containerRect.right - menuRect.width
    maxY = containerRect.bottom - menuRect.height
  }
  else {
    minX = 0
    minY = 0
    maxX = window.innerWidth - menuRect.width
    maxY = window.innerHeight - menuRect.height
  }

  return {
    left: Math.max(minX, Math.min(x, maxX)),
    top: Math.max(minY, Math.min(y, maxY)),
  }
}

function applyClampedPosition({
  container,
  element,
  style,
  x,
  y,
}: {
  container: HTMLElement | null
  element: HTMLElement
  style: CSSProperties | undefined
  x: number
  y: number
}): void {
  const { left, top } = getClampedPosition({ container, element, x, y })
  if (style?.left === undefined)
    element.style.left = `${String(left)}px`
  if (style?.top === undefined)
    element.style.top = `${String(top)}px`
}

/**
 * Portal-rendered content container for a `<ContextMenu>`.
 *
 * Positions itself at the pointer coordinates recorded when the menu opened,
 * clamped to the container element (or viewport when no container is set).
 * Closes on Escape, outside mousedown, scroll, and resize.
 */
export function ContextMenuContent({
  className,
  style,
  onClick,
  closeOnItemClick = true,
  children,
  ...props
}: ContextMenuContentProps): ReactElement | null {
  const ctx = use(ContextMenuContext)
  if (!ctx) {
    throw new Error('ContextMenuContent must be used within a <ContextMenu>')
  }
  const { open, x, y, container, close } = ctx

  const ref = useRef<HTMLDivElement>(null)

  // Clamp the popup so it stays entirely inside the container (or viewport).
  useLayoutEffect(() => {
    if (!open)
      return
    const el = ref.current
    if (!el)
      return

    applyClampedPosition({ container, element: el, style, x, y })
  }, [open, x, y, container, style])

  useEffect(() => {
    if (!open)
      return

    const onScroll = (): void => close()

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, close])

  // Outside pointerdown (covers right-click since pointerdown fires before
  // contextmenu) and Escape close the popup via the shared primitive.
  const layerRefs = useMemo(() => [ref], [])
  useDismissable({
    enabled: open,
    onDismiss: close,
    outsidePointer: true,
    layerRefs,
  })

  useFocusScope({
    enabled: open,
    containerRef: ref,
  })

  if (!open)
    return null

  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    onClick?.(event)
    if (!closeOnItemClick || event.defaultPrevented)
      return
    const target = event.target instanceof Element
      ? event.target.closest('[role="menuitem"]')
      : null
    if (target && target.getAttribute('aria-disabled') !== 'true') {
      close()
    }
  }

  return createPortal(
    <div
      ref={ref}
      className={cnPure('fixed z-9999', className)}
      data-open=""
      style={{ left: x, top: y, ...style }}
      onClick={handleClick}
      onContextMenu={event => event.preventDefault()}
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}
