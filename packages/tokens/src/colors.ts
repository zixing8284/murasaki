/**
 * Platform-agnostic color tokens for the Windows 98 design system.
 * These map 1:1 to CSS custom properties defined in `@murasaki-io/react98/theme.css`.
 *
 * Values use CSS color syntax (`rgb()` or hex) so they can be consumed by any
 * platform that parses CSS color strings (web, React Native with a color parser, etc.).
 */

export interface ColorTokens {
  /* Button */
  buttonAlternateFace: string
  buttonDkShadow: string
  buttonFace: string
  buttonHilight: string
  buttonLight: string
  buttonShadow: string
  buttonText: string

  /* Window / Frame */
  activeBorder: string
  appWorkspace: string
  desktopText: string
  inactiveBorder: string
  scrollbar: string
  window: string
  windowFrame: string
  windowText: string

  /* Title Bar */
  activeTitle: string
  gradientActiveTitle: string
  gradientInactiveTitle: string
  inactiveTitle: string
  inactiveTitleText: string
  titleText: string

  /* Menu */
  menu: string
  menuBar: string
  menuHilight: string
  menuText: string
  grayText: string

  /* Highlight / Selection */
  hilight: string
  hilightText: string
  hotTrackingColor: string

  /* Tooltip */
  infoText: string
  infoWindow: string

  /* Desktop */
  background: string
}

/** All color token keys in definition order. */
export const colorTokenKeys: readonly (keyof ColorTokens)[] = [
  /* Button */
  'buttonAlternateFace',
  'buttonDkShadow',
  'buttonFace',
  'buttonHilight',
  'buttonLight',
  'buttonShadow',
  'buttonText',
  /* Window / Frame */
  'activeBorder',
  'appWorkspace',
  'desktopText',
  'inactiveBorder',
  'scrollbar',
  'window',
  'windowFrame',
  'windowText',
  /* Title Bar */
  'activeTitle',
  'gradientActiveTitle',
  'gradientInactiveTitle',
  'inactiveTitle',
  'inactiveTitleText',
  'titleText',
  /* Menu */
  'menu',
  'menuBar',
  'menuHilight',
  'menuText',
  'grayText',
  /* Highlight / Selection */
  'hilight',
  'hilightText',
  'hotTrackingColor',
  /* Tooltip */
  'infoText',
  'infoWindow',
  /* Desktop */
  'background',
] as const
