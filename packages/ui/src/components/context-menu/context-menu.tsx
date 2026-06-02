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
  useEffect,
  useRef,
  useState,
} from 'react'
import { cnPure } from '../../lib/utils'
import { LayerPortal } from '../../primitives/layer-root/layer-portal'
import { useDismissable } from '../../primitives/use-dismissable'
import { useFocusScope } from '../../primitives/use-focus-scope'
import { useLayer } from '../../primitives/use-layer'
import {
  ContextMenuContext,
} from './context-menu-context'

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
  const [size, setSize] = useState<{ availableHeight: number | null, availableWidth: number | null }>({
    availableHeight: null,
    availableWidth: null,
  })

  const openAt = (x: number, y: number): void => {
    setState({ open: true, x, y })
  }

  const close = (): void => {
    setState(prev => (prev.open ? { ...prev, open: false } : prev))
  }

  const setAvailableSize = (availableHeight: number | null, availableWidth: number | null): void => {
    setSize(prev =>
      prev.availableHeight === availableHeight && prev.availableWidth === availableWidth
        ? prev
        : { availableHeight, availableWidth },
    )
  }

  const value = {
    open: state.open,
    x: state.x,
    y: state.y,
    container,
    availableHeight: size.availableHeight,
    availableWidth: size.availableWidth,
    openAt,
    close,
    setAvailableSize,
  }

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

/**
 * Portal-rendered content container for a `<ContextMenu>`.
 *
 * Positions itself at the pointer coordinates recorded when the menu opened
 * via the shared `useLayer` primitive, which clamps the popup to stay inside
 * the container element (or viewport when no container is set) and reports
 * `availableHeight` so callers can engage scrolling for tall content.
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
  const { open, x, y, container, close, setAvailableSize } = ctx

  const ref = useRef<HTMLDivElement>(null)
  const boundaryContainerRef = useRef<HTMLElement | null>(null)
  if (boundaryContainerRef.current !== (container ?? null)) {
    boundaryContainerRef.current = container ?? null
  }
  const containerRef = boundaryContainerRef

  // Virtual 1×1 anchor at the recorded pointer position. Pure (no React
  // state); re-evaluated on every recompute so `useLayer` always sees
  // fresh coordinates.
  const anchorRect = (): DOMRect => {
    return new DOMRect(x, y, 0, 0)
  }

  const [position, ready] = useLayer({
    anchorRect,
    layerRef: ref,
    open,
    side: 'bottom',
    align: 'start',
    gap: 0,
    boundaryRef: containerRef,
  })

  // Publish the resolved usable size up to the context so consumers can wire
  // a child `<Menu maxHeight={…}>` from `useContextMenu().availableHeight`.
  useEffect(() => {
    if (!open) {
      setAvailableSize(null, null)
      return
    }
    if (position) {
      setAvailableSize(position.availableHeight, position.availableWidth)
    }
  }, [open, position, setAvailableSize])

  // Outside pointerdown (covers right-click since pointerdown fires before
  // contextmenu) and Escape close the popup via the shared primitive.
  const layerRefs = [ref]
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

  const handleMenuClick = (event: MouseEvent<HTMLDivElement>): void => {
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

  // Until `useLayer` resolves a position (runs in rAF), render hidden at the
  // pointer coords so the element is in the DOM for measurement but invisible.
  // This prevents the menu from flashing at the raw pointer position before
  // the first computed position (with correct side-flip) is ready.
  const left = ready && position ? position.x : x
  const top = ready && position ? position.y : y

  return (
    <LayerPortal>
      <div
        ref={ref}
        className={cnPure('fixed pointer-events-auto [z-index:var(--react98-layer-popup-z-index)]', className)}
        data-open=""
        data-context-menu-available-height={position?.availableHeight ?? ''}
        style={{ left, top, opacity: ready ? undefined : 0, ...style }}
        onClick={handleMenuClick}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            close()
          }
        }}
        onContextMenu={event => event.preventDefault()}
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    </LayerPortal>
  )
}
