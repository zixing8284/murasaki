/**
 * Inline SVG icons for scrollbar arrow buttons.
 * Uses CSS variable fills for theme adaptation following Win98 3D bevel:
 * - ButtonLight: outer top-left highlight edge
 * - ButtonHilight: inner top-left highlight edge
 * - ButtonDkShadow: outer bottom-right dark border
 * - ButtonShadow: inner bottom-right shadow edge
 * - ButtonFace: main button background
 * - ButtonText: arrow glyph color
 *
 * Each icon renders the complete button (border + face + arrow) at 16×17px,
 * matching the original button-*.svg reference files exactly.
 */

interface ScrollArrowIconProps extends React.SVGProps<SVGSVGElement> {
  pressed?: boolean
}

function borderFill(normal: string, pressed: string, isPressed?: boolean): string {
  return isPressed ? `var(${pressed})` : `var(${normal})`
}

export function ArrowUpIcon({ pressed, ...props }: ScrollArrowIconProps): React.ReactElement {
  return (
    <svg fill="none" height={17} shapeRendering="crispEdges" viewBox="0 0 16 17" width={16} {...props}>
      <path clipRule="evenodd" d="M15 0H0V1V16H1V1H15V0Z" fill={borderFill('--button-light', '--button-dk-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M2 1H1V15H2V2H14V1H2Z" fill={borderFill('--button-hilight', '--button-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M16 17H15H0V16H15V0H16V17Z" fill={borderFill('--button-dk-shadow', '--button-hilight', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M15 1H14V15H1V16H14H15V1Z" fill={borderFill('--button-shadow', '--button-light', pressed)} fillRule="evenodd" />
      <rect fill="var(--button-face)" height={13} width={12} x={2} y={2} />
      <path clipRule="evenodd" d="M8 6H7V7H6V8H5V9H4V10H11V9H10V8H9V7H8V6Z" fill="var(--button-text)" fillRule="evenodd" transform={pressed ? 'translate(1,1)' : undefined} />
    </svg>
  )
}

export function ArrowDownIcon({ pressed, ...props }: ScrollArrowIconProps): React.ReactElement {
  return (
    <svg fill="none" height={17} shapeRendering="crispEdges" viewBox="0 0 16 17" width={16} {...props}>
      <path clipRule="evenodd" d="M15 0H0V1V16H1V1H15V0Z" fill={borderFill('--button-light', '--button-dk-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M2 1H1V15H2V2H14V1H2Z" fill={borderFill('--button-hilight', '--button-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M16 17H15H0V16H15V0H16V17Z" fill={borderFill('--button-dk-shadow', '--button-hilight', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M15 1H14V15H1V16H14H15V1Z" fill={borderFill('--button-shadow', '--button-light', pressed)} fillRule="evenodd" />
      <rect fill="var(--button-face)" height={13} width={12} x={2} y={2} />
      <path clipRule="evenodd" d="M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z" fill="var(--button-text)" fillRule="evenodd" transform={pressed ? 'translate(1,1)' : undefined} />
    </svg>
  )
}

export function ArrowLeftIcon({ pressed, ...props }: ScrollArrowIconProps): React.ReactElement {
  return (
    <svg fill="none" height={17} shapeRendering="crispEdges" viewBox="0 0 16 17" width={16} {...props}>
      <path clipRule="evenodd" d="M15 0H0V1V16H1V1H15V0Z" fill={borderFill('--button-light', '--button-dk-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M2 1H1V15H2V2H14V1H2Z" fill={borderFill('--button-hilight', '--button-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M16 17H15H0V16H15V0H16V17Z" fill={borderFill('--button-dk-shadow', '--button-hilight', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M15 1H14V15H1V16H14H15V1Z" fill={borderFill('--button-shadow', '--button-light', pressed)} fillRule="evenodd" />
      <rect fill="var(--button-face)" height={13} width={12} x={2} y={2} />
      <path clipRule="evenodd" d="M9 4H8V5H7V6H6V7H5V8H6V9H7V10H8V11H9V4Z" fill="var(--button-text)" fillRule="evenodd" transform={pressed ? 'translate(1,1)' : undefined} />
    </svg>
  )
}

export function ArrowRightIcon({ pressed, ...props }: ScrollArrowIconProps): React.ReactElement {
  return (
    <svg fill="none" height={17} shapeRendering="crispEdges" viewBox="0 0 16 17" width={16} {...props}>
      <path clipRule="evenodd" d="M15 0H0V1V16H1V1H15V0Z" fill={borderFill('--button-light', '--button-dk-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M2 1H1V15H2V2H14V1H2Z" fill={borderFill('--button-hilight', '--button-shadow', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M16 17H15H0V16H15V0H16V17Z" fill={borderFill('--button-dk-shadow', '--button-hilight', pressed)} fillRule="evenodd" />
      <path clipRule="evenodd" d="M15 1H14V15H1V16H14H15V1Z" fill={borderFill('--button-shadow', '--button-light', pressed)} fillRule="evenodd" />
      <rect fill="var(--button-face)" height={13} width={12} x={2} y={2} />
      <path clipRule="evenodd" d="M7 4H6V11H7V10H8V9H9V8H10V7H9V6H8V5H7V4Z" fill="var(--button-text)" fillRule="evenodd" transform={pressed ? 'translate(1,1)' : undefined} />
    </svg>
  )
}
