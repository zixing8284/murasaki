import * as React from 'react'

import { cnPure } from '#/lib/utils'

import { THUMB_BOX_SHADOW } from './scroll-area-constants'
import { useScrollAreaContext } from './scroll-area-context'

export interface ScrollAreaThumbProps extends React.ComponentProps<'div'> {
  orientation: 'vertical' | 'horizontal'
}

/**
 * Draggable scrollbar thumb. Receives position/size from context
 * and wires up mousedown → drag via the imperative hook.
 */
export function ScrollAreaThumb({
  orientation,
  className,
  style,
  ...props
}: ScrollAreaThumbProps): React.ReactElement {
  const { metrics, startDrag, BAR_SIZE, BTN_HEIGHT } = useScrollAreaContext()
  const isVertical = orientation === 'vertical'

  const thumbStyle: React.CSSProperties = isVertical
    ? {
        top: metrics.vThumbTop,
        height: metrics.vThumbHeight,
        left: 0,
        width: BAR_SIZE,
      }
    : {
        left: metrics.hThumbLeft,
        width: metrics.hThumbWidth,
        top: 0,
        height: BTN_HEIGHT,
      }

  const onMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    startDrag(
      isVertical ? 'v' : 'h',
      isVertical ? e.clientY : e.clientX,
    )
  }

  return (
    <div
      data-murasaki-thumb={isVertical ? 'v' : 'h'}
      className={cnPure(
        'absolute cursor-default box-border',
        'bg-(--button-face)',
        className,
      )}
      style={{ ...thumbStyle, minWidth: BAR_SIZE, minHeight: BAR_SIZE, boxShadow: THUMB_BOX_SHADOW, ...style }}
      onMouseDown={onMouseDown}
      {...props}
    />
  )
}
