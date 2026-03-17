/**
 * Inline SVG icon for checkbox checkmark.
 * Uses `currentColor` so the icon color follows the parent's `color` property,
 * which is driven by CSS variables (e.g. `--button-text`).
 */
export function CheckmarkIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg fill="none" height={7} viewBox="0 0 7 7" width={7} {...props}>
      <path clipRule="evenodd" d="M7 0H6V1H5V2H4V3H3V4H2V3H1V2H0V5H1V6H2V7H3V6H4V5H5V4H6V3H7V0Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
