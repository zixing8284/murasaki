import type * as React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import { useDismissable, useLayer } from '../../primitives'

export interface TooltipProps {
  /** Tooltip content text */
  text: string
  /** Delay in ms before showing the tooltip (default: 400) */
  delay?: number
  /** Preferred positioning side relative to the trigger (flips if it overflows the viewport) */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Optional className for the tooltip popup */
  className?: string
  /** Trigger element(s) */
  children: React.ReactNode
}

export function Tooltip({
  text,
  delay = 400,
  side = 'top',
  className,
  children,
}: TooltipProps): React.ReactElement {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const show = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(setVisible, delay, true)
  }, [delay, clearTimer])

  const hide = useCallback(() => {
    clearTimer()
    setVisible(false)
  }, [clearTimer])

  const position = useLayer({
    anchorRef: wrapperRef,
    layerRef: tooltipRef,
    open: visible,
    side,
  })

  useDismissable({
    enabled: visible,
    onDismiss: hide,
  })

  // Clean up timer on unmount
  useEffect(() => clearTimer, [clearTimer])

  const tooltipStyle: React.CSSProperties = position
    ? { top: position.y, left: position.x }
    : { top: 0, left: 0, visibility: 'hidden' }

  return (
    <span
      ref={wrapperRef}
      className="inline-flex"
      aria-describedby={visible && position ? tooltipId : undefined}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && createPortal(
        <span
          ref={tooltipRef}
          id={tooltipId}
          role={position ? 'tooltip' : undefined}
          aria-hidden={position ? undefined : true}
          className={cn(
            'fixed z-9999 whitespace-nowrap px-1 py-0.5',
            'bg-(--info-window) text-(--info-text) border border-(--window-frame)',
            'pointer-events-none',
            className,
          )}
          style={tooltipStyle}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}
