/**
 * Radio button icons — platform-agnostic SVG path data.
 * Source: packages/ui/src/components/option-button/option-button-icons.tsx
 *
 * The radio inner fill uses a component-local CSS variable `--radio-inner-bg`
 * that toggles between `buttonFace` (unchecked), `buttonHilight` (disabled),
 * and `hilight` (checked). We use `buttonFace` as the default here; renderers
 * should override this fill based on the radio's checked/disabled state.
 */

import type { IconData } from './types.js'

export const radioBorderIcon: IconData = {
  viewBox: [12, 12],
  shapes: [
    {
      d: 'M8 0H4V1H2V2H1V4H0V8H1V10H2V8H1V4H2V2H4V1H8V2H10V1H8V0Z',
      fill: 'buttonShadow',
    },
    {
      d: 'M8 1H4V2H2V3V4H1V8H2V9H3V8H2V4H3V3H4V2H8V3H10V2H8V1Z',
      fill: 'buttonDkShadow',
    },
    {
      d: 'M9 3H10V4H9V3ZM10 8V4H11V8H10ZM8 10V9H9V8H10V9V10H8ZM4 10V11H8V10H4ZM4 10V9H2V10H4Z',
      fill: 'buttonLight',
    },
    {
      d: 'M11 2H10V4H11V8H10V10H8V11H4V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2Z',
      fill: 'buttonHilight',
    },
    {
      d: 'M4 2H8V3H9V4H10V8H9V9H8V10H4V9H3V8H2V4H3V3H4V2Z',
      fill: 'buttonFace',
    },
  ],
}

export const radioDotIcon: IconData = {
  viewBox: [4, 4],
  shapes: [
    {
      d: 'M3 0H1V1H0V2V3H1V4H3V3H4V2V1H3V0Z',
      fill: 'currentColor',
    },
  ],
}
