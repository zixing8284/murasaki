/**
 * Inline SVG icons for option-button (radio) component.
 * Border paths use CSS variable fills for theme adaptation.
 * Dot uses `currentColor` so it follows the parent's `color` property.
 */

export function RadioBorderIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={12} viewBox="0 0 12 12" width={12} {...props}>
      <path clipRule="evenodd" d="M8 0H4V1H2V2H1V4H0V8H1V10H2V8H1V4H2V2H4V1H8V2H10V1H8V0Z" fill="var(--button-shadow)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M8 1H4V2H2V3V4H1V8H2V9H3V8H2V4H3V3H4V2H8V3H10V2H8V1Z" fill="var(--button-dk-shadow)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M9 3H10V4H9V3ZM10 8V4H11V8H10ZM8 10V9H9V8H10V9V10H8ZM4 10V11H8V10H4ZM4 10V9H2V10H4Z" fill="var(--button-light)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M11 2H10V4H11V8H10V10H8V11H4V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2Z" fill="var(--button-hilight)" fillRule="evenodd" />
      <path clipRule="evenodd" d="M4 2H8V3H9V4H10V8H9V9H8V10H4V9H3V8H2V4H3V3H4V2Z" fill="var(--radio-inner-bg)" fillRule="evenodd" />
    </svg>
  )
}

export function RadioDotIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={4} viewBox="0 0 4 4" width={4} {...props}>
      <path clipRule="evenodd" d="M3 0H1V1H0V2V3H1V4H3V3H4V2V1H3V0Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
