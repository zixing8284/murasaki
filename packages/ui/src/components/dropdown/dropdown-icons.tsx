/**
 * Inline SVG icons for dropdown arrow button.
 * Border paths use CSS variable fills for theme adaptation.
 * Arrow uses `currentColor` so it follows the parent's `color` property.
 */

export function ButtonDownIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={17} viewBox="0 0 16 17" width={16} {...props}>
      <path clipRule="evenodd" d="M15 0H0V1V16H1V1H15V0Z" fill="var(--button-light)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M2 1H1V15H2V2H14V1H2Z" fill="var(--button-hilight)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M16 17H15H0V16H15V0H16V17Z" fill="var(--button-dk-shadow)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M15 1H14V15H1V16H14H15V1Z" fill="var(--button-shadow)" fillRule="evenodd" />
      <rect fill="var(--button-face)" height={13} width={12} x={2} y={2} />
      <path clipRule="evenodd" d="M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function ButtonDownActiveIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={17} viewBox="0 0 16 17" width={16} {...props}>
      <path clipRule="evenodd" d="M0 0H15H16V17H15H0V16V1V0ZM1 16H15V1H1V16Z" fill="var(--button-shadow)" fillRule="evenodd" />
      <rect fill="var(--button-face)" height={15} width={14} x={1} y={1} />
      <path clipRule="evenodd" d="M12 7H5V8H6V9H7V10H8V11H9V10H10V9H11V8H12V7Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
