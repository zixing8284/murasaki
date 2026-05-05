import { cn } from '../../lib/utils'

import { useWindowContext } from './window-context'

export interface WindowOverlayProps extends React.ComponentProps<'div'> {
  /**
   * Override positioning mode.
   * If not provided, uses context's positioning.
   */
  positioning?: 'absolute' | 'fixed'
}

export function WindowOverlay({
  className,
  positioning: positioningProp,
  ...props
}: WindowOverlayProps): React.ReactElement {
  const { meta } = useWindowContext()
  const positioning = positioningProp ?? meta.positioning

  return (
    <div
      aria-hidden="true"
      className={cn(
        'inset-0 bg-black/30',
        positioning === 'fixed' ? 'fixed' : 'absolute',
        className,
      )}
      {...props}
    />
  )
}
