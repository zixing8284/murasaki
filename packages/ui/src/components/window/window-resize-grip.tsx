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
        'absolute right-0.5 bottom-0.5 size-4 cursor-nwse-resize overflow-hidden',
        'before:content["\x07"] before:absolute before:bottom-0.5 before:right-1',
        'before:text-(--button-shadow) before:text-base before:leading-none',
        'after:content-["\x6F"] after:absolute after:bottom-0.5 after:right-0.75',
        'after:text-(--button-hilight) after:text-base after:leading-none',
        className,
      )}
      role="presentation"
      data-resize-handle="status-grip"
      {...props}
    />
  )
}
