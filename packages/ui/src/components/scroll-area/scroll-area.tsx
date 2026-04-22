/* eslint-disable react-refresh/only-export-components */

import * as React from 'react'

import { cn, cnPure } from '../../lib/utils'
import { ScrollAreaContext } from './scroll-area-context'
import { ScrollAreaCorner } from './scroll-area-corner'
import { ScrollAreaScrollbar } from './scroll-area-scrollbar'
import { BAR_SIZE, BTN_HEIGHT, useScrollState } from './use-scroll-state'
import { useScrollbar } from './use-scrollbar'

export type ScrollAreaProps = React.ComponentProps<'div'>

/**
 * A Windows 98-style scroll area — declarative React compound component.
 *
 * Renders scrollbars as React elements with observer-based sync.
 * Both vertical and horizontal scrollbars appear automatically when content
 * overflows. Use `ScrollAreaLegacy` if you need the imperative DOM approach.
 *
 * @example
 * ```tsx
 * <ScrollArea className="h-[200px] w-[300px]">
 *   <p>Long content that overflows…</p>
 * </ScrollArea>
 * ```
 */
export function ScrollArea({
  children,
  className,
  ...props
}: ScrollAreaProps): React.ReactElement {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const scrollState = useScrollState(viewportRef)

  const contextValue = React.useMemo(() => ({
    viewportRef,
    metrics: scrollState.metrics,
    vTrackRef: scrollState.vTrackRef,
    hTrackRef: scrollState.hTrackRef,
    scrollStep: scrollState.scrollStep,
    scrollPage: scrollState.scrollPage,
    startDrag: scrollState.startDrag,
    startRepeat: scrollState.startRepeat,
    BAR_SIZE,
    BTN_HEIGHT,
  }), [
    viewportRef,
    scrollState.metrics,
    scrollState.vTrackRef,
    scrollState.hTrackRef,
    scrollState.scrollStep,
    scrollState.scrollPage,
    scrollState.startDrag,
    scrollState.startRepeat,
  ])

  const { hasVertical, hasHorizontal } = scrollState.metrics

  return (
    <ScrollAreaContext value={contextValue}>
      <div className={cn('relative', className)} {...props}>
        <div
          ref={viewportRef}
          className={cnPure('size-full overflow-auto box-border')}
          style={{
            paddingRight: hasVertical ? BAR_SIZE : undefined,
            paddingBottom: hasHorizontal ? BTN_HEIGHT : undefined,
          }}
        >
          {children}
        </div>
        <ScrollAreaScrollbar orientation="vertical" />
        <ScrollAreaScrollbar orientation="horizontal" />
        <ScrollAreaCorner />
      </div>
    </ScrollAreaContext>
  )
}

/**
 * A Windows 98-style scroll area — legacy imperative DOM approach.
 *
 * Uses `useScrollbar` to create and manage scrollbar DOM elements directly.
 * Provided for backward compatibility; prefer `ScrollArea` for new code.
 *
 * @example
 * ```tsx
 * <ScrollAreaLegacy className="h-[200px] w-[300px]">
 *   <p>Long content that overflows…</p>
 * </ScrollAreaLegacy>
 * ```
 */
export function ScrollAreaLegacy({
  children,
  className,
  ...props
}: ScrollAreaProps): React.ReactElement {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  useScrollbar(viewportRef)

  return (
    <div className={cn('relative', className)} {...props}>
      <div
        ref={viewportRef}
        className={cnPure('size-full overflow-auto')}
      >
        {children}
      </div>
    </div>
  )
}

export { useScrollAreaContext } from './scroll-area-context'
export type { ScrollAreaContextValue } from './scroll-area-context'

export { ScrollAreaCorner } from './scroll-area-corner'
export { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from './scroll-area-icons'
export { ScrollAreaScrollbar } from './scroll-area-scrollbar'
export { ScrollAreaThumb } from './scroll-area-thumb'
export { useScrollbar } from './use-scrollbar'
export type { UseScrollbarOptions } from './use-scrollbar'
