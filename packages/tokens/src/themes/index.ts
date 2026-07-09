/**
 * Theme registry — all 19 named skins.
 * Each theme provides a complete set of ColorTokens.
 */

import type { ColorTokens } from '../colors.js'
import { brick } from './brick.js'
import { desert } from './desert.js'
import { eggplant } from './eggplant.js'
import { lilac } from './lilac.js'
import { maple } from './maple.js'
import { marine } from './marine.js'
import { plum } from './plum.js'
import { pumpkin } from './pumpkin.js'
import { rainyDay } from './rainy-day.js'
import { redWhiteAndBlue } from './red-white-and-blue.js'
import { rose } from './rose.js'
import { slate } from './slate.js'
import { spruce } from './spruce.js'
import { storm } from './storm.js'
import { teal } from './teal.js'
import { wheat } from './wheat.js'
import { windows95 } from './windows-95.js'
import { windows98 } from './windows-98.js'
import { windowsStandard } from './windows-standard.js'

export { brick } from './brick.js'
export { desert } from './desert.js'
export { eggplant } from './eggplant.js'
export { lilac } from './lilac.js'
export { maple } from './maple.js'
export { marine } from './marine.js'
export { plum } from './plum.js'
export { pumpkin } from './pumpkin.js'
export { rainyDay } from './rainy-day.js'
export { redWhiteAndBlue } from './red-white-and-blue.js'
export { rose } from './rose.js'
export { slate } from './slate.js'
export { spruce } from './spruce.js'
export { storm } from './storm.js'
export { teal } from './teal.js'
export { wheat } from './wheat.js'
export { windows95 } from './windows-95.js'
export { windows98 } from './windows-98.js'
export { windowsStandard } from './windows-standard.js'

/** Map of theme ID → color tokens. Theme IDs match `data-theme` attribute values. */
export const themes: Record<string, ColorTokens> = {
  'windows-98': windows98,
  'windows-95': windows95,
  'windows-standard': windowsStandard,
  'rainy-day': rainyDay,
  'red-white-and-blue': redWhiteAndBlue,
  brick,
  desert,
  eggplant,
  lilac,
  maple,
  marine,
  plum,
  pumpkin,
  rose,
  slate,
  spruce,
  storm,
  teal,
  wheat,
}

/** All registered theme IDs. */
export const themeIds = Object.keys(themes) as string[]
