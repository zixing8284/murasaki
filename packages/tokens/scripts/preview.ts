/**
 * Quick preview of all tokens data.
 * Usage: npx tsx scripts/preview.ts
 */

import { defaultBevels } from '../src/bevels.js'
import { fonts } from '../src/fonts.js'
import { defaultSpacing } from '../src/spacing.js'
import { themeIds, themes } from '../src/themes/index.js'

console.log('=== @murasaki-io/tokens preview ===\n')

console.log(`Themes (${themeIds.length}): ${themeIds.join(', ')}\n`)

for (const id of themeIds) {
  const t = themes[id]!
  console.log(`[${id}]`)
  console.log(`  buttonFace:    ${t.buttonFace}`)
  console.log(`  activeTitle:   ${t.activeTitle}`)
  console.log(`  window:        ${t.window}`)
  console.log(`  background:    ${t.background}`)
  console.log()
}

console.log('Bevels:')
for (const [name, recipe] of Object.entries(defaultBevels)) {
  const layers = recipe.layers.map(l => `${l.colorToken}@${l.offset}`).join(', ')
  console.log(`  ${name}: ${recipe.layers.length} layers -- ${layers}`)
}

console.log('\nFonts:')
console.log(`  Primary: ${fonts.primary.family} (${fonts.defaultSize}px)`)
console.log(`  Symbol:  ${fonts.symbol.family}`)

console.log('\nSpacing:')
for (const [k, v] of Object.entries(defaultSpacing)) {
  console.log(`  ${k}: ${v}px`)
}
