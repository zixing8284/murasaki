import type * as React from 'react'

/**
 * Triangle indicator thumb for the slider (11×21).
 * Reproduces the original Win98 pixel-art indicator with 4-color bevel.
 */
export function TriangleIndicatorIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg width="11" height="21" viewBox="0 0 11 21" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }} {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M0 0V16H2V18H4V20H5V19H3V17H1V1H10V0Z" fill="white" />
      <path fillRule="evenodd" clipRule="evenodd" d="M1 1V16H2V17H3V18H4V19H6V18H7V17H8V16H9V1Z" fill="#C0C7C8" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9 1H10V16H8V18H6V20H5V19H7V17H9Z" fill="#87888F" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10 0H11V16H9V18H7V20H5V21H6V19H8V17H10Z" fill="black" />
    </svg>
  )
}

/**
 * Box/rectangle indicator thumb for the slider (11×21).
 * Reproduces the original Win98 pixel-art rectangle indicator with 4-color bevel.
 */
export function BoxIndicatorIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg width="11" height="21" viewBox="0 0 11 21" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" style={{ display: 'block' }} {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M0 0V20H1V1H10V0Z" fill="white" />
      <rect x="1" y="1" width="8" height="18" fill="#C0C7C8" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9 1H10V20H1V19H9Z" fill="#87888F" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10 0H11V21H0V20H10Z" fill="black" />
    </svg>
  )
}
