// ---------------------------------------------------------------------------
// RGB ↔ HSL Conversion
// ---------------------------------------------------------------------------

export interface RGB { r: number, g: number, b: number }
export interface HSL { h: number, s: number, l: number }

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return { h, s, l }
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0)
    t += 1
  if (t > 1)
    t -= 1
  if (t < 1 / 6)
    return p + (q - p) * 6 * t
  if (t < 1 / 2)
    return q
  if (t < 2 / 3)
    return p + (q - p) * (2 / 3 - t) * 6
  return p
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// ---------------------------------------------------------------------------
// Hex ↔ RGB Conversion
// ---------------------------------------------------------------------------

export function hexToRgb(hex: string): RGB {
  const stripped = hex.replace('#', '')
  return {
    r: Number.parseInt(stripped.slice(0, 2), 16),
    g: Number.parseInt(stripped.slice(2, 4), 16),
    b: Number.parseInt(stripped.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`
}

export function rgbToCss({ r, g, b }: RGB): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

export function cssToRgb(css: string): RGB | null {
  const match = css.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match)
    return null
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
}

export function cssToHex(css: string): string {
  const rgb = cssToRgb(css)
  if (!rgb)
    return '#000000'
  return rgbToHex(rgb)
}

// ---------------------------------------------------------------------------
// ButtonFace Derivation (ported from winclassic)
// ---------------------------------------------------------------------------

/**
 * Derives 10 colors from ButtonFace using the winclassic linked-elements logic:
 * - Identity (same RGB): ActiveBorder, ButtonLight, InactiveBorder, Menu
 * - L × 1.5 (HSL lightness): ButtonHilight, Scrollbar
 * - L × 2/3 (HSL lightness): AppWorkspace, ButtonShadow, GrayText, InactiveTitle
 */
export function deriveFromButtonFace(buttonFaceHex: string): Record<string, string> {
  const rgb = hexToRgb(buttonFaceHex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const identity = rgbToHex(rgb)

  const lightenedRgb = hslToRgb(hsl.h, hsl.s, Math.min(1, hsl.l * (3 / 2)))
  const lightened = rgbToHex(lightenedRgb)

  const darkenedRgb = hslToRgb(hsl.h, hsl.s, hsl.l * (2 / 3))
  const darkened = rgbToHex(darkenedRgb)

  return {
    'active-border': identity,
    'button-light': identity,
    'inactive-border': identity,
    'menu': identity,
    'button-hilight': lightened,
    'scrollbar': lightened,
    'app-workspace': darkened,
    'button-shadow': darkened,
    'gray-text': darkened,
    'inactive-title': darkened,
  }
}

/** Keys that are derived from ButtonFace when link-elements is ON */
export const BUTTON_FACE_DERIVED_KEYS = [
  'active-border',
  'button-light',
  'inactive-border',
  'menu',
  'button-hilight',
  'scrollbar',
  'app-workspace',
  'button-shadow',
  'gray-text',
  'inactive-title',
] as const

/** Keys that are derived from titlebar colors when gradients are OFF */
export const TITLEBAR_DERIVED_KEYS = [
  'gradient-active-title',
  'gradient-inactive-title',
] as const

// ---------------------------------------------------------------------------
// Windows .theme Name ↔ CSS Variable Name Mapping
// ---------------------------------------------------------------------------

/** Maps Windows .theme `[Control Panel\Colors]` names to murasaki CSS variable names (without `--` prefix). */
export const THEME_TO_CSS: Record<string, string> = {
  ButtonAlternateFace: 'button-alternate-face',
  ButtonDkShadow: 'button-dk-shadow',
  ButtonFace: 'button-face',
  ButtonHilight: 'button-hilight',
  ButtonLight: 'button-light',
  ButtonShadow: 'button-shadow',
  ButtonText: 'button-text',
  ActiveBorder: 'active-border',
  AppWorkspace: 'app-workspace',
  Background: 'background',
  InactiveBorder: 'inactive-border',
  Scrollbar: 'scrollbar',
  Window: 'window',
  WindowFrame: 'window-frame',
  WindowText: 'window-text',
  ActiveTitle: 'active-title',
  GradientActiveTitle: 'gradient-active-title',
  GradientInactiveTitle: 'gradient-inactive-title',
  InactiveTitle: 'inactive-title',
  InactiveTitleText: 'inactive-title-text',
  TitleText: 'title-text',
  Menu: 'menu',
  MenuBar: 'menu-bar',
  MenuHilight: 'menu-hilight',
  MenuText: 'menu-text',
  GrayText: 'gray-text',
  Hilight: 'hilight',
  HilightText: 'hilight-text',
  HotTrackingColor: 'hot-tracking-color',
  InfoText: 'info-text',
  InfoWindow: 'info-window',
}

/** Reverse mapping: CSS variable name → Windows .theme name */
export const CSS_TO_THEME: Record<string, string> = Object.fromEntries(
  Object.entries(THEME_TO_CSS).map(([k, v]) => [v, k]),
)

// ---------------------------------------------------------------------------
// Default Colors (Windows 98 Standard)
// ---------------------------------------------------------------------------

export const DEFAULT_COLORS: Record<string, string> = {
  'button-alternate-face': '#c0c0c0',
  'button-dk-shadow': '#404040',
  'button-face': '#d4d0c8',
  'button-hilight': '#ffffff',
  'button-light': '#d4d0c8',
  'button-shadow': '#808080',
  'button-text': '#000000',
  'active-border': '#d4d0c8',
  'app-workspace': '#808080',
  'background': '#3a6ea5',
  'inactive-border': '#d4d0c8',
  'scrollbar': '#d4d0c8',
  'window': '#ffffff',
  'window-frame': '#000000',
  'window-text': '#000000',
  'active-title': '#0a246a',
  'gradient-active-title': '#a6caf0',
  'gradient-inactive-title': '#c0c0c0',
  'inactive-title': '#808080',
  'inactive-title-text': '#d4d0c8',
  'title-text': '#ffffff',
  'menu': '#d4d0c8',
  'menu-bar': '#c0c0c0',
  'menu-hilight': '#000080',
  'menu-text': '#000000',
  'gray-text': '#808080',
  'hilight': '#0a246a',
  'hilight-text': '#ffffff',
  'hot-tracking-color': '#000080',
  'info-text': '#000000',
  'info-window': '#ffffe1',
}

/** All 31 CSS variable keys used in the theme system. */
export const ALL_COLOR_KEYS = Object.keys(DEFAULT_COLORS)
