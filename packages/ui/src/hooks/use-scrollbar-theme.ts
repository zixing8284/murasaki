import { useEffect } from 'react'

const ARROW_PATHS = {
  up: { d: 'M4 0H3V1H2V2H1V3H0V4H7V3H6V2H5V1H4V0Z', w: 7, h: 4 },
  down: { d: 'M7 0H0V1H1V2H2V3H3V4H4V3H5V2H6V1H7V0Z', w: 7, h: 4 },
  left: { d: 'M0 3V4H1V5H2V6H3V7H4V0H3V1H2V2H1V3H0Z', w: 4, h: 7 },
  right: { d: 'M4 4V3H3V2H2V1H1V0H0V7H1V6H2V5H3V4H4Z', w: 4, h: 7 },
} as const

const CSS_PROPS = {
  up: '--scrollbar-arrow-up',
  down: '--scrollbar-arrow-down',
  left: '--scrollbar-arrow-left',
  right: '--scrollbar-arrow-right',
} as const

function rgbToHex(rgb: string): string {
  const nums = rgb.match(/\d+/g)
  if (!nums || nums.length < 3)
    return '000000'
  return nums.slice(0, 3).map(n => Number(n).toString(16).padStart(2, '0')).join('')
}

function buildArrowUri(arrow: typeof ARROW_PATHS[keyof typeof ARROW_PATHS], hexColor: string): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${arrow.w}' height='${arrow.h}' viewBox='0 0 ${arrow.w} ${arrow.h}'%3E%3Cpath fill='%23${hexColor}' d='${arrow.d}'/%3E%3C/svg%3E")`
}

/**
 * Syncs scrollbar arrow SVG colors with the current theme's `--button-text`
 * CSS variable. Called internally by ThemeProvider — not for direct use.
 *
 * Updates CSS custom properties (`--scrollbar-arrow-up/down/left/right`) on
 * `<html>` so scrollbar button rules in theme-config.css pick up the color.
 */
export function useScrollbarTheme(themeId: string): void {
  useEffect(() => {
    const el = document.documentElement
    const raw = getComputedStyle(el).getPropertyValue('--button-text').trim()
    if (!raw)
      return

    const hex = rgbToHex(raw)

    for (const [dir, prop] of Object.entries(CSS_PROPS)) {
      el.style.setProperty(prop, buildArrowUri(ARROW_PATHS[dir as keyof typeof ARROW_PATHS], hex))
    }

    return () => {
      for (const prop of Object.values(CSS_PROPS)) {
        el.style.removeProperty(prop)
      }
    }
  }, [themeId])
}
