import * as React from 'react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export interface TooltipProps {
  /** Tooltip content text */
  text: string
  /** Delay in ms before showing the tooltip (default: 400) */
  delay?: number
  /** Positioning side relative to the trigger */
  side?: 'top' | 'bottom'
  /** Optional className for the tooltip popup */
  className?: string
  /** Trigger element */
  children: React.ReactElement
}

export function Tooltip({
  text,
  delay = 400,
  side = 'top',
  className,
  children,
}: TooltipProps): React.ReactElement {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
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
      if (el) {
        const rect = el.getBoundingClientRect()
        const gap = 4
        setCoords({
          top: side === 'top' ? rect.top - gap : rect.bottom + gap,
          left: rect.left + rect.width / 2,
        })
      }
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

  const child = React.Children.only(children)
  const childProps = child.props as Record<string, unknown>

  const trigger = React.cloneElement(child, {
    'aria-label': text,
    'aria-describedby': visible ? tooltipId : undefined,
    onPointerEnter: (e: React.PointerEvent) => {
      ;(childProps['onPointerEnter'] as ((e: React.PointerEvent) => void) | undefined)?.(e)
      show()
    },
    onPointerLeave: (e: React.PointerEvent) => {
      ;(childProps['onPointerLeave'] as ((e: React.PointerEvent) => void) | undefined)?.(e)
      hide()
    },
    onFocus: (e: React.FocusEvent) => {
      ;(childProps['onFocus'] as ((e: React.FocusEvent) => void) | undefined)?.(e)
      show()
    },
    onBlur: (e: React.FocusEvent) => {
      ;(childProps['onBlur'] as ((e: React.FocusEvent) => void) | undefined)?.(e)
      hide()
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      ;(childProps['onKeyDown'] as ((e: React.KeyboardEvent) => void) | undefined)?.(e)
      handleKeyDown(e)
    },
  } as Record<string, unknown>)

  return (
    <span ref={wrapperRef} className="inline-flex">
      {trigger}
      {visible && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'fixed z-9999 whitespace-nowrap px-1 py-0.5',
            'bg-(--info-window) text-(--info-text) border border-(--window-frame)',
            'pointer-events-none -translate-x-1/2',
            side === 'top' && '-translate-y-full',
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
