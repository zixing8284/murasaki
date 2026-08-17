/**
 * Built-in wallpaper registry for the Display Properties dialog.
 *
 * Each entry maps a stable id to a public-root image path and a
 * human-readable label.  The special `none` entry represents a plain
 * desktop with no wallpaper image.
 */

export type WallpaperMode = 'tiled' | 'centered' | 'stretch' | 'fill'

export interface WallpaperEntry {
  id: string
  label: string
  /** Public-root path. Empty string means no image (solid background). */
  src: string
  defaultMode: WallpaperMode
}

export interface WallpaperSettings {
  id: string
  mode: WallpaperMode
}

const WALLPAPER_FILES = [
  'animspace.gif',
  'Ascent.jpg',
  'Autumn.jpg',
  'Azul.jpg',
  'Bliss.jpg',
  'BlueLace16.bmp',
  'CoffeeBean.bmp',
  'Crystal.jpg',
  'Energy_bliss.jpg',
  'FeatherTexture.bmp',
  'Follow.jpg',
  'Friend.jpg',
  'GoneFishing.bmp',
  'Greenstone.bmp',
  'Home.jpg',
  'Moon_flower.jpg',
  'Peace.jpg',
  'Power.jpg',
  'PrairieWind.bmp',
  'Purple_flower.jpg',
  'Radiance.jpg',
  'Red_moon_desert.jpg',
  'Rhododendron.bmp',
  'Ripple.jpg',
  'RiverSumida.bmp',
  'SantaFeStucco.bmp',
  'SoapBubbles.bmp',
  'stars.gif',
  'Stonehenge.jpg',
  'Tulips.jpg',
  'Vortec_space.jpg',
  'Wind.jpg',
  'Windows_XP_Professional.jpg',
  'Zapotec.bmp',
  'bluescreen.png',
  'boxes.png',
  'egypt.png',
  'honey.png',
  'leaves.png',
  'noise.gif',
  'purpleSquares.png',
  'rivets.png',
  'water.gif',
  'zigzag.png',
] as const

function getDefaultModeForFile(file: string): WallpaperMode {
  return /\.(?:bmp|gif|png)$/i.test(file) ? 'tiled' : 'centered'
}

function toWallpaperId(file: string): string {
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/(?<=[a-z0-9])[A-Z]/gi, match => `-${match}`)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function toWallpaperLabel(file: string): string {
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/(?<=[a-z0-9])[A-Z]/gi, match => ` ${match}`)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const WALLPAPERS: WallpaperEntry[] = [
  { id: 'none', label: '(None)', src: '', defaultMode: 'tiled' },
  ...WALLPAPER_FILES.map(file => ({
    id: toWallpaperId(file),
    label: toWallpaperLabel(file),
    src: `/wallpaper/${file}`,
    defaultMode: getDefaultModeForFile(file),
  })),
]

const DEFAULT_SETTINGS: WallpaperSettings = {
  id: 'none',
  mode: 'tiled',
}

export function getWallpaperEntry(id: string): WallpaperEntry | undefined {
  return WALLPAPERS.find(w => w.id === id)
}

export function getDefaultWallpaperSettings(): WallpaperSettings {
  return DEFAULT_SETTINGS
}

export const WALLPAPER_MODE_LABELS: Record<WallpaperMode, string> = {
  tiled: 'Tiled',
  centered: 'Centered',
  stretch: 'Stretch',
  fill: 'Fill',
}
