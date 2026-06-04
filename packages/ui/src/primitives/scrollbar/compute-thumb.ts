import { BAR_SIZE } from './scrollbar-constants'

export interface ThumbMetrics {
  THUMB_SIZE: number
  THUMB_POS: number
}

/**
 * Compute scrollbar thumb size and position from native scroll metrics.
 *
 * @param trackSize  - available track length (px)
 * @param clientSize - viewport dimension (clientHeight or clientWidth)
 * @param scrollSize - total scrollable dimension (scrollHeight or scrollWidth)
 * @param scrollPos  - current scroll offset (scrollTop or scrollLeft)
 */
export function computeThumb(
  trackSize: number,
  clientSize: number,
  scrollSize: number,
  scrollPos: number,
): ThumbMetrics {
  const ratio = clientSize / scrollSize
  const thumbSize = Math.round(Math.max(BAR_SIZE, trackSize * ratio))
  const travel = trackSize - thumbSize
  const maxScroll = scrollSize - clientSize
  const thumbPos = maxScroll > 0
    ? Math.round(Math.max(0, Math.min(travel, (scrollPos / maxScroll) * travel)))
    : 0
  return { THUMB_SIZE: thumbSize, THUMB_POS: thumbPos }
}
