import type { LayerSide } from '../../primitives/use-layer'
import * as React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { LayerPortal } from '../../primitives/layer-root/layer-portal'
import { useDismissable } from '../../primitives/use-dismissable'
import { useLayer } from '../../primitives/use-layer'
import { TooltipContext, useTooltipContext } from './tooltip-context'

// ============================================================================
// Tooltip (root)
// ============================================================================

export interface TooltipProps {
  /** Delay in ms before the tooltip appears on hover/focus. */
  delay?: number
  /** Visible state (controlled). */
  open?: boolean
  /** Initial visible state (uncontrolled). */
  defaultOpen?: boolean
  /** Called with the next visible state when the tooltip shows or hides. */
  onOpenChange?: (open: boolean) => void
  /** Compound children: `TooltipTrigger` and `TooltipContent`. */
  children?: React.ReactNode
}

/**
 * A Windows 98 info popup for hover and focus targets, composed from
 * `TooltipTrigger` and `TooltipContent`.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>
 *     <Button>Save</Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Save changes</TooltipContent>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  delay = 400,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: TooltipProps): React.ReactElement {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const triggerRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  const clearTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const setOpen = useCallback((next: boolean): void => {
    if (!isControlled)
      setInternalOpen(next)
    onOpenChange?.(next)
  }, [isControlled, onOpenChange])

  const show = (): void => {
    clearTimer()
    timerRef.current = setTimeout(setOpen, delay, true)
  }

  const hide = (): void => {
    clearTimer()
    setOpen(false)
  }

  useEffect(() => clearTimer, [clearTimer])

  const context = { open, show, hide, triggerRef, contentRef, tooltipId }

  return <TooltipContext value={context}>{children}</TooltipContext>
}

// ============================================================================
// TooltipTrigger
// ============================================================================

export type TooltipTriggerProps = React.ComponentProps<'span'>

/**
 * Wraps the hover/focus target and anchors the tooltip. Renders an
 * `inline-flex` span around its children.
 */
export function TooltipTrigger({
  children,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TooltipTriggerProps): React.ReactElement {
  const { open, show, hide, triggerRef, tooltipId } = useTooltipContext()

  return (
    <span
      ref={triggerRef}
      className={cn('inline-flex', className)}
      aria-describedby={open ? tooltipId : undefined}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        show()
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        hide()
      }}
      onFocus={(event) => {
        onFocus?.(event)
        show()
      }}
      onBlur={(event) => {
        onBlur?.(event)
        hide()
      }}
      {...props}
    >
      {children}
    </span>
  )
}

// ============================================================================
// TooltipContent
// ============================================================================

export interface TooltipContentProps extends React.ComponentProps<'span'> {
  /** Preferred side relative to the trigger; flips if it overflows the viewport. */
  side?: LayerSide
}

/**
 * The portalled popup shown while the tooltip is open. Positions itself
 * against the trigger and flips away from viewport edges.
 */
export function TooltipContent({
  children,
  className,
  side = 'top',
  ...props
}: TooltipContentProps): React.ReactElement | null {
  const { open, hide, triggerRef, contentRef, tooltipId } = useTooltipContext()

  const [position, ready] = useLayer({
    anchorRef: triggerRef,
    layerRef: contentRef,
    open,
    side,
  })

  useDismissable({
    enabled: open,
    onDismiss: hide,
  })

  if (!open)
    return null

  const style: React.CSSProperties = ready && position
    ? { top: position.y, left: position.x }
    : { top: 0, left: 0, visibility: 'hidden' }

  return (
    <LayerPortal>
      <span
        ref={contentRef}
        id={tooltipId}
        role={ready ? 'tooltip' : undefined}
        aria-hidden={ready ? undefined : true}
        className={cn(
          'fixed [z-index:var(--react98-layer-tooltip-z-index)] whitespace-nowrap px-1 py-0.5',
          'bg-(--info-window) text-(--info-text) border border-(--window-frame)',
          'pointer-events-none',
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </span>
    </LayerPortal>
  )
}
