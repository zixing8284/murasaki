// Shared Windows 98 scrollbar constants used by declarative ScrollArea parts
// and the legacy DOM-backed useScrollbar primitive.

/** Width of vertical bar / height used for horizontal button sizing */
export const BAR_SIZE = 16

/** Height of arrow buttons (and horizontal bar) */
export const BTN_HEIGHT = 17

/** Pixels scrolled per arrow click */
export const SCROLL_STEP = 40

/** Auto-repeat interval (ms) when holding an arrow button */
export const REPEAT_MS = 50

/** 2x2 checker image (use as backgroundImage) */
export const TRACK_BG_IMAGE = 'linear-gradient(45deg, var(--button-face) 25%, var(--button-hilight) 25% 50%, var(--button-face) 50% 75%, var(--button-hilight) 75%)'

/** Size for the checker gradient tiles */
export const TRACK_BG_SIZE = '2px 2px'

/** Fallback color behind the transparent checker tiles */
export const TRACK_BG_COLOR = 'var(--button-hilight)'

/** box-shadow for the scrollbar thumb, matching the Win98 raised button bevel */
export const THUMB_BOX_SHADOW = [
  'inset -1px -1px var(--button-dk-shadow)',
  'inset 1px 1px var(--button-light)',
  'inset -2px -2px var(--button-shadow)',
  'inset 2px 2px var(--button-hilight)',
].join(', ')
