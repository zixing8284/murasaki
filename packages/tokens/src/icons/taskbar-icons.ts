/**
 * Taskbar expand arrow icon — platform-agnostic pixel-art data.
 * Source: packages/ui/src/components/taskbar/taskbar-icons.tsx
 *
 * This icon is pixel-art using individual 1×1 rects to form a double chevron.
 */

import type { IconData } from './types.js'

export const expandArrowIcon: IconData = {
  viewBox: [7, 9],
  shapes: [
    // First chevron
    { rect: { x: 0, y: 0, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 1, y: 1, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 2, y: 2, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 3, y: 3, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 4, y: 4, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 3, y: 5, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 2, y: 6, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 1, y: 7, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 0, y: 8, width: 1, height: 1 }, fill: 'currentColor' },
    // Second chevron
    { rect: { x: 3, y: 0, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 4, y: 1, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 5, y: 2, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 6, y: 3, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 6, y: 5, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 5, y: 6, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 4, y: 7, width: 1, height: 1 }, fill: 'currentColor' },
    { rect: { x: 3, y: 8, width: 1, height: 1 }, fill: 'currentColor' },
  ],
}
