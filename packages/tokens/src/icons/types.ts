/**
 * Platform-agnostic icon data types.
 * Icons are stored as SVG path data with semantic fill role mappings,
 * so any platform can render them by resolving roles to actual colors.
 */

import type { ColorTokens } from '../colors.js'

/**
 * Semantic fill roles that map to color tokens or inherited color.
 * - `'currentColor'` — inherits from parent (platform-specific: CSS `currentColor`, RN parent color)
 * - Any `ColorTokens` key — resolved from the active theme
 */
export type IconFillRole = 'currentColor' | keyof ColorTokens

/** A single SVG path or rect with a semantic fill role. */
export interface IconShape {
  /** SVG path `d` attribute, or `null` for rect-based shapes. */
  d?: string
  /** For rect-based shapes (pixel art). */
  rect?: { x: number, y: number, width: number, height: number }
  /** Which semantic color this shape uses. */
  fill: IconFillRole
}

/** A dither pattern definition for active/disabled icon states. */
export interface IconDitherPattern {
  /** The two alternating fill roles for the 2×2 checkerboard. */
  colors: [IconFillRole, IconFillRole]
}

/** Complete platform-agnostic icon definition. */
export interface IconData {
  /** SVG viewBox dimensions `[width, height]`. */
  viewBox: [number, number]
  /** Ordered list of shapes to render. */
  shapes: IconShape[]
  /** If true, the icon supports a pressed state that shifts the glyph. */
  hasPressedState?: boolean
  /** If true, the icon uses a dither pattern when active/disabled. */
  hasDitherState?: boolean
  /** Dither pattern for active/disabled states. */
  ditherPattern?: IconDitherPattern
}
