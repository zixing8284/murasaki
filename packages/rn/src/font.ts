/**
 * Pixel font configuration for the Win98 aesthetic.
 *
 * The web library uses "Pixelated MS Sans Serif" which isn't available as a
 * standalone .ttf. For the RN prototype, we use "VT323" from Google Fonts as
 * a close pixel-font alternative.
 *
 * To enable:
 * 1. Download VT323-Regular.ttf from https://fonts.google.com/specimen/VT323
 * 2. Place in packages/rn/assets/fonts/VT323-Regular.ttf
 * 3. Uncomment the useFonts import and PIXEL_FONT below
 */

// import { useFonts } from 'expo-font'
// const PIXEL_FONT = {
//   'PixelatedMS Sans Serif': require('../assets/fonts/VT323-Regular.ttf'),
// }

/** Default font family — falls back to system monospace if pixel font isn't loaded. */
export const PIXEL_FONT_FAMILY = 'PixelatedMS Sans Serif'

/**
 * Hook to load the pixel font. Returns { loaded: true } if fonts are ready.
 * Currently returns loaded=true immediately as a stub — uncomment the real
 * implementation once the .ttf file is in assets/fonts/.
 */
export function usePixelFont(): { loaded: boolean; error: Error | null } {
  // Uncomment when font file is available:
  // const [loaded, error] = useFonts(PIXEL_FONT)
  // return { loaded, error }
  return { loaded: true, error: null }
}
