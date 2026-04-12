import type * as React from 'react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export interface TooltipProps {
  /** Tooltip content text */
  text: string
  /** Delay in ms before showing the tooltip (default: 400) */
  delay?: number
  /** Preferred positioning side relative to the trigger (flips if it overflows the viewport) */
  side?: 'top' | 'bottom'
  /** Optional className for the tooltip popup */
  className?: string
  /** Trigger element(s) */
  children: React.ReactNode
}

/** Approximate tooltip height for viewport flip calculation */
const TOOLTIP_HEIGHT_ESTIMATE = 20
const GAP = 4

export function Tooltip({
  text,
  delay = 400,
  side = 'top',
  className,
  children,
}: TooltipProps): React.ReactElement {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [resolvedSide, setResolvedSide] = useState(side)
  const wrapperRef = useRef<HTMLSpanElement>(null)
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
    timerRef.current = setTimeout(() => {
      const el = wrapperRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      let actualSide = side

      // Viewport boundary flip
      if (side === 'top' && rect.top - GAP - TOOLTIP_HEIGHT_ESTIMATE < 0) {
        actualSide = 'bottom'
      } else if (side === 'bottom' && rect.bottom + GAP + TOOLTIP_HEIGHT_ESTIMATE > window.innerHeight) {
        actualSide = 'top'
      }

      setResolvedSide(actualSide)
      setCoords({
        top: actualSide === 'top' ? rect.top - GAP : rect.bottom + GAP,
        left: rect.left + rect.width / 2,
      })
      setVisible(true)
    }, delay)
  }, [delay, clearTimer, side])

  const hide = useCallback(() => {
    clearTimer()
    setVisible(false)
  }, [clearTimer])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hide()
    }
  }, [hide])

  // Clean up timer on unmount
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return (
    <span
      ref={wrapperRef}
      className="inline-flex"
      aria-describedby={visible ? tooltipId : undefined}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={handleKeyDown}
    >
      {children}
      {visible && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'fixed z-9999 whitespace-nowrap px-1 py-0.5',
            'bg-(--info-window) text-(--info-text) border border-(--window-frame)',
            'pointer-events-none -translate-x-1/2',
            resolvedSide === 'top' && '-translate-y-full',
            className,
          )}
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}
