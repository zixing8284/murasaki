/**
 * @murasaki-io/tokens — Platform-agnostic design tokens for the Windows 98 design system.
 *
 * This package contains no web-specific code (no CSS, no DOM, no Tailwind).
 * Any platform (web, React Native, canvas, terminal) can consume these tokens
 * and render the Windows 98 aesthetic using native primitives.
 */

export { defaultBevels, defaultDitherPattern, etchedTextEffect } from './bevels.js'
export type { BevelEdge, BevelLayer, BevelPreset, BevelRecipe, DitherPattern } from './bevels.js'

export { colorTokenKeys } from './colors.js'
export type { ColorTokens } from './colors.js'

export { fonts } from './fonts.js'
export type { FontDefinition, FontSystem } from './fonts.js'

export * from './icons/index.js'
export { defaultSpacing } from './spacing.js'

export type { SpacingTokens } from './spacing.js'

export type { Theme } from './theme.js'
export * from './themes/index.js'
