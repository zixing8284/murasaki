/**
 * Platform-agnostic font metadata for the Windows 98 design system.
 * Font file paths are platform-specific (CSS @font-face vs RN expo-font),
 * so this contains only the metadata needed to identify and configure fonts.
 */

export interface FontDefinition {
  family: string
  weights: Record<string, number>
}

export interface FontSystem {
  primary: FontDefinition
  symbol: FontDefinition
  /** Default font size in pixels — the Win98 system font is 11px. */
  defaultSize: number
}

export const fonts: FontSystem = {
  primary: {
    family: 'Pixelated MS Sans Serif',
    weights: {
      normal: 400,
      bold: 700,
    },
  },
  symbol: {
    family: 'Marlett',
    weights: {
      normal: 400,
    },
  },
  defaultSize: 11,
}
