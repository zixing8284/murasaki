/**
 * Scrollbar arrow icons — platform-agnostic SVG path data.
 * Source: packages/ui/src/components/scroll-area/scroll-area-icons.tsx
 *
 * These icons include the full button border (4-layer bevel) and arrow glyph.
 * The `hasPressedState` flag indicates the icon supports a pressed visual state
 * where bevel colors swap and the glyph shifts by (1,1).
 */

import type { IconData } from './types.js'

/** Shared border shapes for all scroll arrow icons (16×17 button). */
const scrollButtonBorder: IconData['shapes'] = [
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
]

export const arrowUpIcon: IconData = {
  viewBox: [16, 17],
  hasPressedState: true,
  shapes: [
    ...scrollButtonBorder,
    {
      d: 'M8 6H7V7H6V8H5V9H4V10H11V9H10V8H9V7H8V6Z',
      fill: 'buttonText',
    },
  ],
}

export const arrowDownIcon: IconData = {
  viewBox: [16, 17],
  hasPressedState: true,
  shapes: [
    ...scrollButtonBorder,
    {
      d: 'M11 6H4V7H5V8H6V9H7V10H8V9H9V8H10V7H11V6Z',
      fill: 'buttonText',
    },
  ],
}

export const arrowLeftIcon: IconData = {
  viewBox: [16, 17],
  hasPressedState: true,
  shapes: [
    ...scrollButtonBorder,
    {
      d: 'M9 4H8V5H7V6H6V7H5V8H6V9H7V10H8V11H9V4Z',
      fill: 'buttonText',
    },
  ],
}

export const arrowRightIcon: IconData = {
  viewBox: [16, 17],
  hasPressedState: true,
  shapes: [
    ...scrollButtonBorder,
    {
      d: 'M7 4H6V11H7V10H8V9H9V8H10V7H9V6H8V5H7V4Z',
      fill: 'buttonText',
    },
  ],
}

/**
 * Bevel color swap mapping for pressed state.
 * When pressed, the border colors swap to create the inverted bevel effect.
 */
export const scrollButtonPressedSwap: Record<string, string> = {
  buttonLight: 'buttonDkShadow',
  buttonHilight: 'buttonShadow',
  buttonDkShadow: 'buttonHilight',
  buttonShadow: 'buttonLight',
}
