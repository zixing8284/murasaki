/**
 * Desktop-local stacking order.
 *
 * Keep these values centralized so icon/drag/marquee layering changes happen
 * in one place instead of scattered magic numbers.
 */
export const DESKTOP_LAYER = {
  iconSelected: 1,
  iconDragging: 2,
  selectionMarquee: 3,
} as const
