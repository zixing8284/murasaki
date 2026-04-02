import * as React from 'react'

import { cn } from '../../lib/utils'
import { useScrollbar } from './use-scrollbar'

export type ScrollAreaProps = React.ComponentProps<'div'>

/**
 * A Windows 98-style scroll area wrapper.
 *
 * Renders a container with a hidden native scrollbar and a custom DOM-based
 * scrollbar overlay (arrow buttons, track, thumb, corner) that matches the
 * Win98 look. Both vertical and horizontal scrollbars appear automatically
 * when content overflows.
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
  useScrollbar(viewportRef)

  return (
    <div className={cn('relative', className)} {...props}>
      <div
        ref={viewportRef}
        className={cn('size-full overflow-auto')}
      >
        {children}
      </div>
    </div>
  )
}
