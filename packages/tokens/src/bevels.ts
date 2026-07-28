/**
 * Platform-agnostic bevel/shadow recipes for the Windows 98 3D effect system.
 *
 * Each recipe describes a sequence of bevel layers. A renderer on any platform
 * interprets these layers to produce the classic Win98 raised/sunken/field edges.
 *
 * On web: rendered as CSS `box-shadow: inset ...` with multiple layers.
 * On React Native: rendered as `border*Width` + `border*Color` per edge.
 * On canvas/SVG: rendered as drawn rectangles on each edge.
 */

import type { ColorTokens } from './colors.js'

/** Which edge of the element this bevel layer draws on. */
export type BevelEdge = 'top-left' | 'bottom-right'

/** A single layer in a bevel recipe. */
export interface BevelLayer {
  /** The edge this layer draws on. */
  edge: BevelEdge
  /** Which color token to use for this layer. */
  colorToken: keyof ColorTokens
  /** Pixel offset from the element edge (1 = outermost, 2 = inner, etc.). */
  offset: number
}

/** A complete bevel recipe composed of multiple layers. */
export interface BevelRecipe {
  layers: BevelLayer[]
}

/** Named bevel presets used across components. */
export type BevelPreset = 'raised' | 'sunken' | 'raisedPrimary' | 'borderField'

/**
 * The four bevel presets that define the Win98 3D edge system.
 *
 * - `raised` — default resting state for buttons, menus, toolbars
 * - `sunken` — pressed/active state, inverted raised
 * - `raisedPrimary` — thicker border for default/primary buttons
 * - `borderField` — inset border for text inputs, selects, checkboxes
 */
export const defaultBevels: Record<BevelPreset, BevelRecipe> = {
  raised: {
    layers: [
      // Outer: dark bottom-right, bright top-left
      { edge: 'bottom-right', colorToken: 'buttonDkShadow', offset: 1 },
      { edge: 'top-left', colorToken: 'buttonHilight', offset: 1 },
      // Inner: medium shadow bottom-right, medium light top-left
      { edge: 'bottom-right', colorToken: 'buttonShadow', offset: 2 },
      { edge: 'top-left', colorToken: 'buttonLight', offset: 2 },
    ],
  },

  sunken: {
    layers: [
      // Outer: bright bottom-right (inverted), dark top-left (inverted)
      { edge: 'bottom-right', colorToken: 'buttonHilight', offset: 1 },
      { edge: 'top-left', colorToken: 'buttonDkShadow', offset: 1 },
      // Inner: medium light bottom-right, medium shadow top-left
      { edge: 'bottom-right', colorToken: 'buttonLight', offset: 2 },
      { edge: 'top-left', colorToken: 'buttonShadow', offset: 2 },
    ],
  },

  raisedPrimary: {
    layers: [
      // Frame border (darkest)
      { edge: 'bottom-right', colorToken: 'windowFrame', offset: 2 },
      { edge: 'top-left', colorToken: 'windowFrame', offset: 1 },
      // Highlight
      { edge: 'top-left', colorToken: 'buttonHilight', offset: 2 },
      // Shadow layers
      { edge: 'bottom-right', colorToken: 'buttonShadow', offset: 3 },
      { edge: 'top-left', colorToken: 'buttonLight', offset: 3 },
    ],
  },

  borderField: {
    layers: [
      // Sunken outer: bright bottom-right, shadow top-left
      { edge: 'bottom-right', colorToken: 'buttonHilight', offset: 1 },
      { edge: 'top-left', colorToken: 'buttonShadow', offset: 1 },
      // Raised inner: light bottom-right, dark top-left
      { edge: 'bottom-right', colorToken: 'buttonLight', offset: 2 },
      { edge: 'top-left', colorToken: 'buttonDkShadow', offset: 2 },
    ],
  },
}

/**
 * The classic Win98 "etched text" effect for disabled labels.
 * On web: `[text-shadow: 1px 1px 0 var(--button-hilight)]`
 * On other platforms: a 1px offset duplicate in the highlight color.
 */
export const etchedTextEffect = {
  offsetX: 1,
  offsetY: 1,
  blur: 0,
  colorToken: 'buttonHilight' as const,
}

/**
 * Dither pattern definition for active/disabled button fills.
 * A 2×2 checkerboard alternating between two color tokens.
 * On web: rendered as a base64 PNG or SVG pattern.
 * On other platforms: rendered as a repeating image or drawn pixel-by-pixel.
 */
export interface DitherPattern {
  width: 2
  height: 2
  /** The two color tokens that alternate in the checkerboard. */
  colors: [keyof ColorTokens, keyof ColorTokens]
}

export const defaultDitherPattern: DitherPattern = {
  width: 2,
  height: 2,
  colors: ['buttonFace', 'buttonHilight'],
}
