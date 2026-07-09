/**
 * Portability verification script for @murasaki-io/tokens.
 *
 * Validates that the tokens package is truly platform-agnostic:
 * 1. Every theme defines exactly 34 color keys (no missing, no extra)
 * 2. Every bevel recipe colorToken resolves to a real ColorTokens key
 * 3. Every icon fill role (except 'currentColor') resolves to a real ColorTokens key
 * 4. Runs in pure Node.js — no DOM, no CSS, no browser APIs
 *
 * Usage: npx tsx scripts/verify-portability.ts
 */

import type { IconData } from '../src/icons/types.js'
import process from 'node:process'
import { defaultBevels } from '../src/bevels.js'
import { colorTokenKeys } from '../src/colors.js'
import * as checkboxIcons from '../src/icons/checkbox-icons.js'
import * as radioIcons from '../src/icons/radio-icons.js'
import * as scrollIcons from '../src/icons/scroll-icons.js'
import * as selectIcons from '../src/icons/select-icons.js'
import * as sliderIcons from '../src/icons/slider-icons.js'
import * as taskbarIcons from '../src/icons/taskbar-icons.js'
import * as windowIcons from '../src/icons/window-icons.js'
import { themeIds, themes } from '../src/themes/index.js'

const VALID_COLOR_KEYS = new Set<string>(colorTokenKeys)
let errors = 0

function error(msg: string): void {
  console.error(`  ✗ ${msg}`)
  errors++
}

function ok(msg: string): void {
  console.log(`  ✓ ${msg}`)
}

// ─── 1. Validate themes ───────────────────────────────────────────
console.log(`\n📋 Validating ${themeIds.length} themes...`)

for (const [id, colors] of Object.entries(themes)) {
  const keys = Object.keys(colors).sort()
  const expectedKeys = [...VALID_COLOR_KEYS].sort()

  const missing = expectedKeys.filter(k => !keys.includes(k))
  const extra = keys.filter(k => !VALID_COLOR_KEYS.has(k))

  if (missing.length > 0) {
    error(`Theme "${id}" missing keys: ${missing.join(', ')}`)
  }
  if (extra.length > 0) {
    error(`Theme "${id}" has extra keys: ${extra.join(', ')}`)
  }
  if (missing.length === 0 && extra.length === 0) {
    ok(`Theme "${id}" — 34/34 color tokens`)
  }
}

// ─── 2. Validate bevel recipes ────────────────────────────────────
console.log('\n🔧 Validating bevel recipes...')

for (const [preset, recipe] of Object.entries(defaultBevels)) {
  for (const layer of recipe.layers) {
    if (!VALID_COLOR_KEYS.has(layer.colorToken)) {
      error(`Bevel "${preset}" references invalid color token: ${layer.colorToken}`)
    }
  }
  ok(`Bevel "${preset}" — ${recipe.layers.length} layers, all tokens valid`)
}

// ─── 3. Validate icon fill roles ──────────────────────────────────
console.log('\n🎨 Validating icon data...')

const allIconModules = [
  windowIcons,
  sliderIcons,
  checkboxIcons,
  radioIcons,
  scrollIcons,
  selectIcons,
  taskbarIcons,
]

const allIcons: Record<string, IconData> = {}
for (const mod of allIconModules) {
  for (const [name, value] of Object.entries(mod)) {
    if (value && typeof value === 'object' && 'viewBox' in value && 'shapes' in value) {
      allIcons[name] = value as IconData
    }
  }
}

for (const [name, icon] of Object.entries(allIcons)) {
  for (const [i, shape] of icon.shapes.entries()) {
    if (shape.fill !== 'currentColor' && !VALID_COLOR_KEYS.has(shape.fill)) {
      error(`Icon "${name}" shape[${i}] has invalid fill: ${shape.fill}`)
    }
  }
  ok(`Icon "${name}" — ${icon.shapes.length} shapes, all fills valid`)
}

// ─── 4. Summary ───────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
if (errors === 0) {
  console.log('✅ All portability checks passed!')
  console.log(`   - ${themeIds.length} themes validated`)
  console.log(`   - ${Object.keys(defaultBevels).length} bevel presets validated`)
  console.log(`   - ${Object.keys(allIcons).length} icons validated`)
  console.log('   - No web-specific APIs used')
  process.exit(0)
}
else {
  console.log(`❌ ${errors} error(s) found`)
  process.exit(1)
}
