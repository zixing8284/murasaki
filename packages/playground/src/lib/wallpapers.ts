/**
 * Built-in wallpaper registry for the Display Properties dialog.
 *
 * Each entry maps a stable id to a public-root image path and a
 * human-readable label.  The special `none` entry represents a plain
 * desktop with no wallpaper image.
 */

export type WallpaperMode = 'tiled' | 'centered' | 'stretch'

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

export const WALLPAPERS: WallpaperEntry[] = [
  { id: 'animspace', label: 'animspace', src: '/img/animspace.gif', defaultMode: 'tiled' },
  { id: 'stars', label: 'stars', src: '/img/stars.gif', defaultMode: 'tiled' },
  { id: 'none', label: '(None)', src: '', defaultMode: 'tiled' },
]

const DEFAULT_SETTINGS: WallpaperSettings = { id: 'animspace', mode: 'tiled' }

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
}
