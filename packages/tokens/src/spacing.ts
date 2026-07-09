/**
 * Platform-agnostic spacing tokens for the Windows 98 design system.
 * Values are in pixels (unitless numbers).
 */

export interface SpacingTokens {
  /** Base element spacing (buttons, groups) */
  elementSpacing: number
  /** Spacing between a label and its control */
  labelSpacing: number
  /** Spacing between grouped buttons (e.g. OK / Cancel) */
  groupedButtonSpacing: number
  /** Spacing between grouped form elements */
  groupedElementSpacing: number
  /** Width/height of checkbox hit target */
  checkboxWidth: number
  /** Diameter of radio button option */
  optionSize: number
  /** Height of slider track */
  rangeTrackHeight: number
  /** Spacing around slider controls */
  rangeSpacing: number
}

export const defaultSpacing: SpacingTokens = {
  elementSpacing: 8,
  labelSpacing: 6,
  groupedButtonSpacing: 4,
  groupedElementSpacing: 6,
  checkboxWidth: 13,
  optionSize: 12,
  rangeTrackHeight: 4,
  rangeSpacing: 10,
}
