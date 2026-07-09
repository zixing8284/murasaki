/**
 * Select dropdown arrow icons — platform-agnostic SVG path data.
 * Source: packages/ui/src/components/select/select-icons.tsx
 */

import type { IconData } from './types.js'

export const buttonDownIcon: IconData = {
  viewBox: [16, 17],
  shapes: [
    {
      d: 'M15 0H0V1V16H1V1H15V0Z',
      fill: 'buttonLight',
    },
    {
      d: 'M2 1H1V15H2V2H14V1H2Z',
      fill: 'buttonHilight',
    },
    {
      d: 'M16 17H15H0V16H15V0H16V17Z',
      fill: 'buttonDkShadow',
    },
    {
      d: 'M15 1H14V15H1V16H14H15V1Z',
      fill: 'buttonShadow',
    },
    {
      rect: { x: 2, y: 2, width: 12, height: 13 },
      fill: 'buttonFace',
    },
    {
      d: 'M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z',
      fill: 'currentColor',
    },
  ],
}

export const buttonDownActiveIcon: IconData = {
  viewBox: [16, 17],
  shapes: [
    {
      d: 'M0 0H15H16V17H15H0V16V1V0ZM1 16H15V1H1V16Z',
      fill: 'buttonShadow',
    },
    {
      rect: { x: 1, y: 1, width: 14, height: 15 },
      fill: 'buttonFace',
    },
    {
      d: 'M12 7H5V8H6V9H7V10H8V11H9V10H10V9H11V8H12V7Z',
      fill: 'currentColor',
    },
  ],
}
