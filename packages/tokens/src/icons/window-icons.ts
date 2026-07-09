/**
 * Window title bar icons — platform-agnostic SVG path data.
 * Source: packages/ui/src/components/window/window-icons.tsx
 */

import type { IconData } from './types.js'

export const closeIcon: IconData = {
  viewBox: [8, 8],
  shapes: [
    {
      d: 'M0 0H1H2V1H3V2H4H5V1H6V0H7H8V1H7V2H6V3H5V4H6V5H7V6H8V7H7H6V6H5V5H4H3V6H2V7H1H0V6H1V5H2V4H3V3H2V2H1V1H0V0Z',
      fill: 'currentColor',
    },
  ],
}

export const maximizeIcon: IconData = {
  viewBox: [10, 10],
  shapes: [
    {
      d: 'M9 0H0V2V8V9H1H8H9V8V2V0ZM8 2H1V8H8V2Z',
      fill: 'currentColor',
    },
  ],
}

/** Disabled variant of maximize icon uses explicit color tokens. */
export const maximizeDisabledIcon: IconData = {
  viewBox: [10, 10],
  shapes: [
    {
      d: 'M10 1H1V3V9V10H2H9H10V9V3V1ZM9 3H2V9H9V3Z',
      fill: 'buttonHilight',
    },
    {
      d: 'M9 0H0V2V8V9H1H8H9V8V2V0ZM8 2H1V8H8V2Z',
      fill: 'grayText',
    },
  ],
}

export const minimizeIcon: IconData = {
  viewBox: [8, 8],
  shapes: [
    { rect: { x: 0, y: 6, width: 6, height: 2 }, fill: 'currentColor' },
  ],
}

export const restoreIcon: IconData = {
  viewBox: [8, 9],
  shapes: [
    { rect: { x: 2, y: 0, width: 6, height: 2 }, fill: 'currentColor' },
    { rect: { x: 7, y: 2, width: 1, height: 4 }, fill: 'currentColor' },
    { rect: { x: 2, y: 2, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 6, y: 5, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 0, y: 3, width: 6, height: 2 }, fill: 'currentColor' },
    { rect: { x: 5, y: 5, width: 1, height: 4 }, fill: 'currentColor' },
    { rect: { x: 0, y: 5, width: 1, height: 4 }, fill: 'currentColor' },
    { rect: { x: 1, y: 8, width: 4, height: 1 }, fill: 'currentColor' },
  ],
}

export const helpIcon: IconData = {
  viewBox: [6, 9],
  shapes: [
    { rect: { x: 0, y: 1, width: 2, height: 2 }, fill: 'currentColor' },
    { rect: { x: 1, y: 0, width: 4, height: 1 }, fill: 'currentColor' },
    { rect: { x: 4, y: 1, width: 2, height: 2 }, fill: 'currentColor' },
    { rect: { x: 3, y: 3, width: 2, height: 1 }, fill: 'currentColor' },
    { rect: { x: 2, y: 4, width: 2, height: 2 }, fill: 'currentColor' },
    { rect: { x: 2, y: 7, width: 2, height: 2 }, fill: 'currentColor' },
  ],
}
