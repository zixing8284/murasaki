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

  // use Marlett font characters to create the grip dots pattern,
  // which ensures it scales properly with font size and looks consistent with classic Windows UI
  return (
    <div
      ref={ref}
      className={cn(
        'absolute right-0.5 bottom-0.5 size-4 cursor-nwse-resize overflow-hidden',
        // Marlett "p" (\0070) — shadow dots, offset right 4px
        'before:content-["p"] before:absolute before:bottom-0.5 before:right-1',
        'before:font-["Marlett"] before:text-base before:leading-none',
        'before:text-(--button-shadow)',
        // Marlett "o" (\006F) — highlight dots, offset right 3px
        'after:content-["o"] after:absolute after:bottom-0.5 after:right-[3px]',
        'after:font-["Marlett"] after:text-base after:leading-none',
        'after:text-(--button-hilight)',
        className,
      )}
      role="presentation"
      data-resize-handle="status-grip"
      {...props}
    />
  )
}
