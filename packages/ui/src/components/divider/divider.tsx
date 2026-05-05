import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const dividerVariants = cva(
  [],
  {
    variants: {
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full flex',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

export interface DividerProps
  extends React.ComponentProps<'div'>,
  VariantProps<typeof dividerVariants> {}

export function Divider({
  className,
  orientation,
  ref,
  ...props
}: DividerProps): React.ReactElement {
  if (orientation === 'vertical') {
    return (
      <div ref={ref} className={cn(dividerVariants({ orientation, className }))} {...props}>
        <div className="w-0 border-r border-r-(--button-shadow)" />
        <div className="w-0 border-r border-r-(--button-hilight)" />
      </div>
    )
  }

  return (
    <div ref={ref} className={cn(dividerVariants({ orientation, className }))} {...props}>
      <div className="h-0 border-b border-b-(--button-shadow)" />
      <div className="h-0 border-b border-b-(--button-hilight)" />
    </div>
  )
}
