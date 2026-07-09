/**
 * Slider thumb icons — platform-agnostic SVG path data.
 * Source: packages/ui/src/components/slider/slider-icons.tsx
 */

import type { IconData } from './types.js'

export const triangleThumbIcon: IconData = {
  viewBox: [11, 21],
  hasDitherState: true,
  ditherPattern: {
    colors: ['buttonFace', 'buttonHilight'],
  },
  shapes: [
    {
      d: 'M0 0V16H2V18H4V20H5V19H3V17H1V1H10V0Z',
      fill: 'buttonHilight',
    },
    {
      d: 'M1 1V16H2V17H3V18H4V19H6V18H7V17H8V16H9V1Z',
      fill: 'buttonFace',
    },
    {
      d: 'M9 1H10V16H8V18H6V20H5V19H7V17H9Z',
      fill: 'buttonShadow',
    },
    {
      d: 'M10 0H11V16H9V18H7V20H5V21H6V19H8V17H10Z',
      fill: 'buttonDkShadow',
    },
  ],
}

export const rectThumbIcon: IconData = {
  viewBox: [11, 21],
  hasDitherState: true,
  ditherPattern: {
    colors: ['buttonFace', 'buttonHilight'],
  },
  shapes: [
    {
      d: 'M0 0V20H1V1H10V0Z',
      fill: 'buttonHilight',
    },
    {
      rect: { x: 1, y: 1, width: 8, height: 18 },
      fill: 'buttonFace',
    },
    {
      d: 'M9 1H10V20H1V19H9Z',
      fill: 'buttonShadow',
    },
    {
      d: 'M10 0H11V21H0V20H10Z',
      fill: 'buttonDkShadow',
    },
  ],
}
