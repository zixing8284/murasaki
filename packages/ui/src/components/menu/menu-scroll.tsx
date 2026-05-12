/* eslint-disable react-refresh/only-export-components */

import * as React from 'react'
import { cn } from '../../lib/utils'

const REPEAT_INTERVAL_MS = 60
const SCROLL_EDGE_TOLERANCE_PX = 2
const MENU_ROW_SELECTOR = '[role="menuitem"], [role="separator"]'

interface UseMenuOverflowResult {
  canScrollUp: boolean
  canScrollDown: boolean
  scrollByStep: (direction: -1 | 1) => void
}

/**
 * Observes a scrollable menu item list and reports whether either edge has
 * hidden rows. Used by `<Menu maxHeight>` to show Win98 scroll steppers.
 */
export function useMenuOverflow(
  listRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
): UseMenuOverflowResult {
  const [state, setState] = React.useState({
    canScrollUp: false,
    canScrollDown: false,
  })

  React.useLayoutEffect(() => {
    if (!enabled)
      return

    const list = listRef.current
    if (!list)
      return

    const update = (): void => {
      const { scrollTop, scrollHeight, clientHeight } = list
      const canScrollUp = scrollTop > SCROLL_EDGE_TOLERANCE_PX
      const canScrollDown = scrollTop + clientHeight < scrollHeight - SCROLL_EDGE_TOLERANCE_PX

      window.requestAnimationFrame(() => {
        setState(prev => (
          prev.canScrollUp === canScrollUp && prev.canScrollDown === canScrollDown
            ? prev
            : { canScrollUp, canScrollDown }
        ))
      })
    }

    update()
    list.addEventListener('scroll', update, { passive: true })

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(update)
      : null
    resizeObserver?.observe(list)
    Array.from(list.children).forEach(child => resizeObserver?.observe(child))

    return () => {
      list.removeEventListener('scroll', update)
      resizeObserver?.disconnect()
    }
  }, [enabled, listRef])

  React.useEffect(() => {
    if (enabled)
      return
    const frameId = window.requestAnimationFrame(() => {
      setState(prev => (
        prev.canScrollUp || prev.canScrollDown
          ? { canScrollUp: false, canScrollDown: false }
          : prev
      ))
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [enabled])

  const scrollByStep = React.useCallback((direction: -1 | 1) => {
    const list = listRef.current
    if (!list)
      return

    const rows = Array.from(list.querySelectorAll<HTMLElement>(MENU_ROW_SELECTOR))
    const currentTop = list.scrollTop
    let targetTop: number | undefined

    if (direction > 0) {
      for (const row of rows) {
        const rowTop = row.offsetTop - list.offsetTop
        if (rowTop > currentTop + SCROLL_EDGE_TOLERANCE_PX) {
          targetTop = rowTop
          break
        }
      }
    }
    else {
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        const row = rows[index]
        if (!row)
          continue
        const rowTop = row.offsetTop - list.offsetTop
        if (rowTop < currentTop - SCROLL_EDGE_TOLERANCE_PX) {
          targetTop = rowTop
          break
        }
      }
    }

    const fallbackStep = rows[0]?.offsetHeight ?? 18
    list.scrollTo({
      top: targetTop ?? currentTop + direction * fallbackStep,
      behavior: 'auto',
    })
  }, [listRef])

  return { ...state, scrollByStep }
}

interface MenuScrollArrowProps {
  direction: 'up' | 'down'
  onStep: () => void
  className?: string
}

/**
 * Non-focusable Win98-style stepper shown at the top/bottom of tall menus.
 */
export function MenuScrollArrow({
  direction,
  onStep,
  className,
}: MenuScrollArrowProps): React.ReactElement {
  const intervalRef = React.useRef<number | null>(null)

  const stop = React.useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = React.useCallback(() => {
    if (intervalRef.current !== null)
      return
    onStep()
    intervalRef.current = window.setInterval(onStep, REPEAT_INTERVAL_MS)
  }, [onStep])

  React.useEffect(() => stop, [stop])

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== 'touch')
      start()
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault()
    start()
  }

  const arrow = direction === 'up'
    ? (
        <svg aria-hidden="true" viewBox="0 0 7 4" width="7" height="4" shapeRendering="crispEdges">
          <path d="M3 0h1v1h1v1h1v1h1v1H0V3h1V2h1V1h1z" fill="currentColor" />
        </svg>
      )
    : (
        <svg aria-hidden="true" viewBox="0 0 7 4" width="7" height="4" shapeRendering="crispEdges">
          <path d="M0 0h7v1H6v1H5v1H4v1H3V3H2V2H1V1H0z" fill="currentColor" />
        </svg>
      )

  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-menu-scroll={direction}
      className={cn(
        'flex h-3.5 shrink-0 items-center justify-center',
        'cursor-default select-none bg-(--menu) text-(--menu-text)',
        'hover:bg-(--menu-hilight) hover:text-(--hilight-text)',
        className,
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={stop}
      onPointerDown={handlePointerDown}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      {arrow}
    </div>
  )
}
