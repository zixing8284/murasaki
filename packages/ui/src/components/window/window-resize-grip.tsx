import { cn } from '#/lib/utils'

import { useWindowContext } from './window-context'

export interface WindowResizeGripProps extends React.ComponentProps<'div'> {}

export function WindowResizeGrip({
  className,
  ref,
  ...props
}: WindowResizeGripProps): React.ReactElement | null {
  const { state } = useWindowContext()

  // Hide grip when maximized — resize is not applicable
  if (state.maximized) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'absolute right-0.5 bottom-0.5 size-4 cursor-nwse-resize bgi-resize-grip',
        className,
      )}
      {...props}
    />
  )
}
