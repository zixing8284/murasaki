import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useWindowContext } from './window-context'

const frameVariants = cva([
  'shadow-[inset_-1px_-1px_var(--color-window-frame),inset_1px_1px_var(--color-btn-hilight),inset_-2px_-2px_var(--color-btn-shadow),inset_2px_2px_var(--color-btn-light)]',
  'bg-btn-face',
  'flex',
  'flex-col',
  'min-w-[200px]',
  'p-1',
])

export interface WindowFrameProps extends React.ComponentProps<'div'> {
  /**
   * Override positioning mode.
   * If not provided, uses context's positioning.
   */
  positioning?: 'absolute' | 'fixed'
}

export function WindowFrame({
  children,
  className,
  ref,
  positioning: positioningProp,
  ...props
}: WindowFrameProps): React.ReactElement {
  const { state, meta } = useWindowContext()
  const positioning = positioningProp ?? meta.positioning

  return (
    <div
      ref={ref}
      className={cn(
        frameVariants(),
        positioning === 'fixed' ? 'fixed' : 'absolute',
        state.maximized && 'inset-0! size-full! max-h-full translate-y-0! transform-[translate(0px,0px)]!',
        state.minimized && 'hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
