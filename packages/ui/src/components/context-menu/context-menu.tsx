/* eslint-disable react-refresh/only-export-components */

import type {
  ComponentProps,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react'
import {
  Children,
  cloneElement,
  isValidElement,
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
import { useDismissable } from '../../primitives'
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

interface TriggerChildProps {
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void
}

export interface ContextMenuTriggerProps {
  /** Single element child that will receive the contextmenu handler. */
  children: ReactElement<TriggerChildProps>
  /** When true, right-clicking the child does not open the menu. */
  disabled?: boolean
  /**
   * When true, the trigger only opens if the right-click target is the child
   * element itself (i.e. not a descendant). Useful for outer "blank area"
   * triggers that should defer to inner triggers on children.
   */
  onlyDirectTarget?: boolean
}

/**
 * Attaches an `onContextMenu` handler to its single child that opens the
 * surrounding `<ContextMenu>` at the pointer position.
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

  const child = Children.only(children)
  if (!isValidElement<TriggerChildProps>(child)) {
    return child
  }

  const existing = child.props.onContextMenu

  return cloneElement<TriggerChildProps>(child, {
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      existing?.(event)
      if (event.defaultPrevented || disabled)
        return
      if (onlyDirectTarget && event.target !== event.currentTarget)
        return
      event.preventDefault()
      event.stopPropagation()
      ctx.openAt(event.clientX, event.clientY)
    },
  })
}

// ─── ContextMenuContent ───────────────────────────────────────────────────────

export interface ContextMenuContentProps extends ComponentProps<'div'> {
  /**
   * When true, clicking an enabled `[role="menuitem"]` inside the content
   * automatically closes the menu. Defaults to true.
   */
  closeOnItemClick?: boolean
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
  const [pos, setPos] = useState<{ left: number, top: number }>({ left: x, top: y })

  // Clamp the popup so it stays entirely inside the container (or viewport).
  useLayoutEffect(() => {
    if (!open)
      return
    const el = ref.current
    if (!el)
      return

    const menuRect = el.getBoundingClientRect()

    let minX: number, minY: number, maxX: number, maxY: number
    if (container) {
      const cr = container.getBoundingClientRect()
      minX = cr.left
      minY = cr.top
      maxX = cr.right - menuRect.width
      maxY = cr.bottom - menuRect.height
    }
    else {
      minX = 0
      minY = 0
      maxX = window.innerWidth - menuRect.width
      maxY = window.innerHeight - menuRect.height
    }

    const left = Math.max(minX, Math.min(x, maxX))
    const top = Math.max(minY, Math.min(y, maxY))
    setPos({ left, top })
  }, [open, x, y, container])

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
      style={{ left: pos.left, top: pos.top, ...style }}
      onClick={handleClick}
      onContextMenu={event => event.preventDefault()}
      {...props}
    >
      {children}
    </div>,
    document.body,
  )
}
