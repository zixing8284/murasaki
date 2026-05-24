/**
 * Inline SVG icons for slider thumb components.
 * Uses CSS variable fills for theme adaptation following Win98 3D bevel:
 * - ButtonHilight: top-left highlight edge
 * - ButtonFace: main button face
 * - ButtonShadow: bottom-right shadow edge
 * - ButtonDkShadow: outer dark border
 */

import { useId } from 'react'

export function TriangleThumbIcon({
  active,
  ...props
}: React.SVGProps<SVGSVGElement> & { active?: boolean }): React.ReactElement {
  const patternId = useId()
  const faceFill = active ? `url(#${patternId})` : 'var(--button-face)'
  return (
    <svg fill="none" height={21} viewBox="0 0 11 21" width={11} {...props}>
      <defs>
        <pattern height="2" id={patternId} patternUnits="userSpaceOnUse" width="2" x="0" y="0">
          <rect fill="var(--button-face)" height="1" width="1" x="0" y="0" />
          <rect fill="var(--button-face)" height="1" width="1" x="1" y="1" />
          <rect fill="var(--button-hilight)" height="1" width="1" x="1" y="0" />
          <rect fill="var(--button-hilight)" height="1" width="1" x="0" y="1" />
        </pattern>
      </defs>
      <path
        clipRule="evenodd"
        d="M0 0V16H2V18H4V20H5V19H3V17H1V1H10V0Z"
        fill="var(--button-hilight)"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M1 1V16H2V17H3V18H4V19H6V18H7V17H8V16H9V1Z"
        fill={faceFill}
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M9 1H10V16H8V18H6V20H5V19H7V17H9Z"
        fill="var(--button-shadow)"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M10 0H11V16H9V18H7V20H5V21H6V19H8V17H10Z"
        fill="var(--button-dk-shadow)"
        fillRule="evenodd"
      />
    </svg>
  )
}

export function RectThumbIcon({
  active,
  ...props
}: React.SVGProps<SVGSVGElement> & { active?: boolean }): React.ReactElement {
  const patternId = useId()
  const faceFill = active ? `url(#${patternId})` : 'var(--button-face)'
  return (
    <svg fill="none" height={21} viewBox="0 0 11 21" width={11} {...props}>
      <defs>
        <pattern height="2" id={patternId} patternUnits="userSpaceOnUse" width="2" x="0" y="0">
          <rect fill="var(--button-face)" height="1" width="1" x="0" y="0" />
          <rect fill="var(--button-face)" height="1" width="1" x="1" y="1" />
          <rect fill="var(--button-hilight)" height="1" width="1" x="1" y="0" />
          <rect fill="var(--button-hilight)" height="1" width="1" x="0" y="1" />
        </pattern>
      </defs>
      <path
        clipRule="evenodd"
        d="M0 0V20H1V1H10V0Z"
        fill="var(--button-hilight)"
        fillRule="evenodd"
      />
      <rect fill={faceFill} height="18" width="8" x="1" y="1" />
      <path
        clipRule="evenodd"
        d="M9 1H10V20H1V19H9Z"
        fill="var(--button-shadow)"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M10 0H11V21H0V20H10Z"
        fill="var(--button-dk-shadow)"
        fillRule="evenodd"
      />
    </svg>
  )
}
