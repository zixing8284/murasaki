/**
 * Default Windows 98 theme colors.
 * Source: packages/ui/src/theme.css (lines 21-91)
 */

import type { ColorTokens } from '../colors.js'

export const windows98: ColorTokens = {
  /* Button */
  buttonAlternateFace: 'rgb(192, 192, 192)',
  buttonDkShadow: 'rgb(64, 64, 64)',
  buttonFace: 'rgb(212, 208, 200)',
  buttonHilight: 'rgb(255, 255, 255)',
  buttonLight: 'rgb(212, 208, 200)',
  buttonShadow: 'rgb(128, 128, 128)',
  buttonText: 'rgb(34, 34, 34)',

  /* Window / Frame */
  activeBorder: 'rgb(212, 208, 200)',
  appWorkspace: 'rgb(128, 128, 128)',
  desktopText: 'rgb(255, 255, 255)',
  inactiveBorder: 'rgb(212, 208, 200)',
  scrollbar: 'rgb(212, 208, 200)',
  window: 'rgb(255, 255, 255)',
  windowFrame: 'rgb(0, 0, 0)',
  windowText: 'rgb(0, 0, 0)',

  /* Title Bar */
  activeTitle: 'rgb(10, 36, 106)',
  gradientActiveTitle: 'rgb(166, 202, 240)',
  gradientInactiveTitle: 'rgb(192, 192, 192)',
  inactiveTitle: 'rgb(128, 128, 128)',
  inactiveTitleText: 'rgb(212, 208, 200)',
  titleText: 'rgb(255, 255, 255)',

  /* Menu */
  menu: 'rgb(212, 208, 200)',
  menuBar: 'rgb(212, 208, 200)',
  menuHilight: 'rgb(0, 0, 128)',
  menuText: 'rgb(0, 0, 0)',
  grayText: 'rgb(128, 128, 128)',

  /* Highlight / Selection */
  hilight: 'rgb(10, 36, 106)',
  hilightText: 'rgb(255, 255, 255)',
  hotTrackingColor: 'rgb(0, 0, 128)',

  /* Tooltip */
  infoText: 'rgb(0, 0, 0)',
  infoWindow: 'rgb(255, 255, 225)',

  /* Desktop */
  background: 'rgb(58, 110, 165)',
}
