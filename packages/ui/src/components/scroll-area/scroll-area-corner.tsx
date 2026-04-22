import * as React from 'react'

import { cnPure } from '#/lib/utils'

import { useScrollAreaContext } from './scroll-area-context'

export type ScrollAreaCornerProps = React.ComponentProps<'div'>

/**
 * Corner piece shown when both vertical and horizontal scrollbars are visible.
 */
export function ScrollAreaCorner({
  className,
  style,
  ...props
}: ScrollAreaCornerProps): React.ReactElement | null {
  const { metrics, BAR_SIZE, BTN_HEIGHT } = useScrollAreaContext()

  if (!metrics.hasVertical || !metrics.hasHorizontal)
    return null

  return (
    <div
      data-murasaki-corner=""
      className={cnPure('absolute bottom-0 right-0 z-101 bg-(--button-face)', className)}
      style={{ width: BAR_SIZE, height: BTN_HEIGHT, ...style }}
      {...props}
    />
  )
}
