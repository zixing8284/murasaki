/**
 * Inline SVG icons for window title bar buttons.
 * Use `currentColor` so the icon color follows the parent's `color` property,
 * which is driven by CSS variables (e.g. `--button-text`).
 */

export function CloseIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={7} viewBox="0 0 8 7" width={8} {...props}>
      <path clipRule="evenodd" d="M0 0H1H2V1H3V2H4H5V1H6V0H7H8V1H7V2H6V3H5V4H6V5H7V6H8V7H7H6V6H5V5H4H3V6H2V7H1H0V6H1V5H2V4H3V3H2V2H1V1H0V0Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function MaximizeIcon({ disabled, ...props }: React.SVGProps<SVGSVGElement> & { disabled?: boolean }): React.ReactElement {
  if (disabled) {
    return (
      <svg fill="none" height={10} viewBox="0 0 10 10" width={10} {...props}>
        <path clipRule="evenodd" d="M10 1H1V3V9V10H2H9H10V9V3V1ZM9 3H2V9H9V3Z" fill="var(--button-hilight)" fillRule="evenodd" />
        <path clipRule="evenodd" d="M9 0H0V2V8V9H1H8H9V8V2V0ZM8 2H1V8H8V2Z" fill="var(--gray-text)" fillRule="evenodd" />
      </svg>
    )
  }
  return (
    <svg fill="none" height={9} viewBox="0 0 10 9" width={10} {...props}>
      <path clipRule="evenodd" d="M9 0H0V2V8V9H1H8H9V8V2V0ZM8 2H1V8H8V2Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function MinimizeIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={2} viewBox="0 0 6 2" width={6} {...props}>
      <rect fill="currentColor" height={2} width={6} />
    </svg>
  )
}

export function RestoreIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={9} viewBox="0 0 8 9" width={8} {...props}>
      <rect fill="currentColor" height={2} width={6} x={2} y={0} />
      <rect fill="currentColor" height={4} width={1} x={7} y={2} />
      <rect fill="currentColor" height={1} width={1} x={2} y={2} />
      <rect fill="currentColor" height={1} width={1} x={6} y={5} />
      <rect fill="currentColor" height={2} width={6} x={0} y={3} />
      <rect fill="currentColor" height={4} width={1} x={5} y={5} />
      <rect fill="currentColor" height={4} width={1} x={0} y={5} />
      <rect fill="currentColor" height={1} width={4} x={1} y={8} />
    </svg>
  )
}

export function HelpIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={9} viewBox="0 0 6 9" width={6} {...props}>
      <rect fill="currentColor" height={2} width={2} x={0} y={1} />
      <rect fill="currentColor" height={1} width={4} x={1} y={0} />
      <rect fill="currentColor" height={2} width={2} x={4} y={1} />
      <rect fill="currentColor" height={1} width={2} x={3} y={3} />
      <rect fill="currentColor" height={2} width={2} x={2} y={4} />
      <rect fill="currentColor" height={2} width={2} x={2} y={7} />
    </svg>
  )
}
