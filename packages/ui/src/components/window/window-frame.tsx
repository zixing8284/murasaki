import { cn } from '#/lib/utils'

import { cva } from 'class-variance-authority'

import { useWindowContext, useWindowRefs } from './window-context'

const frameVariants = cva([
  'shadow-[inset_-1px_-1px_var(--color-window-frame),inset_1px_1px_var(--color-btn-hilight),inset_-2px_-2px_var(--color-btn-shadow),inset_2px_2px_var(--color-btn-light)]',
  'bg-btn-face',
  'inline-flex',
  'flex-col',
  'min-w-[200px]',
  'w-[520px]',
  'max-h-[80%]',
  'p-1',
  'mx-auto',
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
  positioning: positioningProp,
  ...props
}: WindowFrameProps): React.ReactElement {
  const { state, meta } = useWindowContext()
  const { setFrameRef } = useWindowRefs()
  const positioning = positioningProp ?? meta.positioning

  return (
    <div
      ref={setFrameRef}
      className={cn(
        frameVariants(),
        'top-1/2 right-0 left-0 -translate-y-1/2',
        positioning === 'fixed' ? 'fixed' : 'absolute',
        state.maximized && 'inset-0 size-full! max-h-full translate-y-0! transform-[translate(0px,0px)]!',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
