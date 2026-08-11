import { cva } from 'class-variance-authority'

import { useRef } from 'react'

import { cn } from '../../lib/utils'

import { useWindowContext } from './window-context'

const titleBarVariants = cva(
  [
    'flex',
    'items-center',
    'justify-between',
    'h-[18px]',
    // Taller, easier-to-hit drag target on touch/coarse pointers.
    'pointer-coarse:h-6',
    'px-0.5',
    'text-[11px]',
    'font-bold',
    'select-none',
    // Title bar is the drag handle; prevent touch gestures from being claimed
    // for scrolling/zooming so pointer drags keep firing on touch devices.
    'touch-none',
  ],
  {
    variants: {
      active: {
        true: 'bg-linear-to-r from-(--active-title) to-(--gradient-active-title) text-(--title-text)',
        false: 'bg-linear-to-r from-(--inactive-title) to-(--gradient-inactive-title) text-(--inactive-title-text)',
      },
    },
    defaultVariants: {
      active: true,
    },
  },
)

export interface WindowTitleBarProps extends React.ComponentProps<'div'> {}

export function WindowTitleBar({
  children,
  className,
  ref,
  onDoubleClick,
  ...props
}: WindowTitleBarProps): React.ReactElement {
  const { state, actions, meta } = useWindowContext()
  const lastTapRef = useRef(0)

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (meta.maximizable) {
      actions.toggleMaximized()
    }
    onDoubleClick?.(e)
  }

  // Touch never fires `dblclick`, so detect a double-tap via pointerup timing and
  // run the same maximize path. Mouse keeps using the native double-click above.
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.pointerType === 'mouse')
      return
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea, [role="button"]'))
      return
    const now = Date.now()
    if (now - lastTapRef.current <= 300) {
      lastTapRef.current = 0
      handleDoubleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
    else {
      lastTapRef.current = now
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        titleBarVariants({ active: state.active }),
        className,
      )}
      onDoubleClick={handleDoubleClick}
      onPointerUp={handlePointerUp}
      {...props}
    >
      {children}
    </div>
  )
}
