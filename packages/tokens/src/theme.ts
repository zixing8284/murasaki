/**
 * Composite theme type that combines all token categories.
 */

import type { BevelPreset, BevelRecipe } from './bevels.js'
import type { ColorTokens } from './colors.js'
import type { FontSystem } from './fonts.js'
import type { SpacingTokens } from './spacing.js'

export interface Theme {
  /** Unique theme identifier (e.g. 'windows-98', 'marine'). */
  id: string
  /** Color tokens for this theme. */
  colors: ColorTokens
  /** Spacing tokens (shared across all themes). */
  spacing: SpacingTokens
  /** Bevel/shadow recipes (shared across all themes). */
  bevels: Record<BevelPreset, BevelRecipe>
  /** Font system metadata (shared across all themes). */
  fonts: FontSystem
}
